/**
 * Inventory Service - Atomic Inventory Operations
 * 
 * Handles all inventory operations with proper concurrency control
 * Prevents race conditions and overselling
 */

import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import InventoryLog from '@/models/InventoryLog';
import mongoose from 'mongoose';
import { logError } from '@/lib/security/error-handler';
import { isTest } from '@/lib/utils/env';

/**
 * Identify transient MongoDB errors that should trigger retry logic
 * 
 * Transient errors occur due to lock contention or temporary database state changes.
 * Retrying these errors prevents false failures during concurrent operations.
 */
export function isTransientError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message;
    return (
      message.includes('Unable to acquire') ||
      message.includes('catalog changes') ||
      message.includes('Write conflict') ||
      message.includes('please retry') ||
      message.includes('has been aborted') ||
      message.includes('yielding is disabled')
    );
  }
  return false;
}

/**
 * Retry a function with exponential backoff for transient errors
 * 
 * In test environment, uses more retries and longer delays to handle
 * MongoDB Memory Server's 5ms lock timeout limitation.
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries?: number,
  initialDelay?: number
): Promise<T> {
  // Test environment (MongoDB Memory Server) has 5ms lock timeout, requiring more retries
  const testEnv = isTest();
  const defaultMaxRetries = testEnv ? 7 : 3;
  const defaultInitialDelay = testEnv ? 200 : 100;
  
  const finalMaxRetries = maxRetries ?? defaultMaxRetries;
  const finalInitialDelay = initialDelay ?? defaultInitialDelay;
  
  let lastError: unknown;
  for (let attempt = 0; attempt < finalMaxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (isTransientError(error) && attempt < finalMaxRetries - 1) {
        const delay = finalInitialDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

/**
 * Reserve stock for cart (atomic operation)
 * 
 * This function uses MongoDB's atomic operations to prevent race conditions.
 * Multiple users can safely add items to cart simultaneously.
 * 
 * @param productId - Product ID
 * @param quantity - Quantity to reserve
 * @param userId - User ID (optional, for logging)
 * @returns Object with success status and updated product
 */
export async function reserveStockForCart(
  productId: string,
  quantity: number,
  userId?: string
): Promise<{ success: boolean; product?: { _id: unknown; sku: string; title: string; inventory: { quantity: number; reservedQuantity: number } }; error?: string }> {
  // Test environment (MongoDB Memory Server) has 5ms lock timeout, requiring retries
  return await retryWithBackoff(async () => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await connectDB();

      // Prevents race conditions when multiple users add same item to cart simultaneously
      const product = await Product.reserveStock(productId, quantity, session);

      if (!product) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          error: 'Product is no longer available',
        };
      }

      // Create audit log entry for stock reservation
      // Tracks who reserved stock and when for inventory management
      await InventoryLog.create([{
        productId: product._id,
        productSku: product.sku,
        productTitle: product.title,
        type: 'reserved',
        quantity: quantity,
        previousQuantity: product.inventory.quantity - product.inventory.reservedQuantity + quantity,
        newQuantity: product.inventory.quantity - product.inventory.reservedQuantity,
        performedBy: {
          userId: userId ? new mongoose.Types.ObjectId(userId) : undefined,
          type: userId ? 'customer' : 'system',
        },
      }], { session });

      await session.commitTransaction();
      session.endSession();

      return {
        success: true,
        product: product.toObject(),
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      
      // Re-throw transient errors to trigger retry
      if (isTransientError(error)) {
        throw error;
      }
      
      logError('reserveStockForCart', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reserve stock',
      };
    }
  });
}

/**
 * Release reserved stock (when item removed from cart or cart expires)
 * 
 * @param productId - Product ID
 * @param quantity - Quantity to release
 * @param userId - User ID (optional)
 */
