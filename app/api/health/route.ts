/**
 * Health Check API Route
 * 
 * Provides health status for monitoring and load balancers.
 * Returns service status, database connectivity, and system information.
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';
import { applyApiSecurity, createSecureResponse } from '@/lib/security/api-security';
import { TIME_DURATIONS_MS } from '@/lib/security/constants';
import { getPackageVersion } from '@/lib/utils/env';
import type { HealthResponse } from '@/types/api';

/**
 * GET /api/health
 * Health check endpoint for monitoring
 */
export async function GET(request: NextRequest) {
  // Apply security (CORS, CSRF, rate limiting)
  // Health endpoint is public but should be rate limited
  const securityResponse = applyApiSecurity(request, {
    rateLimitConfig: {
      windowMs: TIME_DURATIONS_MS.ONE_MINUTE,
      maxRequests: 60, // 60 requests per minute for health checks
    },
  });
  if (securityResponse) return securityResponse;

  const startTime = Date.now();
  const healthStatus: Omit<HealthResponse, 'responseTime'> = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: {
        status: 'disconnected',
      },
    },
    version: getPackageVersion(),
  };

  // Verify database connectivity and measure response time
  // Critical for monitoring and health checks
  try {
    const dbStartTime = Date.now();
    await connectDB();
    const dbResponseTime = Date.now() - dbStartTime;

    // Verify database connection state (1 = connected, 0 = disconnected)
    // Ensures health check accurately reflects actual database connectivity
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
    // Security: Don't expose error details in health check response
    // Generic error message prevents information disclosure
    healthStatus.services.database = {
      status: 'error',
      error: 'Database connection failed',
    };
    healthStatus.status = 'unhealthy';
    
    // Log full error details for debugging (not exposed to client)
    const { logError } = await import('@/lib/security/error-handler');
    logError('health check - database connection', error);
  }

  // Determine overall status
  if (healthStatus.services.database.status !== 'connected') {
    healthStatus.status = 'unhealthy';
  }

  const responseTime = Date.now() - startTime;

  // Include response time in health status for performance monitoring
  const responseData: HealthResponse = {
    ...healthStatus,
    responseTime,
  };

  // Return 200 for healthy status, 503 for unhealthy (service unavailable)
  // Allows load balancers to route traffic away from unhealthy instances
  const statusCode = healthStatus.status === 'healthy' ? 200 : 503;

  return createSecureResponse(responseData, statusCode, request);
}
