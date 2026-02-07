/**
 * Cart Model Tests
 * 
 * Tests for Cart model:
 * - Schema validation
 * - Totals calculation
 * - Guest cart support
 * - Item management
 * - Edge cases
 */

import { describe, it, expect, beforeEach } from 'vitest';
import connectDB from '@/lib/mongodb';
import Cart from '@/models/Cart';
import User from '@/models/User';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { createTestCart, createTestUser, createTestProduct, randomObjectId } from '../helpers/test-utils';

describe('Cart Model', () => {
  let testUser: any;
  let testProduct: any;
  let testCategory: any;

  beforeEach(async () => {
    await connectDB();

    // Create test category
    testCategory = await Category.create({
      name: 'Rings',
      slug: 'rings',
      displayName: 'Rings',
      image: 'https://example.com/rings.jpg',
      alt: 'Rings category',
      active: true,
    });

    // Create test product
    testProduct = await Product.create(
      createTestProduct({
        categoryId: testCategory._id,
      })
    );

    // Create test user
    testUser = await User.create(createTestUser());
  });

  describe('Schema Validation', () => {
    it('should create a cart with valid data', async () => {
      const cartData = createTestCart({
        userId: testUser._id,
        items: [
          {
            productId: testProduct._id,
            sku: testProduct.sku,
            title: testProduct.title,
            image: testProduct.primaryImage || '',
            price: testProduct.price,
            quantity: 1,
            subtotal: testProduct.price,
          },
        ],
      });

      const cart = await Cart.create(cartData);

      expect(cart).toBeDefined();
      expect(cart.userId?.toString()).toBe(testUser._id.toString());
      expect(cart.items.length).toBe(1);
    });

    it('should create guest cart with sessionId', async () => {
      const sessionId = randomObjectId().toString();
      const cartData = createTestCart({
        userId: undefined, // Explicitly remove userId for guest cart
        sessionId,
        items: [
          {
            productId: testProduct._id,
            sku: testProduct.sku,
            title: testProduct.title,
            image: testProduct.primaryImage || '',
            price: testProduct.price,
            quantity: 1,
            subtotal: testProduct.price,
          },
        ],
      });

      const cart = await Cart.create(cartData);

      expect(cart).toBeDefined();
      expect(cart.sessionId).toBe(sessionId);
      expect(cart.userId).toBeUndefined();
    });

    it('should require either userId or sessionId', async () => {
      const cartData = createTestCart();
      delete (cartData as any).userId;
      delete (cartData as any).sessionId;

      await expect(Cart.create(cartData)).rejects.toThrow();
    });

    it('should enforce unique sessionId for guest carts', async () => {
      const sessionId = randomObjectId().toString();

      await Cart.create(
        createTestCart({
          userId: undefined, // Explicitly remove userId for guest cart
          sessionId,
          items: [
            {
              productId: testProduct._id,
              sku: testProduct.sku,
              title: testProduct.title,
              image: testProduct.primaryImage || '',
              price: testProduct.price,
              quantity: 1,
              subtotal: testProduct.price,
            },
          ],
        })
      );

      const cart2 = createTestCart({
        userId: undefined, // Explicitly remove userId for guest cart
        sessionId,
        items: [
          {
            productId: testProduct._id,
            sku: testProduct.sku,
            title: testProduct.title,
            image: testProduct.primaryImage || '',
            price: testProduct.price,
            quantity: 1,
            subtotal: testProduct.price,
          },
        ],
      });

      await expect(Cart.create(cart2)).rejects.toThrow();
    });
  });

  describe('Totals Calculation', () => {
    it('should calculate totals correctly', async () => {
      const cart = await Cart.create(
        createTestCart({
          userId: testUser._id,
          items: [
            {
              productId: testProduct._id,
              sku: testProduct.sku,
              title: testProduct.title,
              image: testProduct.primaryImage || '',
              price: 1000,
              quantity: 2,
              subtotal: 2000,
            },
          ],
        })
      );

      cart.calculateTotals();

      expect(cart.subtotal).toBe(2000);
      expect(cart.total).toBe(2000);
    });

    it('should calculate totals with tax', async () => {
      const cart = await Cart.create(
        createTestCart({
          userId: testUser._id,
          items: [
            {
              productId: testProduct._id,
              sku: testProduct.sku,
              title: testProduct.title,
              image: testProduct.primaryImage || '',
              price: 1000,
              quantity: 1,
              subtotal: 1000,
            },
          ],
        })
      );

      cart.tax = 180; // 18% GST
      cart.calculateTotals();

      expect(cart.subtotal).toBe(1000);
      expect(cart.tax).toBe(180);
      expect(cart.total).toBe(1180);
    });

    it('should calculate totals with shipping', async () => {
      const cart = await Cart.create(
        createTestCart({
          userId: testUser._id,
          items: [
            {
              productId: testProduct._id,
              sku: testProduct.sku,
              title: testProduct.title,
              image: testProduct.primaryImage || '',
              price: 1000,
              quantity: 1,
              subtotal: 1000,
            },
          ],
        })
      );

      cart.shipping = 50;
      cart.calculateTotals();

      expect(cart.subtotal).toBe(1000);
      expect(cart.shipping).toBe(50);
      expect(cart.total).toBe(1050);
    });

    it('should calculate totals with discount', async () => {
      const cart = await Cart.create(
        createTestCart({
          userId: testUser._id,
          items: [
            {
              productId: testProduct._id,
              sku: testProduct.sku,
              title: testProduct.title,
              image: testProduct.primaryImage || '',
              price: 1000,
              quantity: 1,
              subtotal: 1000,
            },
          ],
        })
      );

      cart.discount = 100;
      cart.calculateTotals();

      expect(cart.subtotal).toBe(1000);
      expect(cart.discount).toBe(100);
      expect(cart.total).toBe(900);
    });

    it('should calculate totals with all components', async () => {
      const cart = await Cart.create(
        createTestCart({
          userId: testUser._id,
          items: [
            {
              productId: testProduct._id,
              sku: testProduct.sku,
              title: testProduct.title,
              image: testProduct.primaryImage || '',
              price: 1000,
              quantity: 2,
              subtotal: 2000,
            },
          ],
        })
      );

      cart.tax = 360;
      cart.shipping = 50;
      cart.discount = 100;
      cart.calculateTotals();

      expect(cart.subtotal).toBe(2000);
      expect(cart.tax).toBe(360);
      expect(cart.shipping).toBe(50);
      expect(cart.discount).toBe(100);
      expect(cart.total).toBe(2310);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty cart', async () => {
      const cart = await Cart.create(
        createTestCart({
          userId: testUser._id,
          items: [],
        })
      );

      cart.calculateTotals();

      expect(cart.subtotal).toBe(0);
      expect(cart.total).toBe(0);
    });

    it('should handle negative discount', async () => {
      const cart = await Cart.create(
        createTestCart({
          userId: testUser._id,
          items: [
            {
              productId: testProduct._id,
              sku: testProduct.sku,
              title: testProduct.title,
              image: testProduct.primaryImage || '',
              price: 1000,
              quantity: 1,
              subtotal: 1000,
            },
          ],
        })
      );

      cart.discount = -100;
      cart.calculateTotals();

      // Discount should not be negative in final calculation
      expect(cart.total).toBeGreaterThanOrEqual(1000);
    });

    it('should handle invalid productId in items', async () => {
      const fakeProductId = randomObjectId();
      const cartData = createTestCart({
        userId: testUser._id,
        items: [
          {
            productId: fakeProductId,
            sku: 'FAKE-SKU',
            title: 'Fake Product',
            image: '',
            price: 1000,
            quantity: 1,
            subtotal: 1000,
          },
        ],
      });

      await expect(Cart.create(cartData)).rejects.toThrow();
    });
  });
});
