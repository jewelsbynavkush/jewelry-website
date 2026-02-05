/**
 * Cart Merge Utility
 * 
 * Merges guest cart (sessionId-based) into user cart (userId-based)
 * Industry standard: Preserve guest cart items when user logs in/registers
 */

import Cart from '@/models/Cart';
import Product from '@/models/Product';
import { ECOMMERCE } from '@/lib/constants';
import mongoose from 'mongoose';

/**
 * Merges guest cart into user cart
 * 
 * Strategy:
 * - If user cart exists, merge guest items into it (combine quantities for same products)
 * - If user cart doesn't exist, convert guest cart to user cart
 * - Delete guest cart after successful merge
 * - Recalculate totals with current product prices
 * 
 * @param userId - User ID to merge cart for
 * @param sessionId - Guest session ID to merge from
 * @returns Merged cart document
 */
export async function mergeGuestCartToUser(
  userId: string,
  sessionId: string
): Promise<void> {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Fetch both carts in parallel for performance
  const [guestCart, userCart] = await Promise.all([
    Cart.findOne({ sessionId }).lean(),
    Cart.findOne({ userId: userObjectId }),
  ]);

  // Early return if no guest cart items to merge
  if (!guestCart || guestCart.items.length === 0) {
    return;
  }

  // If no user cart exists, convert guest cart to user cart
  // But first filter out inactive products
  if (!userCart) {
    // Filter out inactive products before converting
    const activeItems = [];
    for (const guestItem of guestCart.items) {
      const product = await Product.findById(guestItem.productId)
        .select('status')
        .lean();
      if (product && product.status === 'active') {
        activeItems.push(guestItem);
      }
    }

    // If no active items, don't create user cart
    if (activeItems.length === 0) {
      await Cart.deleteOne({ sessionId });
      return;
    }

    // Update guest cart with only active items, then convert to user cart
    await Cart.updateOne(
      { sessionId },
      {
        $set: {
          userId: userObjectId,
          items: activeItems,
        },
        $unset: {
          sessionId: '', // Remove sessionId to make it a user cart
          expiresAt: '', // Remove expiration for user carts
        },
      }
    );
    return;
  }

  // Merge guest cart items into user cart
  // Strategy: Combine quantities for same products, add new products
  for (const guestItem of guestCart.items) {
    const existingItemIndex = userCart.items.findIndex(
      (item) => item.productId.toString() === guestItem.productId.toString()
    );

    if (existingItemIndex >= 0) {
      // Combine quantities for same product to prevent duplicate cart entries
      const newQuantity = userCart.items[existingItemIndex].quantity + guestItem.quantity;
      userCart.items[existingItemIndex].quantity = newQuantity;
      
      // Update price to current product price (price may have changed)
      const product = await Product.findById(guestItem.productId)
        .select('price')
        .lean();
      if (product) {
        userCart.items[existingItemIndex].price = product.price;
        userCart.items[existingItemIndex].subtotal = product.price * newQuantity;
      } else {
        // Product no longer exists - use existing price
        userCart.items[existingItemIndex].subtotal =
          userCart.items[existingItemIndex].price * newQuantity;
      }
    } else {
      // Add new product to user cart only if it's still active and available
      const product = await Product.findById(guestItem.productId)
        .select('price status')
        .lean();
      
      if (product && product.status === 'active') {
        userCart.items.push({
          productId: guestItem.productId,
          sku: guestItem.sku,
          title: guestItem.title,
          image: guestItem.image,
          price: product.price, // Use current price
          quantity: guestItem.quantity,
          subtotal: product.price * guestItem.quantity,
        });
      }
      // Skip inactive or deleted products to keep cart synchronized with catalog
    }
  }

  // Recalculate totals with current pricing
  userCart.calculateTotals(ECOMMERCE.freeShippingThreshold, ECOMMERCE.defaultShippingCost);
  
  // Calculate tax if enabled
  if (ECOMMERCE.calculateTax && ECOMMERCE.taxRate > 0) {
    userCart.tax = Math.round(userCart.subtotal * ECOMMERCE.taxRate * 100) / 100;
    userCart.calculateTotals(ECOMMERCE.freeShippingThreshold, ECOMMERCE.defaultShippingCost);
  }

  // Persist merged cart to database for user account
  // Cart is now tied to user account instead of guest session
  await userCart.save();

  // Delete guest cart after successful merge
  await Cart.deleteOne({ sessionId });
}
