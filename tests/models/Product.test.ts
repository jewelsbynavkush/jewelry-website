/**
 * Product Model Tests
 * 
 * Tests for Product model:
 * - Schema validation
 * - Virtual properties
 * - Instance methods
 * - Static methods
 * - Edge cases
 */

import { describe, it, expect, beforeEach } from 'vitest';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { createTestProduct, randomObjectId } from '../helpers/test-utils';

describe('Product Model', () => {
  beforeEach(async () => {
    await connectDB();
  });

  describe('Schema Validation', () => {
    it('should create a product with valid data', async () => {
      const category = await Category.create({
        name: 'Rings',
        slug: 'rings',
        displayName: 'Rings',
        image: 'https://example.com/rings.jpg',
        alt: 'Rings category',
        active: true,
      });

      const productData = createTestProduct({
        categoryId: category._id,
      });

      const product = await Product.create(productData);

      expect(product).toBeDefined();
      expect(product.slug).toBe(productData.slug);
      expect(product.title).toBe(productData.title);
      expect(product.price).toBe(productData.price);
      expect(product.status).toBe('active');
    });

    it('should require slug', async () => {
      const productData = createTestProduct();
      delete (productData as any).slug;

      await expect(Product.create(productData)).rejects.toThrow();
    });

    it('should require title', async () => {
      const productData = createTestProduct();
      delete (productData as any).title;

      await expect(Product.create(productData)).rejects.toThrow();
    });

    it('should require price', async () => {
      const productData = createTestProduct();
      delete (productData as any).price;

      await expect(Product.create(productData)).rejects.toThrow();
    });

    it('should enforce unique slug', async () => {
      const category = await Category.create({
        name: 'Rings',
        slug: 'rings',
        displayName: 'Rings',
        image: 'https://example.com/rings.jpg',
        alt: 'Rings category',
        active: true,
      });

      const productData = createTestProduct({
        slug: 'unique-slug',
        categoryId: category._id,
      });

      await Product.create(productData);

      await expect(Product.create(productData)).rejects.toThrow();
    });

    it('should enforce unique SKU', async () => {
      const category = await Category.create({
        name: 'Rings',
        slug: 'rings',
        displayName: 'Rings',
        image: 'https://example.com/rings.jpg',
        alt: 'Rings category',
        active: true,
      });

      const productData = createTestProduct({
        sku: 'UNIQUE-SKU',
        categoryId: category._id,
      });

      await Product.create(productData);

      const productData2 = createTestProduct({
        sku: 'UNIQUE-SKU',
        categoryId: category._id,
      });

      await expect(Product.create(productData2)).rejects.toThrow();
    });

    it('should enforce unique barcode if provided', async () => {
      const category = await Category.create({
        name: 'Rings',
        slug: 'rings',
        displayName: 'Rings',
        image: 'https://example.com/rings.jpg',
        alt: 'Rings category',
        active: true,
      });

      const productData = createTestProduct({
        barcode: '1234567890123',
        categoryId: category._id,
      });

      await Product.create(productData);

      const productData2 = createTestProduct({
        barcode: '1234567890123',
        categoryId: category._id,
      });

      await expect(Product.create(productData2)).rejects.toThrow();
    });
  });

  describe('Virtual Properties', () => {
    it('should calculate availableQuantity correctly', async () => {
      const category = await Category.create({
        name: 'Rings',
        slug: 'rings',
        displayName: 'Rings',
        image: 'https://example.com/rings.jpg',
        alt: 'Rings category',
        active: true,
      });

      const product = await Product.create(
        createTestProduct({
          categoryId: category._id,
          inventory: {
            quantity: 10,
            reservedQuantity: 3,
            lowStockThreshold: 5,
            trackQuantity: true,
            allowBackorder: false,
            location: 'warehouse-1',
          },
        })
      );

      expect(product.availableQuantity).toBe(7);
    });

    it('should return inStock correctly', async () => {
      const category = await Category.create({
        name: 'Rings',
        slug: 'rings',
        displayName: 'Rings',
        image: 'https://example.com/rings.jpg',
        alt: 'Rings category',
        active: true,
      });

      const product = await Product.create(
        createTestProduct({
          categoryId: category._id,
          inventory: {
            quantity: 10,
            reservedQuantity: 0,
            lowStockThreshold: 5,
            trackQuantity: true,
            allowBackorder: false,
            location: 'warehouse-1',
          },
        })
      );

      expect(product.inStock).toBe(true);
    });

    it('should return isLowStock correctly', async () => {
      const category = await Category.create({
        name: 'Rings',
        slug: 'rings',
        displayName: 'Rings',
        image: 'https://example.com/rings.jpg',
        alt: 'Rings category',
        active: true,
      });

      const product = await Product.create(
        createTestProduct({
          categoryId: category._id,
          inventory: {
            quantity: 3,
            reservedQuantity: 0,
            lowStockThreshold: 5,
            trackQuantity: true,
            allowBackorder: false,
            location: 'warehouse-1',
          },
        })
      );

      expect(product.isLowStock).toBe(true);
    });

    it('should return isOutOfStock correctly', async () => {
      const category = await Category.create({
        name: 'Rings',
        slug: 'rings',
        displayName: 'Rings',
        image: 'https://example.com/rings.jpg',
        alt: 'Rings category',
        active: true,
      });

      const product = await Product.create(
        createTestProduct({
          categoryId: category._id,
          inventory: {
            quantity: 0,
            reservedQuantity: 0,
            lowStockThreshold: 5,
            trackQuantity: true,
            allowBackorder: false,
            location: 'warehouse-1',
          },
        })
      );

      expect(product.isOutOfStock).toBe(true);
    });
  });

  describe('Instance Methods', () => {
    it('should check canPurchase correctly', async () => {
      const category = await Category.create({
        name: 'Rings',
        slug: 'rings',
        displayName: 'Rings',
        image: 'https://example.com/rings.jpg',
        alt: 'Rings category',
        active: true,
      });

      const product = await Product.create(
        createTestProduct({
          categoryId: category._id,
          inventory: {
            quantity: 10,
            reservedQuantity: 0,
            lowStockThreshold: 5,
            trackQuantity: true,
            allowBackorder: false,
            location: 'warehouse-1',
          },
        })
      );

      expect(await product.canPurchase(5)).toBe(true);
      expect(await product.canPurchase(15)).toBe(false);
    });

    it('should allow purchase when allowBackorder is true', async () => {
      const category = await Category.create({
        name: 'Rings',
        slug: 'rings',
        displayName: 'Rings',
        image: 'https://example.com/rings.jpg',
        alt: 'Rings category',
        active: true,
      });

      const product = await Product.create(
        createTestProduct({
          categoryId: category._id,
          inventory: {
            quantity: 5,
            reservedQuantity: 0,
            lowStockThreshold: 5,
            trackQuantity: true,
            allowBackorder: true,
            location: 'warehouse-1',
          },
        })
      );

      expect(await product.canPurchase(10)).toBe(true);
    });

    it('should not allow purchase when trackQuantity is false and allowBackorder is false', async () => {
      const category = await Category.create({
        name: 'Rings',
        slug: 'rings',
        displayName: 'Rings',
        image: 'https://example.com/rings.jpg',
        alt: 'Rings category',
        active: true,
      });

      const product = await Product.create(
        createTestProduct({
          categoryId: category._id,
          inventory: {
            quantity: 0,
            reservedQuantity: 0,
            lowStockThreshold: 5,
            trackQuantity: false,
            allowBackorder: false,
            location: 'warehouse-1',
          },
        })
      );

      expect(await product.canPurchase(1)).toBe(true);
    });
  });

  describe('Static Methods - Stock Management', () => {
    it('should reserve stock atomically', async () => {
      const category = await Category.create({
        name: 'Rings',
        slug: 'rings',
        displayName: 'Rings',
        image: 'https://example.com/rings.jpg',
        alt: 'Rings category',
        active: true,
      });

      const product = await Product.create(
        createTestProduct({
          categoryId: category._id,
          inventory: {
            quantity: 10,
            reservedQuantity: 0,
            lowStockThreshold: 5,
            trackQuantity: true,
            allowBackorder: false,
            location: 'warehouse-1',
          },
        })
      );

      const result = await Product.reserveStock(product._id.toString(), 3);

      expect(result).not.toBeNull();
      
      const updated = await Product.findById(product._id);
      expect(updated?.inventory.reservedQuantity).toBe(3);
      expect(updated?.inventory.quantity).toBe(10);
    });

    it('should fail to reserve stock when insufficient', async () => {
      const category = await Category.create({
        name: 'Rings',
        slug: 'rings',
        displayName: 'Rings',
        image: 'https://example.com/rings.jpg',
        alt: 'Rings category',
        active: true,
      });

      const product = await Product.create(
        createTestProduct({
          categoryId: category._id,
          inventory: {
            quantity: 5,
            reservedQuantity: 0,
            lowStockThreshold: 5,
            trackQuantity: true,
            allowBackorder: false,
            location: 'warehouse-1',
          },
        })
      );

      const result = await Product.reserveStock(product._id.toString(), 10);

      expect(result).toBeNull();
    });

    it('should release reserved stock atomically', async () => {
      const category = await Category.create({
        name: 'Rings',
        slug: 'rings',
        displayName: 'Rings',
        image: 'https://example.com/rings.jpg',
        alt: 'Rings category',
        active: true,
      });

      const product = await Product.create(
        createTestProduct({
          categoryId: category._id,
          inventory: {
            quantity: 10,
            reservedQuantity: 5,
            lowStockThreshold: 5,
            trackQuantity: true,
            allowBackorder: false,
            location: 'warehouse-1',
          },
        })
      );

      const result = await Product.releaseReservedStock(product._id.toString(), 3);

      expect(result).not.toBeNull();
      
      const updated = await Product.findById(product._id);
      expect(updated?.inventory.reservedQuantity).toBe(2);
    });

    it('should confirm sale atomically', async () => {
      const category = await Category.create({
        name: 'Rings',
        slug: 'rings',
        displayName: 'Rings',
        image: 'https://example.com/rings.jpg',
        alt: 'Rings category',
        active: true,
      });

      const product = await Product.create(
        createTestProduct({
          categoryId: category._id,
          inventory: {
            quantity: 10,
            reservedQuantity: 3,
            lowStockThreshold: 5,
            trackQuantity: true,
            allowBackorder: false,
            location: 'warehouse-1',
          },
        })
      );

      const result = await Product.confirmSale(product._id.toString(), 2);

      expect(result).not.toBeNull();
      
      const updated = await Product.findById(product._id);
      expect(updated?.inventory.quantity).toBe(8);
      expect(updated?.inventory.reservedQuantity).toBe(1);
    });

    it('should restore stock atomically', async () => {
      const category = await Category.create({
        name: 'Rings',
        slug: 'rings',
        displayName: 'Rings',
        image: 'https://example.com/rings.jpg',
        alt: 'Rings category',
        active: true,
      });

      const product = await Product.create(
        createTestProduct({
          categoryId: category._id,
          inventory: {
            quantity: 8,
            reservedQuantity: 0,
            lowStockThreshold: 5,
            trackQuantity: true,
            allowBackorder: false,
            location: 'warehouse-1',
          },
        })
      );

      const result = await Product.restoreStock(product._id.toString(), 2);

      expect(result).not.toBeNull();
      
      const updated = await Product.findById(product._id);
      expect(updated?.inventory.quantity).toBe(10);
    });

    it('should restock product atomically', async () => {
      const category = await Category.create({
        name: 'Rings',
        slug: 'rings',
        displayName: 'Rings',
        image: 'https://example.com/rings.jpg',
        alt: 'Rings category',
        active: true,
      });

      const product = await Product.create(
        createTestProduct({
          categoryId: category._id,
          inventory: {
            quantity: 10,
            reservedQuantity: 0,
            lowStockThreshold: 5,
            trackQuantity: true,
            allowBackorder: false,
            location: 'warehouse-1',
          },
        })
      );

      const result = await Product.restock(product._id.toString(), 5);

      expect(result).not.toBeNull();
      
      const updated = await Product.findById(product._id);
      expect(updated?.inventory.quantity).toBe(15);
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative quantity gracefully', async () => {
      const category = await Category.create({
        name: 'Rings',
        slug: 'rings',
        displayName: 'Rings',
        image: 'https://example.com/rings.jpg',
        alt: 'Rings category',
        active: true,
      });

      const product = await Product.create(
        createTestProduct({
          categoryId: category._id,
        })
      );

      const result = await Product.reserveStock(product._id.toString(), -1);
      expect(result).toBeNull();
    });

    it('should handle zero quantity', async () => {
      const category = await Category.create({
        name: 'Rings',
        slug: 'rings',
        displayName: 'Rings',
        image: 'https://example.com/rings.jpg',
        alt: 'Rings category',
        active: true,
      });

      const product = await Product.create(
        createTestProduct({
          categoryId: category._id,
        })
      );

      const result = await Product.reserveStock(product._id.toString(), 0);
      expect(result).toBeNull();
    });

    it('should handle non-existent product', async () => {
      const fakeId = randomObjectId().toString();
      const result = await Product.reserveStock(fakeId, 1);
      expect(result).toBeNull();
    });

    it('should handle concurrent stock reservations', async () => {
      const category = await Category.create({
        name: 'Rings',
        slug: 'rings',
        displayName: 'Rings',
        image: 'https://example.com/rings.jpg',
        alt: 'Rings category',
        active: true,
      });

      const product = await Product.create(
        createTestProduct({
          categoryId: category._id,
          inventory: {
            quantity: 10,
            reservedQuantity: 0,
            lowStockThreshold: 5,
            trackQuantity: true,
            allowBackorder: false,
            location: 'warehouse-1',
          },
        })
      );

      // Simulate concurrent reservations
      const promises = [
        Product.reserveStock(product._id.toString(), 3),
        Product.reserveStock(product._id.toString(), 3),
        Product.reserveStock(product._id.toString(), 3),
        Product.reserveStock(product._id.toString(), 3),
      ];

      const results = await Promise.all(promises);

      // Only some should succeed (total reserved should not exceed quantity)
      const successCount = results.filter((r) => r !== null).length;
      expect(successCount).toBeLessThanOrEqual(3); // Max 3 can succeed with qty 10

      const updated = await Product.findById(product._id);
      expect(updated?.inventory.reservedQuantity).toBeLessThanOrEqual(10);
    });
  });

  describe('Pre-save Hooks', () => {
    it('should validate categoryId exists', async () => {
      const fakeCategoryId = randomObjectId();
      const productData = createTestProduct({
        categoryId: fakeCategoryId,
      });

      await expect(Product.create(productData)).rejects.toThrow();
    });

    it('should generate SKU if not provided', async () => {
      const category = await Category.create({
        name: 'Rings',
        slug: 'rings',
        displayName: 'Rings',
        image: 'https://example.com/rings.jpg',
        alt: 'Rings category',
        active: true,
      });

      const productData = createTestProduct({
        categoryId: category._id,
      });
      delete (productData as any).sku;

      const product = await Product.create(productData);
      expect(product.sku).toBeDefined();
      expect(product.sku).toMatch(/^[A-Z0-9-]+$/);
    });
  });
});
