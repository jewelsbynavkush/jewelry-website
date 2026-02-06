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

  const [guestCart, userCart] = await Promise.all([
    Cart.findOne({ sessionId }).lean(),
    Cart.findOne({ userId: userObjectId }),
  ]);

  if (!guestCart || guestCart.items.length === 0) {
    return;
  }

  // Filter out inactive products before converting guest cart to user cart
  if (!userCart) {
    const activeItems = [];
    for (const guestItem of guestCart.items) {
      const product = await Product.findById(guestItem.productId)
        .select('status')
        .lean();
      if (product && product.status === 'active') {
        activeItems.push(guestItem);
      }
    }

    if (activeItems.length === 0) {
      await Cart.deleteOne({ sessionId });
      return;
    }

    await Cart.updateOne(
      { sessionId },
      {
        $set: {
          userId: userObjectId,
          items: activeItems,
        },
        $unset: {
          sessionId: '',
          expiresAt: '',
        },
      }
    );
    return;
  }

  // Strategy: Combine quantities for same products, add new products
  for (const guestItem of guestCart.items) {
    const existingItemIndex = userCart.items.findIndex(
      (item) => item.productId.toString() === guestItem.productId.toString()
    );

    if (existingItemIndex >= 0) {
      // Prevents duplicate cart entries
      const newQuantity = userCart.items[existingItemIndex].quantity + guestItem.quantity;
      userCart.items[existingItemIndex].quantity = newQuantity;
      
      // Price may have changed since item was added to cart
      const product = await Product.findById(guestItem.productId)
        .select('price')
        .lean();
      if (product) {
        userCart.items[existingItemIndex].price = product.price;
        userCart.items[existingItemIndex].subtotal = product.price * newQuantity;
      } else {
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

  userCart.calculateTotals(ECOMMERCE.freeShippingThreshold, ECOMMERCE.defaultShippingCost);
  
  if (ECOMMERCE.calculateTax && ECOMMERCE.taxRate > 0) {
    userCart.tax = Math.round(userCart.subtotal * ECOMMERCE.taxRate * 100) / 100;
    userCart.calculateTotals(ECOMMERCE.freeShippingThreshold, ECOMMERCE.defaultShippingCost);
  }

  // Cart is now tied to user account instead of guest session
  await userCart.save();

  await Cart.deleteOne({ sessionId });
}
