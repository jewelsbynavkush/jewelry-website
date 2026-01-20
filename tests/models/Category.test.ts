/**
 * Category Model Tests
 * 
 * Tests for Category model:
 * - Schema validation
 * - Parent category validation
 * - Active status
 * - Edge cases
 */

import { describe, it, expect, beforeEach } from 'vitest';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import { createTestCategory } from '../helpers/test-utils';

describe('Category Model', () => {
  beforeEach(async () => {
    await connectDB();
  });

  describe('Schema Validation', () => {
    it('should create a category with valid data', async () => {
      const categoryData = createTestCategory();
      const category = await Category.create(categoryData);

      expect(category).toBeDefined();
      expect(category.name).toBe(categoryData.name);
      expect(category.slug).toBe(categoryData.slug);
      expect(category.active).toBe(true);
    });

    it('should require name', async () => {
      const categoryData = createTestCategory();
      delete (categoryData as any).name;

      await expect(Category.create(categoryData)).rejects.toThrow();
    });

    it('should require slug', async () => {
      const categoryData = createTestCategory();
      delete (categoryData as any).slug;

      await expect(Category.create(categoryData)).rejects.toThrow();
    });

    it('should enforce unique slug', async () => {
      const categoryData = createTestCategory({
        slug: 'unique-slug',
      });

      await Category.create(categoryData);

      const categoryData2 = createTestCategory({
        slug: 'unique-slug',
      });

      await expect(Category.create(categoryData2)).rejects.toThrow();
    });
  });

  describe('Parent Category Validation', () => {
    it('should allow parent category', async () => {
      const parent = await Category.create(createTestCategory());

      const child = await Category.create(
        createTestCategory({
          parentCategory: parent._id,
        })
      );

      expect(child.parentCategory?.toString()).toBe(parent._id.toString());
    });

    it('should prevent self-reference', async () => {
      const category = await Category.create(createTestCategory());

      category.parentCategory = category._id;
      await expect(category.save()).rejects.toThrow();
    });

    it('should validate parent category exists', async () => {
      const { randomObjectId } = await import('../helpers/test-utils');
      const fakeParentId = randomObjectId();

      const categoryData = createTestCategory({
        parentCategory: fakeParentId,
      });

      await expect(Category.create(categoryData)).rejects.toThrow();
    });
  });

  describe('Active Status', () => {
    it('should default to active true', async () => {
      const categoryData = createTestCategory();
      delete (categoryData.active);

      const category = await Category.create(categoryData);
      expect(category.active).toBe(true);
    });

    it('should allow setting active to false', async () => {
      const category = await Category.create(
        createTestCategory({
          active: false,
        })
      );

      expect(category.active).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long name', async () => {
      const categoryData = createTestCategory({
        name: 'A'.repeat(200),
      });

      await expect(Category.create(categoryData)).rejects.toThrow();
    });

    it('should handle invalid slug format', async () => {
      const categoryData = createTestCategory({
        slug: 'Invalid Slug With Spaces!',
      });

      await expect(Category.create(categoryData)).rejects.toThrow();
    });
  });
});
