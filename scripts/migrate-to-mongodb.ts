/**
 * Migration Script - JSON to MongoDB
 * 
 * Migrates data from JSON files to MongoDB collections:
 * - products.json → products collection
 * - categories.json → categories collection (all 4 categories: rings, earrings, necklaces, bracelets)
 * - site-settings.json → site_settings collection
 * 
 * All categories are migrated with active: true by default.
 * You can disable categories later by setting active: false in MongoDB.
 * 
 * Usage: npm run migrate:mongodb
 * 
 * This is a MANUAL migration - run it once to migrate your data.
 * It's safe to run multiple times (uses upsert to avoid duplicates).
 */

// Load environment variables from .env.local before importing mongodb
import { readFileSync, existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { join } from 'path';

// Load .env.local file FIRST, before any other imports
const envPath = join(process.cwd(), '.env.local');
if (existsSync(envPath)) {
  try {
    const envFile = readFileSync(envPath, 'utf-8');
    envFile.split('\n').forEach((line) => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const equalIndex = trimmedLine.indexOf('=');
        if (equalIndex > 0) {
          const key = trimmedLine.substring(0, equalIndex).trim();
          let value = trimmedLine.substring(equalIndex + 1).trim();
          // Remove quotes if present
          if ((value.startsWith('"') && value.endsWith('"')) || 
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          if (key && value) {
            process.env[key] = value;
          }
        }
      }
    });
    console.log('✅ Loaded environment variables from .env.local');
  } catch (error) {
    console.warn('⚠️  Could not load .env.local file:', error);
    console.warn('Make sure MONGODB_URI is set in environment variables.');
  }
} else {
  console.warn(`⚠️  .env.local file not found at ${envPath}`);
  console.warn('Make sure MONGODB_URI is set in environment variables.');
}

// Now import modules after env vars are loaded
import connectDB from '../lib/mongodb';
import Product from '../models/Product';
import Category from '../models/Category';
import SiteSettings from '../models/SiteSettings';
import mongoose from 'mongoose';
import type { Product as ProductType, Category as CategoryType } from '../types/data';

const DATA_DIR = join(process.cwd(), 'data');

/**
 * Transform JSON product to MongoDB Product schema
 */
function transformProduct(jsonProduct: ProductType) {
  // Generate SKU from ID or slug
  const sku = jsonProduct.id?.toUpperCase().replace(/-/g, '_') || 
              `PROD_${jsonProduct.slug.toUpperCase().replace(/-/g, '_')}`;
  
  // Determine status based on inStock
  const status = jsonProduct.inStock ? 'active' : 'out_of_stock';
  
  // Set published date
  const publishedAt = jsonProduct.createdAt ? new Date(jsonProduct.createdAt) : new Date();
  
  return {
    slug: jsonProduct.slug,
    title: jsonProduct.title,
    description: jsonProduct.description,
    shortDescription: jsonProduct.description?.substring(0, 200),
    sku: sku,
    price: jsonProduct.price || 0,
    currency: 'INR',
    category: jsonProduct.category || 'other',
    material: jsonProduct.material || 'Not specified',
    images: jsonProduct.image ? [jsonProduct.image] : [],
    primaryImage: jsonProduct.image || '',
    alt: jsonProduct.alt || jsonProduct.title,
    inventory: {
      quantity: jsonProduct.inStock ? 10 : 0, // Default quantity
      trackQuantity: true,
      allowBackorder: false,
      lowStockThreshold: 5,
      reservedQuantity: 0,
    },
    status: status,
    featured: jsonProduct.featured || false,
    mostLoved: jsonProduct.mostLoved || false,
    newArrival: false,
    views: 0,
    salesCount: 0,
    publishedAt: publishedAt,
    createdAt: jsonProduct.createdAt ? new Date(jsonProduct.createdAt) : new Date(),
    updatedAt: jsonProduct.updatedAt ? new Date(jsonProduct.updatedAt) : new Date(),
  };
}

/**
 * Transform JSON category to MongoDB Category schema
 */
function transformCategory(jsonCategory: CategoryType, order: number) {
  return {
    slug: jsonCategory.slug,
    name: jsonCategory.name,
    displayName: jsonCategory.displayName,
    description: jsonCategory.description,
    image: jsonCategory.image,
    alt: jsonCategory.alt,
    order: order,
    active: true,
    productCount: 0, // Will be updated later
  };
}

/**
 * Main migration function
 */
