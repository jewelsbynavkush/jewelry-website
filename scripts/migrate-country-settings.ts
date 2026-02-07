/**
 * Migration Script - Country Settings
 * 
 * Migrates country configuration to MongoDB:
 * - Creates default India country settings
 * - Can be extended to add more countries
 * 
 * Usage: npm run migrate:country-settings
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
import CountrySettings from '../models/CountrySettings';

/**
 * Indian States and Union Territories
 */
const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

/**
 * Main migration function
 */
async function migrate() {
  try {
    console.log('🚀 Starting country settings migration...\n');

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ Connected to MongoDB\n');

    // ============================================
    // 1. Migrate India (Default Country)
    // ============================================
    console.log('📦 Migrating India Country Settings...');
    try {
      const indiaData = {
        countryCode: 'IN',
        countryName: 'India',
        phoneCountryCode: '+91',
        phonePattern: '^[0-9]{10}$',
        phoneLength: 10,
        pincodePattern: '^[0-9]{6}$',
        pincodeLength: 6,
        pincodeLabel: 'Pincode',
        states: INDIAN_STATES,
        currency: 'INR',
        currencySymbol: '₹',
        isActive: true,
        isDefault: true,
        order: 0,
      };

      await CountrySettings.findOneAndUpdate(
        { countryCode: 'IN' },
        indiaData,
        { upsert: true, new: true }
      );

      console.log('   ✅ Migrated India country settings (default)');
    } catch (error) {
      console.error('❌ Error migrating India settings:', error);
      throw error;
    }

    // ============================================
    // 2. Add More Countries (Optional)
    // ============================================
    console.log('\n📦 Adding additional countries (optional)...');
    
    // Example: United States (commented out - uncomment to add)
    /*
    try {
      const usaData = {
        countryCode: 'US',
        countryName: 'United States',
        phoneCountryCode: '+1',
        phonePattern: '^[0-9]{10}$',
        phoneLength: 10,
        pincodePattern: '^[0-9]{5}(-[0-9]{4})?$',
        pincodeLength: 5,
        pincodeLabel: 'ZIP Code',
        states: [], // Can add US states if needed
        currency: 'USD',
        currencySymbol: '$',
        isActive: true,
        isDefault: false,
        order: 1,
      };

      await CountrySettings.findOneAndUpdate(
        { countryCode: 'US' },
        usaData,
        { upsert: true, new: true }
      );

      console.log('   ✅ Added United States country settings');
    } catch (error) {
      console.error('❌ Error adding US settings:', error);
    }
    */

    console.log('\n✅ Country settings migration complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Verify country settings in MongoDB Atlas');
    console.log('   2. Add more countries as needed');
    console.log('   3. Update address validation to use country settings');
    console.log('   4. Test registration and address forms');
    console.log('\n✨ Migration successful!\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

// Run migration
migrate();
