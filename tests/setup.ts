/**
 * Test Setup File
 * 
 * Configures test environment:
 * - MongoDB Memory Server for in-memory database
 * - Test database connection
 * - Global test utilities
 * - Database function mocks (prevents real DB calls)
 */

/**
 * Test Setup File
 * 
 * Configures test environment:
 * - MongoDB Memory Server for in-memory database (LOCAL, not real DB)
 * - Test database connection
 * - Global test utilities
 * - Database function mocks (prevents real DB calls)
 * 
 * IMPORTANT: All database access functions are mocked.
 * Tests use LOCAL test database (MongoDB Memory Server) for model operations only.
 * No real database calls will be made.
 */

// Import mocks FIRST (before any other imports)
// This ensures all database functions are mocked
import './helpers/mocks/database-mocks';
import './helpers/mocks/address-validation-mocks';

import { beforeAll, afterAll, beforeEach } from 'vitest';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoReplSet: MongoMemoryReplSet;

/**
 * Setup before all tests
 */
beforeAll(async () => {
  // Mocks are already set up via imports above
  // All database access functions (getCategories, getDefaultCountry, etc.) are now mocked
  // They will return mock data and NOT call real database

  // Start MongoDB Memory Server as replica set (required for transactions)
  // Note: Transactions require a replica set, even in test environment
  // Using MongoMemoryReplSet for proper replica set support
  // This is for LOCAL test database (in-memory), NOT real production database
  mongoReplSet = await MongoMemoryReplSet.create({
    replSet: {
      count: 1,
      name: 'rs0',
    },
  });
  const mongoUri = mongoReplSet.getUri();

  // Connect to LOCAL test database (in-memory, not real DB)
  // This is only used for model operations (create, save, find, etc.)
  // All data access functions are mocked and won't use this connection
  await mongoose.connect(mongoUri);
  
  // Set environment variables for tests
  process.env.MONGODB_URI = mongoUri;
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
  process.env.ACCESS_TOKEN_EXPIRES_IN = '1h';
  process.env.NODE_ENV = 'test';
  process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000';
  process.env.NEXT_PUBLIC_ENV = 'development';
});

/**
 * Cleanup after all tests
 */
afterAll(async () => {
  // Close database connection
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  
  // Stop MongoDB Memory Server
  if (mongoReplSet) {
    await mongoReplSet.stop();
  }
});

/**
 * Cleanup before each test
 */
beforeEach(async () => {
  // Clear all collections before each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