async function migrate() {
  try {
    console.log('🚀 Starting migration...\n');

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ Connected to MongoDB\n');

    // ============================================
    // 1. Migrate Categories (all 4 categories)
    // ============================================
    console.log('📦 Migrating Categories (all categories)...');
    try {
      const categoriesData = JSON.parse(
        await readFile(join(DATA_DIR, 'categories.json'), 'utf8')
      );

      // Migrate all categories
      const categoriesToMigrate = categoriesData.categories;

      console.log(`   Found ${categoriesToMigrate.length} categories to migrate`);

      let categoryOrder = 0;
      for (const jsonCategory of categoriesToMigrate) {
        const categoryData = transformCategory(jsonCategory, categoryOrder++);
        
        // All categories are enabled (active: true) by default
        // You can disable categories later via admin panel or direct DB update
        
        // Use upsert to avoid duplicates
        const category = await Category.findOneAndUpdate(
          { slug: categoryData.slug },
          categoryData,
          { upsert: true, new: true }
        );
        
        console.log(`   ✅ Migrated category: ${category.slug} (active: ${category.active})`);
      }
      console.log(`✅ Categories migration complete (${categoriesToMigrate.length} categories)\n`);
    } catch (error) {
      console.error('❌ Error migrating categories:', error);
      throw error;
    }

    // ============================================
    // 2. Migrate Products
    // ============================================
    console.log('📦 Migrating Products...');
    try {
      const productsData = JSON.parse(
        await readFile(join(DATA_DIR, 'products.json'), 'utf8')
      );

      console.log(`   Found ${productsData.products.length} products to migrate`);

      let migratedCount = 0;
      let skippedCount = 0;

      for (const jsonProduct of productsData.products) {
        try {
          const productData = transformProduct(jsonProduct);
          
          // Use upsert to avoid duplicates (based on slug)
          const product = await Product.findOneAndUpdate(
            { slug: productData.slug },
            productData,
            { upsert: true, new: true }
          );
          
          // Link to category if categoryId exists
          if (productData.category) {
            const category = await Category.findOne({ slug: productData.category });
            if (category) {
              product.categoryId = category._id;
              await product.save();
            }
          }
          
          migratedCount++;
          console.log(`   ✅ Migrated product: ${product.slug} (SKU: ${product.sku})`);
        } catch (error) {
          console.error(`   ⚠️  Error migrating product ${jsonProduct.slug}:`, error);
          skippedCount++;
        }
      }

      console.log(`✅ Products migration complete (${migratedCount} migrated, ${skippedCount} skipped)\n`);
    } catch (error) {
      console.error('❌ Error migrating products:', error);
      throw error;
    }

    // ============================================
    // 3. Update Category Product Counts
    // ============================================
    console.log('📊 Updating category product counts...');
    try {
      const categories = await Category.find({ active: true });
      for (const category of categories) {
        const count = await Product.countDocuments({ 
          category: category.slug,
          status: 'active' 
        });
        category.productCount = count;
        await category.save();
        console.log(`   ✅ ${category.slug}: ${count} products`);
      }
      console.log('✅ Category counts updated\n');
    } catch (error) {
      console.error('❌ Error updating category counts:', error);
      // Don't throw - this is not critical
    }

    // ============================================
    // 4. Migrate Site Settings
    // ============================================
    console.log('📦 Migrating Site Settings...');
    try {
      const siteSettingsData = JSON.parse(
        await readFile(join(DATA_DIR, 'site-settings.json'), 'utf8')
      );

      // Split site settings into different types
      const settingsTypes = [
        { type: 'general', data: { brand: siteSettingsData.brand } },
        { type: 'hero', data: { hero: siteSettingsData.hero } },
        { type: 'about', data: { about: siteSettingsData.about } },
        { type: 'contact', data: { contact: siteSettingsData.contact } },
        { type: 'social', data: { social: siteSettingsData.social } },
        { type: 'seo', data: { mostLoved: siteSettingsData.mostLoved, products: siteSettingsData.products, intro: siteSettingsData.intro } },
      ];

      for (const setting of settingsTypes) {
        await SiteSettings.findOneAndUpdate(
          { type: setting.type },
          { type: setting.type, data: setting.data },
          { upsert: true, new: true }
        );
        console.log(`   ✅ Migrated site setting: ${setting.type}`);
      }

      console.log('✅ Site settings migration complete\n');
    } catch (error) {
      console.error('❌ Error migrating site settings:', error);
      throw error;
    }

    // ============================================
    // Migration Complete
    // ============================================
    console.log('🎉 Migration completed successfully!\n');
    console.log('📋 Summary:');
    console.log(`   - Categories: ${await Category.countDocuments({ active: true })} active`);
    console.log(`   - Products: ${await Product.countDocuments()}`);
    console.log(`   - Site Settings: ${await SiteSettings.countDocuments()}\n`);
    console.log('✅ You can now verify data in MongoDB Atlas UI');
    console.log('✅ Next step: Update data fetching functions to use MongoDB\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  } finally {
    // Close MongoDB connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('📡 MongoDB connection closed');
    }
  }
}

// Run migration
migrate();
