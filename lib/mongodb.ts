import mongoose from 'mongoose';
import { logError } from '@/lib/security/error-handler';
import logger from '@/lib/utils/logger';
import { isTest, getMongoDbUri } from '@/lib/utils/env';

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null };
}

const cached = global.mongoose;

/**
 * Configure MongoDB connection with automatic reconnection
 */
function configureMongoConnection() {
  // Connection event handlers for automatic reconnection
  mongoose.connection.on('connected', () => {
    if (!isTest()) {
      logger.info('MongoDB connected successfully');
    }
  });

  mongoose.connection.on('error', (err) => {
    logError('MongoDB connection error', err);
  });

  mongoose.connection.on('disconnected', () => {
    if (!isTest()) {
      logger.warn('MongoDB disconnected. Will attempt to reconnect...');
    }
  });

  // Handle process termination
  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    if (!isTest()) {
      logger.info('MongoDB connection closed through app termination');
    }
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await mongoose.connection.close();
    if (!isTest()) {
      logger.info('MongoDB connection closed through app termination');
    }
    process.exit(0);
  });
}

/**
 * Connect to MongoDB with automatic reconnection handling
 * 
 * Features:
 * - Connection pooling
 * - Automatic reconnection on connection loss
 * - Graceful shutdown handling
 * - Error handling and retry logic
 */
async function connectDB() {
  // Use centralized environment utility for secure credential access
  // Lazy evaluation prevents connection attempts before environment is configured
  const MONGODB_URI = getMongoDbUri();

  // Return existing connection if available and still alive
  // Reuses connection across requests to improve performance
  if (cached.conn) {
    // Verify connection is still active before reusing
    if (mongoose.connection.readyState === 1) {
      return cached.conn;
    }
    // Connection is dead, reset cache
    cached.conn = null;
    cached.promise = null;
  }

  // Configure connection event handlers (only once)
  if (!cached.promise) {
    configureMongoConnection();
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10, // Maximum number of connections in the pool
      serverSelectionTimeoutMS: 5000, // How long to try selecting a server
      socketTimeoutMS: 45000, // How long to wait for a socket
      family: 4, // Use IPv4, skip trying IPv6
      // Automatic reconnection is handled by Mongoose by default
      // These options ensure proper reconnection behavior
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (cached as any).promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    // Re-throw to allow retry logic in calling code
    throw e;
  }

  return cached.conn;
}

export default connectDB;
