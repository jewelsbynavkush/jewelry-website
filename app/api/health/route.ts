/**
 * Health Check API Route
 * 
 * Provides health status for monitoring and load balancers.
 * Returns service status, database connectivity, and system information.
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';
import { createSecureResponse } from '@/lib/security/api-security';

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  services: {
    database: {
      status: 'connected' | 'disconnected' | 'error';
      responseTime?: number;
      error?: string;
    };
  };
  version: string;
}

/**
 * GET /api/health
 * Health check endpoint for monitoring
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const healthStatus: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: {
        status: 'disconnected',
      },
    },
    version: process.env.npm_package_version || '0.1.0',
  };

  // Verify database connectivity and measure response time
  // Critical for monitoring and health checks
  try {
    const dbStartTime = Date.now();
    await connectDB();
    const dbResponseTime = Date.now() - dbStartTime;

    // Verify connection is actually working
    if (mongoose.connection.readyState === 1) {
      healthStatus.services.database = {
        status: 'connected',
        responseTime: dbResponseTime,
      };
    } else {
      healthStatus.services.database = {
        status: 'disconnected',
        error: 'Connection state is not ready',
      };
      healthStatus.status = 'unhealthy';
    }
  } catch (error) {
    healthStatus.services.database = {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    healthStatus.status = 'unhealthy';
  }

  // Determine overall status
  if (healthStatus.services.database.status !== 'connected') {
    healthStatus.status = 'unhealthy';
  }

  const responseTime = Date.now() - startTime;

  // Include response time in health status for performance monitoring
  const response = {
    ...healthStatus,
    responseTime,
  };

  // Return 200 for healthy status, 503 for unhealthy (service unavailable)
  // Allows load balancers to route traffic away from unhealthy instances
  const statusCode = healthStatus.status === 'healthy' ? 200 : 503;

  return createSecureResponse(response, statusCode, request);
}
