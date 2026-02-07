/**
 * Migration Script - Site Settings & E-commerce Configuration
 * 
 * Migrates site settings and e-commerce configuration from constants/JSON to MongoDB:
 * - Brand & content values from constants.ts DEFAULTS
 * - E-commerce configuration from constants.ts ECOMMERCE
 * - Contact info from site-settings.json
 * 
 * Usage: npm run migrate:site-settings
 * 
 * This is a MANUAL migration - run it once to migrate your data.
 * It's safe to run multiple times (uses upsert to avoid duplicates).
 */

// Load environment variables from .env.local before importing mongodb
import { readFileSync, existsSync } from 'fs';
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
}

import connectDB from '../lib/mongodb';
import SiteSettings from '../models/SiteSettings';

/**
 * Main migration function
 */
async function migrate() {
  try {
    console.log('🚀 Starting site settings migration...\n');

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ Connected to MongoDB\n');

    // ============================================
    // 1. Update General Settings (Brand & Content)
    // ============================================
    console.log('📦 Migrating General Settings (Brand & Content)...');
    try {
      const generalData = {
        brand: {
          name: 'Jewels by NavKush',
          tagline: 'A CELESTIAL TOUCH FOR TIMELESS MOMENTS',
        },
        intro: {
          rightColumnSlogan: 'Discover our most cherished pieces',
        },
      };

      await SiteSettings.findOneAndUpdate(
        { type: 'general' },
        { 
          type: 'general',
          data: generalData,
        },
        { upsert: true, new: true }
      );

      console.log('   ✅ Updated general settings (brand, intro)');
    } catch (error) {
      console.error('❌ Error migrating general settings:', error);
      throw error;
    }

    // ============================================
    // 2. Update Hero Settings
    // ============================================
    console.log('📦 Migrating Hero Settings...');
    try {
      const heroData = {
        hero: {
          title: 'COLLECTION 2025',
          description: 'Discover our collection of unique, beautifully designed jewelry pieces that reflect your personal style. Handcrafted with precision and elegance.',
          buttonText: 'DISCOVER',
          image: '/assets/hero/hero-image.png',
          alt: 'Elegant jewelry display featuring handcrafted rings',
        },
      };

      await SiteSettings.findOneAndUpdate(
        { type: 'hero' },
        { 
          type: 'hero',
          data: heroData,
        },
        { upsert: true, new: true }
      );

      console.log('   ✅ Updated hero settings');
    } catch (error) {
      console.error('❌ Error migrating hero settings:', error);
      throw error;
    }

    // ============================================
    // 3. Update About Settings
    // ============================================
    console.log('📦 Migrating About Settings...');
    try {
      const aboutData = {
        about: {
          title: 'ABOUT US',
          content: [
            'We carefully select the finest materials—precious metals, sparkling gemstones, and luxurious pearls—to create each piece. Every design is meticulously crafted by skilled artisans, ensuring that each item is not only beautiful but built to last.',
            'Our commitment to excellence is reflected in every detail, from the intricate designs to the flawless finish. At Jewels by NavKush, we are dedicated to creating jewelry that transcends trends, offering pieces that will remain cherished for generations.',
            'At Jewels by NavKush, we believe that jewelry is more than just an accessory; it\'s a timeless expression of elegance and a celebration of life\'s most precious moments. With a legacy spanning over decades, our brand has become synonymous with exceptional craftsmanship and sophistication.',
          ],
          image: '/assets/about/about-image.png',
          alt: 'About Jewels by NavKush',
          buttonText: 'MORE ABOUT US',
        },
      };

      await SiteSettings.findOneAndUpdate(
        { type: 'about' },
        { 
          type: 'about',
          data: aboutData,
        },
        { upsert: true, new: true }
      );

      console.log('   ✅ Updated about settings');
    } catch (error) {
      console.error('❌ Error migrating about settings:', error);
      throw error;
    }

    // ============================================
    // 4. Update Contact Settings (from JSON)
    // ============================================
    console.log('📦 Migrating Contact Settings...');
    try {
      const contactData = {
        contact: {
          email: process.env.CONTACT_EMAIL || 'info@jewelrystore.com',
          phone: process.env.CONTACT_PHONE || '+1 (555) 123-4567',
          address: process.env.CONTACT_ADDRESS || '123 Jewelry Street, City, State 12345',
        },
      };

      await SiteSettings.findOneAndUpdate(
        { type: 'contact' },
        { 
          type: 'contact',
          data: contactData,
        },
        { upsert: true, new: true }
      );

      console.log('   ✅ Updated contact settings');
      console.log('   ⚠️  Note: Using env vars if available, otherwise defaults from JSON');
    } catch (error) {
      console.error('❌ Error migrating contact settings:', error);
      throw error;
    }

    // ============================================
    // 5. Migrate E-commerce Configuration
    // ============================================
    console.log('📦 Migrating E-commerce Configuration...');
    try {
      const ecommerceData = {
        ecommerce: {
          currency: 'INR',
          currencySymbol: '₹',
          defaultShippingDays: 5,
          freeShippingThreshold: 5000,
          defaultShippingCost: 100,
          returnWindowDays: 30,
          taxRate: 0.18,
          calculateTax: true,
          priceVarianceThreshold: 0.1,
          guestCartExpirationDays: 30,
          userCartExpirationDays: null,
          maxQuantityPerItem: 100,
          maxCartItems: 1000,
        },
      };

      await SiteSettings.findOneAndUpdate(
        { type: 'ecommerce' },
        { 
          type: 'ecommerce',
          data: ecommerceData,
        },
        { upsert: true, new: true }
      );

      console.log('   ✅ Migrated e-commerce configuration');
    } catch (error) {
      console.error('❌ Error migrating e-commerce configuration:', error);
      throw error;
    }

    console.log('\n✅ Site settings migration complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Update values in MongoDB if needed');
    console.log('   2. Update constants.ts to use DB values with fallbacks');
    console.log('   3. Test the application to ensure everything works');
    console.log('\n✨ Migration successful!\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrate();
