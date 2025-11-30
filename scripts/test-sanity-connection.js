/**
 * Test Sanity.io Connection
 * Run this to verify your Sanity.io setup is working
 * 
 * Usage: node scripts/test-sanity-connection.js
 */

/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: true,
});

async function testConnection() {
  console.log('🔍 Testing Sanity.io Connection...\n');
  
  // Check environment variables
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    console.error('❌ ERROR: NEXT_PUBLIC_SANITY_PROJECT_ID not found in .env.local');
    process.exit(1);
  }
  
  console.log('✅ Environment variables found:');
  console.log(`   Project ID: ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}`);
  console.log(`   Dataset: ${process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'}\n`);
  
  try {
    // Test 1: Check if we can connect by fetching documents
    console.log('📡 Testing connection...');
    
    // Test 2: Check if jewelryDesign schema exists
    console.log('🔍 Checking for jewelryDesign content...');
    const query = `*[_type == "jewelryDesign"] | order(_createdAt desc) [0...5]`;
    const designs = await client.fetch(query);
    console.log('✅ Connection successful!\n');
    
    if (designs.length === 0) {
      console.log('⚠️  WARNING: No designs found!\n');
      console.log('📝 This means either:');
      console.log('   1. The schema "jewelryDesign" is not created yet');
      console.log('   2. No designs have been added yet');
      console.log('   3. Designs exist but are not published\n');
      console.log('👉 Next steps:');
      console.log('   1. Follow the guide: docs/SANITY_SCHEMA_SETUP.md');
      console.log('   2. Create the schema in Sanity Studio');
      console.log('   3. Add and publish at least one design\n');
    } else {
      console.log(`✅ Found ${designs.length} design(s):\n`);
      designs.forEach((design, index) => {
        console.log(`   ${index + 1}. ${design.title || 'Untitled'}`);
        console.log(`      ID: ${design._id}`);
        console.log(`      Published: ${design._id ? 'Yes' : 'No'}\n`);
      });
    }
    
    // Test 3: Check all document types
    console.log('📋 Checking available document types...');
    const typesQuery = `*[_type == "sanity.documentType"]`;
    const types = await client.fetch(typesQuery);
    
    if (types.length === 0) {
      console.log('⚠️  No document types found via API');
      console.log('   (This is normal - types are managed in Studio)\n');
    }
    
    // Alternative: Try to fetch any document
    const anyDocQuery = `*[0...1]`;
    const anyDoc = await client.fetch(anyDocQuery);
    console.log(`📄 Total documents in dataset: ${anyDoc.length > 0 ? 'Some documents exist' : 'No documents yet'}\n`);
    
    console.log('✅ All tests completed!\n');
    console.log('📚 For help setting up the schema, see: docs/SANITY_SCHEMA_SETUP.md');
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Check your Project ID is correct');
    console.error('   2. Verify the dataset name (should be "production")');
    console.error('   3. Make sure your Sanity project exists');
    console.error('   4. Check your internet connection');
    process.exit(1);
  }
}

testConnection();

