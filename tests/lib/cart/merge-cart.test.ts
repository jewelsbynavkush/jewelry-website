/**
 * Cart Merge Utility Tests
 * 
 * Tests for cart merge functionality:
 * - Merge guest cart into user cart
 * - Combine quantities for duplicate products
 * - Convert guest cart to user cart
 * - Handle edge cases
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { mergeGuestCartToUser } from '@/lib/cart/merge-cart';
import connectDB from '@/lib/mongodb';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import Category from '@/models/Category';
import User from '@/models/User';
import { createTestUser, createTestProduct } from '../../helpers/test-utils';

describe('mergeGuestCartToUser', () => {
  let testUser: any;
  let testCategory: any;
  let testProduct1: any;
  let testProduct2: any;
  let testProduct3: any;

  beforeEach(async () => {
    await connectDB();

    // Clean up carts from previous tests
    await Cart.deleteMany({});

    testCategory = await Category.create({
      name: 'Rings',
      slug: 'rings',
      displayName: 'Rings',
      image: 'https://example.com/rings.jpg',
      alt: 'Rings category',
      active: true,
    });

    testProduct1 = await Product.create(
      createTestProduct({
        categoryId: testCategory._id,
        price: 1000,
        inventory: { quantity: 10, reservedQuantity: 0, trackQuantity: true, allowBackorder: false },
      })
    );

    testProduct2 = await Product.create(
      createTestProduct({
        categoryId: testCategory._id,
        price: 2000,
        inventory: { quantity: 10, reservedQuantity: 0, trackQuantity: true, allowBackorder: false },
      })
    );

    testProduct3 = await Product.create(
      createTestProduct({
        categoryId: testCategory._id,
        price: 3000,
        inventory: { quantity: 10, reservedQuantity: 0, trackQuantity: true, allowBackorder: false },
      })
    );

    testUser = await User.create(createTestUser());
  });

  it('should convert guest cart to user cart when no user cart exists', async () => {
    const sessionId = 'test-session-1';
    await Cart.create({
      sessionId,
      items: [
        {
          productId: testProduct1._id,
          sku: testProduct1.sku,
          title: testProduct1.title,
          image: testProduct1.primaryImage || '',
          price: testProduct1.price,
          quantity: 2,
          subtotal: testProduct1.price * 2,
        },
      ],
      subtotal: testProduct1.price * 2,
      total: testProduct1.price * 2,
      currency: 'INR',
    });

    await mergeGuestCartToUser(testUser._id.toString(), sessionId);

    const userCart = await Cart.findOne({ userId: testUser._id });
    expect(userCart).toBeDefined();
    expect(userCart?.sessionId).toBeUndefined();
    expect(userCart?.items).toHaveLength(1);
    expect(userCart?.items[0].productId.toString()).toBe(testProduct1._id.toString());
    expect(userCart?.items[0].quantity).toBe(2);

    // Guest cart should be deleted
    const guestCart = await Cart.findOne({ sessionId });
    expect(guestCart).toBeNull();
  });

  it('should merge guest cart items into existing user cart', async () => {
    // Create user cart
    await Cart.create({
      userId: testUser._id,
      items: [
        {
          productId: testProduct1._id,
          sku: testProduct1.sku,
          title: testProduct1.title,
          image: testProduct1.primaryImage || '',
          price: testProduct1.price,
          quantity: 3,
          subtotal: testProduct1.price * 3,
        },
        {
          productId: testProduct2._id,
          sku: testProduct2.sku,
          title: testProduct2.title,
          image: testProduct2.primaryImage || '',
          price: testProduct2.price,
          quantity: 1,
          subtotal: testProduct2.price,
        },
      ],
      subtotal: testProduct1.price * 3 + testProduct2.price,
      total: testProduct1.price * 3 + testProduct2.price,
      currency: 'INR',
    });

    // Create guest cart
    const sessionId = 'test-session-2';
    await Cart.create({
      sessionId,
      items: [
        {
          productId: testProduct1._id,
          sku: testProduct1.sku,
          title: testProduct1.title,
          image: testProduct1.primaryImage || '',
          price: testProduct1.price,
          quantity: 2,
          subtotal: testProduct1.price * 2,
        },
        {
          productId: testProduct3._id,
          sku: testProduct3.sku,
          title: testProduct3.title,
          image: testProduct3.primaryImage || '',
          price: testProduct3.price,
          quantity: 1,
          subtotal: testProduct3.price,
        },
      ],
      subtotal: testProduct1.price * 2 + testProduct3.price,
      total: testProduct1.price * 2 + testProduct3.price,
      currency: 'INR',
    });

    await mergeGuestCartToUser(testUser._id.toString(), sessionId);

    const userCart = await Cart.findOne({ userId: testUser._id });
    expect(userCart?.items).toHaveLength(3);

    // Product1: quantities combined (3 + 2 = 5)
    const product1Item = userCart?.items.find(
      (item) => item.productId.toString() === testProduct1._id.toString()
    );
    expect(product1Item?.quantity).toBe(5);

    // Product2: kept from user cart
    const product2Item = userCart?.items.find(
      (item) => item.productId.toString() === testProduct2._id.toString()
    );
    expect(product2Item?.quantity).toBe(1);

    // Product3: added from guest cart
    const product3Item = userCart?.items.find(
      (item) => item.productId.toString() === testProduct3._id.toString()
    );
    expect(product3Item?.quantity).toBe(1);

    // Guest cart should be deleted
    const guestCart = await Cart.findOne({ sessionId });
    expect(guestCart).toBeNull();
  });

  it('should update prices to current product prices on merge', async () => {
    // Create user cart with old price
    await Cart.create({
      userId: testUser._id,
      items: [
        {
          productId: testProduct1._id,
          sku: testProduct1.sku,
          title: testProduct1.title,
          image: testProduct1.primaryImage || '',
          price: 500, // Old price
          quantity: 1,
          subtotal: 500,
        },
      ],
      subtotal: 500,
      total: 500,
      currency: 'INR',
    });

    // Create guest cart with same product
    const sessionId = 'test-session-3';
    await Cart.create({
      sessionId,
      items: [
        {
          productId: testProduct1._id,
          sku: testProduct1.sku,
          title: testProduct1.title,
          image: testProduct1.primaryImage || '',
          price: 1000, // Current price
          quantity: 1,
          subtotal: 1000,
        },
      ],
      subtotal: 1000,
      total: 1000,
      currency: 'INR',
    });

    await mergeGuestCartToUser(testUser._id.toString(), sessionId);

    const userCart = await Cart.findOne({ userId: testUser._id });
    const product1Item = userCart?.items.find(
      (item) => item.productId.toString() === testProduct1._id.toString()
    );
    // Price should be updated to current product price
    expect(product1Item?.price).toBe(testProduct1.price);
    expect(product1Item?.subtotal).toBe(testProduct1.price * 2); // 2 items * current price
  });

  it('should skip inactive products from guest cart', async () => {
    // Ensure no existing user cart from previous tests
    await Cart.deleteMany({ userId: testUser._id });

    // Create archived product (inactive)
    const inactiveProduct = await Product.create(
      createTestProduct({
        categoryId: testCategory._id,
        price: 5000,
        status: 'archived',
        inventory: { quantity: 10, reservedQuantity: 0, trackQuantity: true, allowBackorder: false },
      })
    );

    const sessionId = 'test-session-4';
    await Cart.create({
      sessionId,
      items: [
        {
          productId: inactiveProduct._id,
          sku: inactiveProduct.sku,
          title: inactiveProduct.title,
          image: inactiveProduct.primaryImage || '',
          price: inactiveProduct.price,
          quantity: 1,
          subtotal: inactiveProduct.price,
        },
        {
          productId: testProduct1._id,
          sku: testProduct1.sku,
          title: testProduct1.title,
          image: testProduct1.primaryImage || '',
          price: testProduct1.price,
          quantity: 1,
          subtotal: testProduct1.price,
        },
      ],
      subtotal: inactiveProduct.price + testProduct1.price,
      total: inactiveProduct.price + testProduct1.price,
      currency: 'INR',
    });

    await mergeGuestCartToUser(testUser._id.toString(), sessionId);

    const userCart = await Cart.findOne({ userId: testUser._id });
    // Only active product should be added
    expect(userCart?.items).toHaveLength(1);
    expect(userCart?.items[0].productId.toString()).toBe(testProduct1._id.toString());
  });

  it('should handle empty guest cart gracefully', async () => {
    const sessionId = 'test-session-5';
    await Cart.create({
      sessionId,
      items: [],
      subtotal: 0,
      total: 0,
      currency: 'INR',
    });

    await mergeGuestCartToUser(testUser._id.toString(), sessionId);

    // Should not create user cart if guest cart is empty
    const userCart = await Cart.findOne({ userId: testUser._id });
    expect(userCart).toBeNull();
  });

  it('should handle non-existent guest cart gracefully', async () => {
    const sessionId = 'non-existent-session';

    // Should not throw error
    await expect(
      mergeGuestCartToUser(testUser._id.toString(), sessionId)
    ).resolves.not.toThrow();
  });

  it('should recalculate totals after merge', async () => {
    await Cart.create({
      userId: testUser._id,
      items: [
        {
          productId: testProduct1._id,
          sku: testProduct1.sku,
          title: testProduct1.title,
          image: testProduct1.primaryImage || '',
          price: testProduct1.price,
          quantity: 1,
          subtotal: testProduct1.price,
        },
      ],
      subtotal: testProduct1.price,
      total: testProduct1.price,
      currency: 'INR',
    });

    const sessionId = 'test-session-6';
    await Cart.create({
      sessionId,
      items: [
        {
          productId: testProduct2._id,
          sku: testProduct2.sku,
          title: testProduct2.title,
          image: testProduct2.primaryImage || '',
          price: testProduct2.price,
          quantity: 1,
          subtotal: testProduct2.price,
        },
      ],
      subtotal: testProduct2.price,
      total: testProduct2.price,
      currency: 'INR',
    });

    await mergeGuestCartToUser(testUser._id.toString(), sessionId);

    const userCart = await Cart.findOne({ userId: testUser._id });
    expect(userCart?.subtotal).toBe(testProduct1.price + testProduct2.price);
    expect(userCart?.total).toBeGreaterThan(0);
  });
});