export async function releaseReservedStock(
  productId: string,
  quantity: number,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await connectDB();

    // Use Product static method for atomic stock release
    // Ensures reserved quantity is correctly restored when cart item removed
    const product = await Product.releaseReservedStock(productId, quantity, session);

    if (!product) {
      await session.abortTransaction();
      return { success: false, error: 'Product not found' };
    }

    // Create audit log entry for stock release
    // Records when reserved stock is returned to available inventory
    await InventoryLog.create([{
      productId: product._id,
      productSku: product.sku,
      productTitle: product.title,
      type: 'released',
      quantity: -quantity,
      previousQuantity: product.inventory.quantity - product.inventory.reservedQuantity - quantity,
      newQuantity: product.inventory.quantity - product.inventory.reservedQuantity,
      performedBy: {
        userId: userId ? new mongoose.Types.ObjectId(userId) : undefined,
        type: userId ? 'customer' : 'system',
      },
    }], { session });

    await session.commitTransaction();
    return { success: true };
  } catch (error) {
    await session.abortTransaction();
    logError('releaseStockFromCart', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to release stock',
    };
  } finally {
    session.endSession();
  }
}

/**
 * Confirm order and convert reservation to sale (atomic)
 * 
 * This is called when order is confirmed/paid.
 * Converts reserved quantity to actual sale.
 * 
 * @param orderItems - Array of order items with productId and quantity
 * @param orderId - Order ID for logging
 * @param idempotencyKey - Optional idempotency key to prevent duplicate processing
 * @returns Success status and updated products
 */
export async function confirmOrderAndUpdateStock(
  orderItems: Array<{ productId: string; quantity: number; sku: string }>,
  orderId: string,
  idempotencyKey?: string,
  existingSession?: mongoose.ClientSession
): Promise<{ success: boolean; error?: string; products?: Array<{ _id: unknown; sku: string; title: string; inventory: { quantity: number; reservedQuantity: number } }> }> {
  // Ensure connection before retry loop
  await connectDB();
  
  // Use default retry settings (automatically adjusted for test environment)
  return await retryWithBackoff(async () => {
    const session = existingSession || await mongoose.startSession();
    const shouldStartTransaction = !existingSession;
    if (shouldStartTransaction) {
      session.startTransaction();
    }

    try {

    // Check idempotency key to prevent duplicate order processing
    // Critical for handling retried API calls without double-charging or overselling
    // Check if any item for this order has already been processed
    if (idempotencyKey) {
      const existingLog = await InventoryLog.findOne({ 
        orderId: new mongoose.Types.ObjectId(orderId),
        type: 'sale'
      }).session(session);
      if (existingLog) {
        // Order already processed - return success without re-processing (idempotent)
        if (shouldStartTransaction) {
          await session.abortTransaction();
          session.endSession();
        }
        return { success: true, products: [] };
      }
    }

    const updatedProducts = [];

    // Process each order item atomically to prevent partial order fulfillment
    for (const item of orderItems) {
      // First, check if stock is already reserved (from cart)
      // If not reserved, we need to reserve it first, then confirm
      const currentProduct = await Product.findById(item.productId).session(session).lean();
      if (!currentProduct) {
        if (shouldStartTransaction) {
          await session.abortTransaction();
          session.endSession();
        }
        return {
          success: false,
          error: `Product ${item.sku} not found`,
        };
      }

      // If stock is not reserved, reserve it first (for direct order creation without cart reservation)
      if (currentProduct.inventory.reservedQuantity < item.quantity) {
        // Reserve the additional quantity needed
        const reserveQuantity = item.quantity - currentProduct.inventory.reservedQuantity;
        const reserved = await Product.reserveStock(item.productId, reserveQuantity, session);
        if (!reserved) {
          if (shouldStartTransaction) {
            await session.abortTransaction();
            session.endSession();
          }
          return {
            success: false,
            error: `Insufficient stock for ${item.sku}`,
          };
        }
      }

      // Use Product static method for atomic stock confirmation
      // Converts reserved stock to sold, preventing overselling
      const product = await Product.confirmSale(item.productId, item.quantity, session);

      if (!product) {
        if (shouldStartTransaction) {
          await session.abortTransaction();
          session.endSession();
        }
        return {
          success: false,
          error: `Product ${item.sku} not found or insufficient reserved stock`,
        };
      }

      // Update product status to 'out_of_stock' when inventory depleted
      // Only if tracking is enabled and backorders are not allowed
      if (product.inventory.trackQuantity && 
          product.inventory.quantity === 0 && 
          !product.inventory.allowBackorder) {
        product.status = 'out_of_stock';
        await product.save({ session });
      }

      // Create audit log entry with idempotency key for order confirmation
      // Links inventory change to specific order for traceability
      await InventoryLog.create([{
        productId: product._id,
        productSku: product.sku,
        productTitle: product.title,
        type: 'sale',
        quantity: -item.quantity,
        previousQuantity: product.inventory.quantity + item.quantity,
        newQuantity: product.inventory.quantity,
        orderId: new mongoose.Types.ObjectId(orderId),
        idempotencyKey: idempotencyKey ? `${idempotencyKey}-${item.productId}` : undefined,
        performedBy: {
          type: 'system',
          name: 'Order Confirmation',
        },
      }], { session });

      updatedProducts.push(product.toObject());
    }

      if (shouldStartTransaction) {
        await session.commitTransaction();
        session.endSession();
      }
      return { success: true, products: updatedProducts };
    } catch (error) {
      // Clean up session on error
      if (shouldStartTransaction && session.inTransaction()) {
        try {
          await session.abortTransaction();
        } catch {
          // Ignore abort errors (session might already be aborted)
        }
      }
      if (shouldStartTransaction) {
        try {
          session.endSession();
        } catch {
          // Ignore end session errors
        }
      }
      // Re-throw transient errors to trigger retry
      // This includes MongoDB lock timeouts and write conflicts
      if (isTransientError(error)) {
        throw error;
      }
      logError('confirmOrderAndUpdateStock', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to confirm order stock',
      };
    }
  });
}

