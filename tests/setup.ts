/**
 * Test Setup File
 * 
 * Configures test environment:
 * - MongoDB Memory Server for in-memory database
 * - Test database connection
 * - Global test utilities
 */

import { beforeAll, afterAll, beforeEach } from 'vitest';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoReplSet: MongoMemoryReplSet;

/**
 * Setup before all tests
 */
beforeAll(async () => {
  // Start MongoDB Memory Server as replica set (required for transactions)
  // Note: Transactions require a replica set, even in test environment
  // Using MongoMemoryReplSet for proper replica set support
  mongoReplSet = await MongoMemoryReplSet.create({
    replSet: {
      count: 1,
      name: 'rs0',
    },
  });
  const mongoUri = mongoReplSet.getUri();

  // Connect to test database
  await mongoose.connect(mongoUri);
  
  // Set environment variables for tests
  process.env.MONGODB_URI = mongoUri;
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.NODE_ENV = 'test';
  process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000';
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
