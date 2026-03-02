/**
 * Update Image Paths Script
 * 
 * Updates hero and about image paths from .jpg to .png in database
 * 
 * Usage: npm run update:image-paths
 * 
 * This script updates existing database records to use .png extensions
 * instead of .jpg for hero and about images.
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
import { SiteSettings } from '@/models';

/**
 * Main update function
 */
async function updateImagePaths() {
  try {
    console.log('🚀 Starting image paths update...\n');

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ Connected to MongoDB\n');

    // ============================================
    // 1. Update Hero Image Path
    // ============================================
    console.log('📦 Updating Hero Image Path...');
    try {
      const heroSettings = await SiteSettings.findOne({ type: 'hero' });
      
      if (heroSettings && heroSettings.data && typeof heroSettings.data === 'object') {
        const heroData = heroSettings.data as { hero?: { image?: string } };
        
        if (heroData.hero?.image && heroData.hero.image.endsWith('.jpg')) {
          heroData.hero.image = heroData.hero.image.replace('.jpg', '.png');
          await heroSettings.save();
          console.log('   ✅ Updated hero image path to .png');
        } else if (heroData.hero?.image && heroData.hero.image.endsWith('.png')) {
          console.log('   ℹ️  Hero image path already uses .png');
        } else {
          console.log('   ⚠️  Hero image path not found or invalid');
        }
      } else {
        console.log('   ⚠️  Hero settings not found in database');
      }
    } catch (error) {
      console.error('❌ Error updating hero image path:', error);
      throw error;
    }

    // ============================================
    // 2. Update About Image Path
    // ============================================
    console.log('📦 Updating About Image Path...');
    try {
      const aboutSettings = await SiteSettings.findOne({ type: 'about' });
      
      if (aboutSettings && aboutSettings.data && typeof aboutSettings.data === 'object') {
        const aboutData = aboutSettings.data as { about?: { image?: string } };
        
        if (aboutData.about?.image && aboutData.about.image.endsWith('.jpg')) {
          aboutData.about.image = aboutData.about.image.replace('.jpg', '.png');
          await aboutSettings.save();
          console.log('   ✅ Updated about image path to .png');
        } else if (aboutData.about?.image && aboutData.about.image.endsWith('.png')) {
          console.log('   ℹ️  About image path already uses .png');
        } else {
          console.log('   ⚠️  About image path not found or invalid');
        }
      } else {
        console.log('   ⚠️  About settings not found in database');
      }
    } catch (error) {
      console.error('❌ Error updating about image path:', error);
      throw error;
    }

    console.log('\n✅ Image paths update complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Redeploy the application to production');
    console.log('   2. Verify images load correctly');
    console.log('\n✨ Update successful!\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Update failed:', error);
    process.exit(1);
  }
}

// Run update
updateImagePaths();