/**
 * Cancel order and restore stock
 * 
 * @param orderItems - Array of order items
 * @param orderId - Order ID
 */
export async function cancelOrderAndRestoreStock(
  orderItems: Array<{ productId: string; quantity: number; sku: string }>,
  orderId: string,
  idempotencyKey?: string,
  existingSession?: mongoose.ClientSession
): Promise<{ success: boolean; error?: string }> {
  // Ensure connection before retry loop
  await connectDB();
  
  return await retryWithBackoff(async () => {
    const session = existingSession || await mongoose.startSession();
    const shouldStartTransaction = !existingSession;
    if (shouldStartTransaction) {
      session.startTransaction();
    }

    try {

    // Check idempotency key to prevent duplicate stock restoration
    // Critical when order cancellation is retried due to network issues
    if (idempotencyKey) {
      const existingLog = await InventoryLog.findOne({ 
        idempotencyKey: `${idempotencyKey}-order-cancellation`,
        type: 'return' 
      }).session(session);
      if (existingLog) {
        // Use logError for consistent logging
        const { logError } = await import('@/lib/security/error-handler');
        logError('inventory-service: idempotency key already processed', new Error(`Idempotency key ${idempotencyKey} already processed for order cancellation`));
        if (shouldStartTransaction) {
          await session.abortTransaction();
          session.endSession();
        }
        return { success: true }; // Already processed
      }
    }

    for (const item of orderItems) {
      // Use Product static method for atomic stock restoration
      // Returns sold stock back to available inventory when order cancelled
      const product = await Product.restoreStock(item.productId, item.quantity, session);

      if (!product) {
        if (shouldStartTransaction) {
          await session.abortTransaction();
          session.endSession();
        }
        return { success: false, error: `Product ${item.sku} not found` };
      }

      // Update product status from 'out_of_stock' to 'active' when inventory restored
      // Makes product visible again after stock is returned from cancelled order
      if (product.status === 'out_of_stock' && product.inventory.quantity > 0) {
        product.status = 'active';
        await product.save({ session });
      }

      // Create audit log entry for stock return
      // Records inventory restoration when order is cancelled
      const previousQuantity = Math.max(0, product.inventory.quantity - item.quantity);
      await InventoryLog.create([{
        productId: product._id,
        productSku: product.sku,
        productTitle: product.title,
        type: 'return',
        quantity: item.quantity,
        previousQuantity: previousQuantity,
        newQuantity: product.inventory.quantity,
        orderId: new mongoose.Types.ObjectId(orderId),
        reason: 'Order cancelled',
        performedBy: {
          type: 'system',
          name: 'Order Cancellation',
        },
        idempotencyKey: idempotencyKey ? `${idempotencyKey}-order-cancellation` : undefined,
      }], { session });
    }

      if (shouldStartTransaction) {
        await session.commitTransaction();
        session.endSession();
      }
      return { success: true };
    } catch (error) {
      // Clean up session on error
      if (shouldStartTransaction && session.inTransaction()) {
        try {
          await session.abortTransaction();
        } catch {
          // Ignore abort errors (session might already be aborted)
        }
      }
      if (shouldStartTransaction) {
        try {
          session.endSession();
        } catch {
          // Ignore end session errors
        }
      }
      // Re-throw transient errors to trigger retry
      if (isTransientError(error)) {
        throw error;
      }
      logError('cancelOrderAndRestoreStock', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel order stock',
      };
    }
  });
}

