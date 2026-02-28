/**
 * Migration Script - Push categories from JSON to MongoDB
 *
 * Append-only: inserts new categories, updates existing ones by slug. Does not delete any data.
 * Duplicate key: slug. Existing documents with the same slug are updated; others are appended.
 * productCount is set to 0 only on insert; existing categories keep their count on update.
 *
 * Usage: npm run migrate:categories
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
import Category from '../models/Category';

const DATA_DIR = join(process.cwd(), 'data');
const CATEGORIES_FILE = join(DATA_DIR, 'categories.json');

interface JsonCategory {
  slug: string;
  name: string;
  displayName: string;
  description?: string;
  image: string;
  alt: string;
}

function transformCategory(c: JsonCategory, order: number) {
  return {
    slug: c.slug,
    name: c.name,
    displayName: c.displayName,
    description: c.description ?? '',
    image: c.image,
    alt: c.alt,
    order,
    active: true,
  };
}

async function migrate() {
  try {
    if (!existsSync(CATEGORIES_FILE)) {
      console.error(`Categories file not found: ${CATEGORIES_FILE}`);
      process.exit(1);
    }

    await connectDB();
    console.log('MongoDB connected\n');

    const raw = await readFile(CATEGORIES_FILE, 'utf8');
    const data = JSON.parse(raw) as { categories?: JsonCategory[] };
    const categories = data.categories ?? [];
    if (categories.length === 0) {
      console.log('No categories in file.');
      process.exit(0);
    }

    console.log(`Pushing ${categories.length} categories...\n`);
    let order = 0;
    for (const jsonCategory of categories) {
      const categoryData = transformCategory(jsonCategory, order++);
      const category = await Category.findOneAndUpdate(
        { slug: categoryData.slug },
        {
          $set: categoryData,
          $setOnInsert: { productCount: 0 },
        },
        { upsert: true, new: true }
      );
      console.log(`  Migrated: ${category.slug} (active: ${category.active})`);
    }

    const total = await Category.countDocuments();
    console.log(`\nDone. Total categories in DB: ${total}\n`);
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
