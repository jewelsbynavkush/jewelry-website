/**
 * API Test Helpers
 * 
 * Helper functions for testing API routes:
 * - Request builders
 * - Response validators
 * - Authentication helpers
 */

import { NextRequest } from 'next/server';
import { generateToken } from '@/lib/auth/jwt';
import mongoose from 'mongoose';

/**
 * Create a mock NextRequest
 * 
 * Includes proper headers for security middleware (Origin, Referer) to pass CSRF validation
 */
export function createMockRequest(
  method: string = 'GET',
  url: string = 'http://localhost:3000/api/test',
  body?: any,
  headers: Record<string, string> = {}
): NextRequest {
  const defaultHeaders: Record<string, string> = {
    'Origin': 'http://localhost:3000',
    'Referer': 'http://localhost:3000/',
  };
  
  // Only add Content-Type if not explicitly removed (null/undefined in headers means remove it)
  if (!('Content-Type' in headers) || headers['Content-Type'] !== null) {
    defaultHeaders['Content-Type'] = 'application/json';
  }
  
  const requestInit: any = {
    method,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
  };
  
  // Remove null/undefined headers (used to explicitly remove default headers)
  Object.keys(requestInit.headers).forEach(key => {
    if (requestInit.headers[key] === null || requestInit.headers[key] === undefined) {
      delete requestInit.headers[key];
    }
  });

  if (body && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
    requestInit.body = JSON.stringify(body);
  }

  return new NextRequest(url, requestInit);
}

/**
 * Create authenticated request
 */
export function createAuthenticatedRequest(
  userId: string,
  mobile: string,
  role: 'customer' | 'admin' | 'staff' = 'customer',
  method: string = 'GET',
  url: string = 'http://localhost:3000/api/test',
  body?: any
): NextRequest {
  const token = generateToken(userId, mobile, role);
  return createMockRequest(method, url, body, {
    Authorization: `Bearer ${token}`,
  });
}

/**
 * Create admin request
 */
export function createAdminRequest(
  userId: string,
  mobile: string,
  method: string = 'GET',
  url: string = 'http://localhost:3000/api/test',
  body?: any
): NextRequest {
  return createAuthenticatedRequest(userId, mobile, 'admin', method, url, body);
}

/**
 * Create guest request (no auth)
 */
export function createGuestRequest(
  method: string = 'GET',
  url: string = 'http://localhost:3000/api/test',
  body?: any,
  sessionId?: string
): NextRequest {
  const request = createMockRequest(method, url, body);
  if (sessionId) {
    request.cookies.set('session-id', sessionId);
  }
  return request;
}

/**
 * Extract JSON from response
 */
export async function getJsonResponse(response: Response): Promise<any> {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

/**
 * Assert response status
 */
export function expectStatus(response: Response, status: number): void {
  expect(response.status).toBe(status);
}

/**
 * Assert response has error
 */
export function expectError(response: any, errorMessage?: string): void {
  expect(response).toHaveProperty('error');
  if (errorMessage) {
    expect(response.error).toContain(errorMessage);
  }
}

/**
 * Assert response has success
 */
export function expectSuccess(response: any): void {
  expect(response).toHaveProperty('success');
  expect(response.success).toBe(true);
}

/**
 * Assert response has data
 */
export function expectData(response: any, dataKey?: string): void {
  if (dataKey) {
    expect(response).toHaveProperty(dataKey);
  } else {
    expect(response).toHaveProperty('data');
  }
}

/**
 * Create ObjectId string
 */
export function createObjectId(): string {
  return new mongoose.Types.ObjectId().toString();
}