/**
 * Restock product (admin operation)
 * 
 * @param productId - Product ID
 * @param quantity - Quantity to add
 * @param reason - Reason for restock
 * @param userId - Admin user ID
 */
export async function restockProduct(
  productId: string,
  quantity: number,
  reason?: string,
  userId?: string,
  idempotencyKey?: string
): Promise<{ success: boolean; product?: { _id: unknown; sku: string; title: string; inventory: { quantity: number; reservedQuantity: number }; status: string }; error?: string }> {
  // Ensure connection before retry loop
  await connectDB();
  
  // Uses default retry settings (automatically adjusted for test environment)
  return await retryWithBackoff(async () => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {

    // Check idempotency key to prevent duplicate restocking
    // Prevents accidental double-restocking when admin action is retried
    if (idempotencyKey) {
      const existingLog = await InventoryLog.findOne({ 
        idempotencyKey: `${idempotencyKey}-restock`,
        type: 'restock' 
      }).session(session);
      if (existingLog) {
        // Already processed - return current product state
        const product = await Product.findById(productId).session(session);
        if (!product) {
          await session.abortTransaction();
          session.endSession();
          return { success: false, error: 'Product not found' };
        }
        await session.abortTransaction();
        session.endSession();
        return { 
          success: true, 
          product: {
            _id: product._id,
            sku: product.sku,
            title: product.title,
            inventory: {
              quantity: product.inventory.quantity,
              reservedQuantity: product.inventory.reservedQuantity,
            },
            status: product.status,
          }
        };
      }
    }

      // Use Product static method for atomic stock addition
      // Ensures inventory updates are consistent even with concurrent operations
      const product = await Product.restock(productId, quantity, session);

      if (!product) {
        await session.abortTransaction();
        session.endSession();
        return { success: false, error: 'Product not found' };
      }

      // Update product status from 'out_of_stock' to 'active' when inventory added
      // Makes product available for purchase again after manual restocking
      if (product.status === 'out_of_stock' && product.inventory.quantity > 0) {
        product.status = 'active';
        await product.save({ session });
      }

      // Create audit log entry for manual restocking
      // Records admin inventory adjustments for tracking and compliance
      const previousQuantity = Math.max(0, product.inventory.quantity - quantity);
      await InventoryLog.create([{
        productId: product._id,
        productSku: product.sku,
        productTitle: product.title,
        type: 'restock',
        quantity: quantity,
        previousQuantity: previousQuantity,
        newQuantity: product.inventory.quantity,
        reason: reason || 'Manual restock',
        performedBy: {
          userId: userId ? new mongoose.Types.ObjectId(userId) : undefined,
          type: userId ? 'admin' : 'system',
        },
        idempotencyKey: idempotencyKey ? `${idempotencyKey}-restock` : undefined,
      }], { session });

      await session.commitTransaction();
      session.endSession();
      return { 
        success: true, 
        product: {
          _id: product._id,
          sku: product.sku,
          title: product.title,
          inventory: {
            quantity: product.inventory.quantity,
            reservedQuantity: product.inventory.reservedQuantity,
          },
          status: product.status,
        }
      };
    } catch (error) {
      // Clean up session on error
      if (session.inTransaction()) {
        try {
          await session.abortTransaction();
        } catch {
          // Ignore abort errors (session might already be aborted)
        }
      }
      try {
        session.endSession();
      } catch {
        // Ignore end session errors
      }
      // Re-throw transient errors to trigger retry
      if (isTransientError(error)) {
        throw error;
      }
      logError('restockProduct', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to restock product',
      };
    }
  }); // Uses default retry settings (automatically adjusted for test environment)
}

