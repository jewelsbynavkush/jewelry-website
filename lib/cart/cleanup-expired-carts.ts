/**
 * Expired Cart Cleanup Utility
 * 
 * E-commerce best practice: Release reserved stock from expired carts
 * 
 * MongoDB TTL indexes automatically delete expired carts, but they don't trigger hooks.
 * This utility should be run periodically (e.g., via cron job) to release stock
 * from carts that are about to expire before they're deleted by TTL.
 * 
 * Recommended: Run every 6-12 hours to clean up expired carts and release stock
 */

import connectDB from '@/lib/mongodb';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import { releaseReservedStock } from '@/lib/inventory/inventory-service';
import { logError } from '@/lib/security/error-handler';

/**
 * Clean up expired carts and release reserved stock
 * 
 * @param expirationBufferHours - Hours before expiration to consider cart as "expiring" (default: 1 hour)
 * @returns Cleanup statistics
 */
export async function cleanupExpiredCarts(
  expirationBufferHours: number = 1
): Promise<{
  processed: number;
  stockReleased: number;
  errors: number;
}> {
  await connectDB();

  const stats = {
    processed: 0,
    stockReleased: 0,
    errors: 0,
  };

  try {
    // Find carts that are expired or about to expire
    // Buffer ensures we process carts before TTL deletes them
    const expirationThreshold = new Date(
      Date.now() + expirationBufferHours * 60 * 60 * 1000
    );

    // E-commerce best practice: Only guest carts expire
    // User carts (with userId) should never expire
    const expiredCarts = await Cart.find({
      expiresAt: { $lte: expirationThreshold, $exists: true }, // Only carts with expiration date
      userId: { $exists: false }, // Only guest carts (no userId)
      items: { $exists: true, $ne: [] }, // Only process carts with items
    }).lean();

    for (const cart of expiredCarts) {
      try {
        // Release stock for all items in expired cart
        for (const item of cart.items) {
          if (item.productId) {
            const product = await Product.findById(item.productId)
              .select('inventory.trackQuantity')
              .lean();

            if (product?.inventory.trackQuantity) {
              await releaseReservedStock(
                item.productId.toString(),
                item.quantity,
                cart.userId?.toString()
              );
              stats.stockReleased += item.quantity;
            }
          }
        }

        // Delete expired cart (TTL will also delete it, but manual deletion ensures cleanup)
        await Cart.deleteOne({ _id: cart._id });
        stats.processed++;
      } catch (error) {
        stats.errors++;
        logError('cleanupExpiredCarts: error processing cart', error);
      }
    }

    return stats;
  } catch (error) {
    logError('cleanupExpiredCarts', error);
    throw error;
  }
}

/**
 * Clean up a specific expired cart by ID
 * Useful for manual cleanup or testing
 * 
 * @param cartId - Cart ID to clean up
 */
export async function cleanupExpiredCart(cartId: string): Promise<void> {
  await connectDB();

  const cart = await Cart.findById(cartId).lean();

  if (!cart || !cart.expiresAt || cart.expiresAt > new Date()) {
    return; // Cart doesn't exist or hasn't expired
  }

  // Release stock for all items
  for (const item of cart.items) {
    if (item.productId) {
      const product = await Product.findById(item.productId)
        .select('inventory.trackQuantity')
        .lean();

      if (product?.inventory.trackQuantity) {
        await releaseReservedStock(
          item.productId.toString(),
          item.quantity,
          cart.userId?.toString()
        );
      }
    }
  }

  // Delete cart
  await Cart.deleteOne({ _id: cart._id });
}
