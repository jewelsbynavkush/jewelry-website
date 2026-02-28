/**
 * Migration Script - Push products from JSON to MongoDB
 *
 * Append-only: inserts new products, updates existing ones by slug. Does not delete any data.
 * Duplicate key: slug. Existing documents with the same slug are updated; others are appended.
 *
 * Requires categories to exist for product.category slugs; unknown slugs fall back to 'other'.
 *
 * Usage: npm run migrate:products
 */

import { readFileSync, existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { join } from 'path';
import mongoose from 'mongoose';

const envPath = join(process.cwd(), '.env.local');
if (existsSync(envPath)) {
  const envFile = readFileSync(envPath, 'utf-8');
  envFile.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const i = trimmed.indexOf('=');
      if (i > 0) {
        const key = trimmed.substring(0, i).trim();
        let val = trimmed.substring(i + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
          val = val.slice(1, -1);
        if (key && val) process.env[key] = val;
      }
    }
  });
}

import connectDB from '../lib/mongodb';
import Product from '../models/Product';
import Category from '../models/Category';

const DATA_DIR = join(process.cwd(), 'data');
const PRODUCTS_FILE = join(DATA_DIR, 'products.json');

interface JsonProduct {
  id?: string;
  slug: string;
  title: string;
  description?: string;
  image?: string;
  alt?: string;
  price?: number;
  category?: string;
  material?: string;
  inStock?: boolean;
  mostLoved?: boolean;
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

function transformProduct(p: JsonProduct) {
  const sku =
    p.id?.toUpperCase().replace(/-/g, '_') ||
    `PROD_${p.slug.toUpperCase().replace(/-/g, '_')}`;
  const status = p.inStock ? 'active' : 'out_of_stock';
  const publishedAt = p.createdAt ? new Date(p.createdAt) : new Date();
  return {
    slug: p.slug,
    title: p.title,
    description: p.description ?? '',
    shortDescription: (p.description ?? '').substring(0, 200),
    sku,
    price: p.price ?? 0,
    currency: 'INR',
    category: (p.category ?? 'other').toLowerCase().trim(),
    material: p.material ?? 'Not specified',
    images: p.image ? [p.image] : [],
    primaryImage: p.image ?? '',
    alt: p.alt ?? p.title,
    inventory: {
      quantity: p.inStock ? 10 : 0,
      trackQuantity: true,
      allowBackorder: false,
      lowStockThreshold: 5,
      reservedQuantity: 0,
    },
    status,
    featured: p.featured ?? false,
    mostLoved: p.mostLoved ?? false,
    newArrival: false,
    views: 0,
    salesCount: 0,
    publishedAt,
    createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
    updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(),
  };
}

async function migrate() {
  try {
    if (!existsSync(PRODUCTS_FILE)) {
      console.error(`Products file not found: ${PRODUCTS_FILE}`);
      process.exit(1);
    }

    await connectDB();
    console.log('MongoDB connected\n');

    const raw = await readFile(PRODUCTS_FILE, 'utf8');
    const data = JSON.parse(raw) as { products?: JsonProduct[] };
    const products = data.products ?? [];
    if (products.length === 0) {
      console.log('No products in file.');
      process.exit(0);
    }

    console.log(`Pushing ${products.length} products...\n`);
    let migrated = 0;
    let skipped = 0;

    for (const jsonProduct of products) {
      try {
        const productData = transformProduct(jsonProduct);
        const categorySlug = productData.category;
        const category =
          categorySlug && categorySlug !== 'other'
            ? await Category.findOne({ slug: categorySlug, active: true })
            : null;
        if (!category && categorySlug && categorySlug !== 'other') {
          productData.category = 'other';
        }

        const product = await Product.findOneAndUpdate(
          { slug: productData.slug },
          { $set: productData },
          { upsert: true, new: true }
        );

        if (category && product) {
          product.categoryId = category._id;
          await product.save();
        }

        migrated++;
        console.log(`  Migrated: ${product.slug} (SKU: ${product.sku})`);
      } catch (err) {
        console.error(`  Error migrating ${jsonProduct.slug}:`, err);
        skipped++;
      }
    }

    console.log(`\nDone. Migrated: ${migrated}, skipped: ${skipped}`);
    const total = await Product.countDocuments();
    console.log(`Total products in DB: ${total}\n`);
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
}

migrate();