/**
 * Check if product can be purchased (non-blocking check)
 * 
 * This is a read-only check. Use reserveStockForCart() for actual reservation.
 * 
 * @param productId - Product ID
 * @param quantity - Quantity to check
 * @returns Availability status
 */
export async function checkProductAvailability(
  productId: string,
  quantity: number = 1
): Promise<{ available: boolean; availableQuantity: number; canBackorder: boolean }> {
  try {
    await connectDB();

    const product = await Product.findById(productId).lean();

    if (!product || product.status !== 'active') {
      return { available: false, availableQuantity: 0, canBackorder: false };
    }

    if (!product.inventory.trackQuantity) {
      return { available: true, availableQuantity: Infinity, canBackorder: false };
    }

    const availableQuantity = Math.max(0, product.inventory.quantity - product.inventory.reservedQuantity);
    const canBackorder = product.inventory.allowBackorder;

    return {
      available: availableQuantity >= quantity || canBackorder,
      availableQuantity,
      canBackorder,
    };
  } catch (error) {
    logError('checkProductAvailability', error);
    return { available: false, availableQuantity: 0, canBackorder: false };
  }
}

/**
 * Get inventory summary for a product
 * 
 * @param productId - Product ID
 * @returns Inventory summary
 */
export async function getInventorySummary(productId: string) {
  try {
    await connectDB();

    const product = await Product.findById(productId).lean();

    if (!product) {
      return null;
    }

    const availableQuantity = Math.max(0, product.inventory.quantity - product.inventory.reservedQuantity);
    const isLowStock = product.inventory.trackQuantity && 
                       availableQuantity <= product.inventory.lowStockThreshold && 
                       availableQuantity > 0;
    const isOutOfStock = product.inventory.trackQuantity && 
                         availableQuantity === 0 && 
                         !product.inventory.allowBackorder;

    return {
      quantity: product.inventory.quantity, // Use 'quantity' for consistency with tests
      totalQuantity: product.inventory.quantity, // Keep for backward compatibility
      reservedQuantity: product.inventory.reservedQuantity,
      availableQuantity,
      isLowStock,
      isOutOfStock,
      canPurchase: availableQuantity > 0 || product.inventory.allowBackorder,
      trackQuantity: product.inventory.trackQuantity,
      allowBackorder: product.inventory.allowBackorder,
      lowStockThreshold: product.inventory.lowStockThreshold,
    };
  } catch (error) {
    logError('getInventorySummary', error);
    return null;
  }
}
