/**
 * API Documentation Route
 * 
 * Returns OpenAPI 3.0 specification for all API endpoints
 * Can be used with Swagger UI or other OpenAPI tools
 * 
 * Access:
 * - Swagger UI: /api/docs (page)
 * - OpenAPI JSON: /api/docs (this route)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSecurityHeaders } from '@/lib/security/api-headers';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Jewels by NavKush API',
    version: '1.0.0',
    description: 'Complete API documentation for the Jewels by NavKush e-commerce platform',
    contact: {
      name: 'API Support',
      email: 'support@jewelsbynavkush.com',
    },
  },
  servers: [
    {
      url: `${baseUrl}/api`,
      description: 'Production Server',
    },
    {
      url: 'http://localhost:3000/api',
      description: 'Development Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token obtained from /api/auth/login',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Error message',
          },
          details: {
            type: 'array',
            items: { type: 'object' },
            description: 'Validation error details (optional)',
          },
        },
        required: ['error'],
      },
      Success: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            description: 'Success message',
          },
        },
      },
    },
    responses: {
      BadRequest: {
        description: 'Bad request',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
      Unauthorized: {
        description: 'Unauthorized',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
      NotFound: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
      TooManyRequests: {
        description: 'Too many requests',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
        headers: {
          'Retry-After': {
            schema: { type: 'string' },
            description: 'Seconds until retry',
          },
        },
      },
      InternalServerError: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
      Cart: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                productId: { type: 'string' },
                sku: { type: 'string' },
                title: { type: 'string' },
                image: { type: 'string' },
                price: { type: 'number' },
                quantity: { type: 'number' },
                subtotal: { type: 'number' },
              },
            },
          },
          subtotal: { type: 'number' },
          tax: { type: 'number' },
          shipping: { type: 'number' },
          discount: { type: 'number' },
          total: { type: 'number' },
          currency: { type: 'string', example: 'INR' },
        },
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          orderNumber: { type: 'string' },
          status: {
            type: 'string',
            enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
          },
          paymentStatus: {
            type: 'string',
            enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
          },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                productId: { type: 'string' },
                sku: { type: 'string' },
                title: { type: 'string' },
                quantity: { type: 'number' },
                price: { type: 'number' },
                total: { type: 'number' },
              },
            },
          },
          total: { type: 'number' },
          currency: { type: 'string', example: 'INR' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          mobile: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string' },
          mobileVerified: { type: 'boolean' },
          emailVerified: { type: 'boolean' },
          role: {
            type: 'string',
            enum: ['customer', 'admin', 'staff'],
          },
        },
      },
    },
  },
  paths: {
    '/cart': {
      get: {
        summary: 'Get cart',
        description: 'Retrieve user cart or guest cart',
        tags: ['Cart'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Cart retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    cart: { $ref: '#/components/schemas/Cart' },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
      post: {
        summary: 'Add item to cart',
        description: 'Add a product to the cart',
        tags: ['Cart'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['productId', 'quantity'],
                properties: {
                  productId: { type: 'string', example: '507f1f77bcf86cd799439011' },
                  quantity: { type: 'integer', minimum: 1, maximum: 100, example: 2 },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Item added to cart',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    cart: { $ref: '#/components/schemas/Cart' },
                  },
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '429': { $ref: '#/components/responses/TooManyRequests' },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
      delete: {
        summary: 'Clear cart',
        description: 'Remove all items from cart',
        tags: ['Cart'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Cart cleared',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Success' },
              },
            },
          },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },
    '/cart/{itemId}': {
      patch: {
        summary: 'Update cart item quantity',
        description: 'Update quantity of an item in the cart',
        tags: ['Cart'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'itemId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Product ID of the cart item',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['quantity'],
                properties: {
                  quantity: { type: 'integer', minimum: 0, maximum: 100, example: 3 },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Item quantity updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    cart: { $ref: '#/components/schemas/Cart' },
                  },
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '404': { $ref: '#/components/responses/NotFound' },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
      delete: {
        summary: 'Remove item from cart',
        description: 'Remove a specific item from the cart',
        tags: ['Cart'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'itemId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Product ID of the cart item',
          },
        ],
        responses: {
          '200': {
            description: 'Item removed from cart',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    cart: { $ref: '#/components/schemas/Cart' },
                  },
                },
              },
            },
          },
          '404': { $ref: '#/components/responses/NotFound' },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },
    '/orders': {
      post: {
        summary: 'Create order',
        description: 'Create a new order from cart',
        tags: ['Orders'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['shippingAddress', 'billingAddress', 'paymentMethod'],
                properties: {
                  shippingAddress: {
                    type: 'object',
                    required: ['firstName', 'lastName', 'addressLine1', 'city', 'state', 'zipCode', 'country'],
                    properties: {
                      firstName: { type: 'string' },
                      lastName: { type: 'string' },
                      addressLine1: { type: 'string' },
                      city: { type: 'string' },
                      state: { type: 'string' },
                      zipCode: { type: 'string' },
                      country: { type: 'string' },
                      phone: { type: 'string' },
                    },
                  },
                  billingAddress: {
                    type: 'object',
                    required: ['firstName', 'lastName', 'addressLine1', 'city', 'state', 'zipCode', 'country'],
                    properties: {
                      firstName: { type: 'string' },
                      lastName: { type: 'string' },
                      addressLine1: { type: 'string' },
                      city: { type: 'string' },
                      state: { type: 'string' },
                      zipCode: { type: 'string' },
                      country: { type: 'string' },
                      phone: { type: 'string' },
                    },
                  },
                  paymentMethod: {
                    type: 'string',
                    enum: ['razorpay', 'cod', 'bank_transfer', 'other'],
                  },
                  customerNotes: { type: 'string' },
                  idempotencyKey: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Order created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    order: { $ref: '#/components/schemas/Order' },
                  },
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '429': { $ref: '#/components/responses/TooManyRequests' },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
      get: {
        summary: 'List user orders',
        description: 'Get paginated list of user orders',
        tags: ['Orders'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1 },
            description: 'Page number',
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 20 },
            description: 'Items per page',
          },
          {
            name: 'status',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
            },
            description: 'Filter by order status',
          },
        ],
        responses: {
          '200': {
            description: 'Orders retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    orders: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Order' },
                    },
                    pagination: {
                      type: 'object',
                      properties: {
                        page: { type: 'integer' },
                        limit: { type: 'integer' },
                        total: { type: 'integer' },
                        totalPages: { type: 'integer' },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },
    '/orders/{orderId}': {
      get: {
        summary: 'Get order details',
        description: 'Get detailed information about a specific order',
        tags: ['Orders'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'orderId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Order ID',
          },
        ],
        responses: {
          '200': {
            description: 'Order details',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    order: { $ref: '#/components/schemas/Order' },
                  },
                },
              },
            },
          },
          '404': { $ref: '#/components/responses/NotFound' },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },
    '/orders/{orderId}/cancel': {
      post: {
        summary: 'Cancel order',
        description: 'Cancel an order and restore stock',
        tags: ['Orders'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'orderId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Order ID',
          },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  reason: { type: 'string' },
                  idempotencyKey: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Order cancelled successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Success' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '404': { $ref: '#/components/responses/NotFound' },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },
    '/auth/register': {
      post: {
        summary: 'Register user',
        description: 'Register a new user with mobile number',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['mobile', 'firstName', 'lastName', 'password'],
                properties: {
                  mobile: { type: 'string', pattern: '^[0-9]{10}$', example: '9876543210' },
                  countryCode: { type: 'string', default: '+91', example: '+91' },
                  firstName: { type: 'string', example: 'John' },
                  lastName: { type: 'string', example: 'Doe' },
                  email: { type: 'string', format: 'email', example: 'john@example.com' },
                  password: { type: 'string', minLength: 6, example: 'password123' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    user: { $ref: '#/components/schemas/User' },
                    token: { type: 'string', description: 'JWT token' },
                  },
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '429': { $ref: '#/components/responses/TooManyRequests' },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Login user',
        description: 'Authenticate user with mobile/email and password',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['identifier', 'password'],
                properties: {
                  identifier: { type: 'string', description: 'Mobile number or email', example: '9876543210' },
                  password: { type: 'string', example: 'password123' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    user: { $ref: '#/components/schemas/User' },
                    token: { type: 'string', description: 'JWT token' },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '423': {
            description: 'Account locked',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          '429': { $ref: '#/components/responses/TooManyRequests' },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },
    '/auth/logout': {
      post: {
        summary: 'Logout user',
        description: 'Logout user and clear session',
        tags: ['Authentication'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Logout successful',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Success' },
              },
            },
          },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },
    '/auth/verify-mobile': {
      post: {
        summary: 'Verify mobile OTP',
        description: 'Verify mobile number with OTP',
        tags: ['Authentication'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['otp'],
                properties: {
                  otp: { type: 'string', pattern: '^[0-9]{6}$', example: '123456' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Mobile verified successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Success' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '429': { $ref: '#/components/responses/TooManyRequests' },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },
    '/auth/resend-otp': {
      post: {
        summary: 'Resend OTP',
        description: 'Resend OTP to mobile number',
        tags: ['Authentication'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'OTP sent successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Success' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '429': { $ref: '#/components/responses/TooManyRequests' },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },
    '/auth/reset-password': {
      post: {
        summary: 'Request password reset',
        description: 'Request password reset token',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['identifier'],
                properties: {
                  identifier: { type: 'string', description: 'Mobile number or email', example: '9876543210' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Password reset email sent (if account exists)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Success' },
              },
            },
          },
          '429': { $ref: '#/components/responses/TooManyRequests' },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },
    '/auth/reset-password/confirm': {
      post: {
        summary: 'Confirm password reset',
        description: 'Reset password with token',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['token', 'password'],
                properties: {
                  token: { type: 'string', description: 'Reset token from email' },
                  password: { type: 'string', minLength: 6, example: 'newpassword123' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Password reset successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Success' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '429': { $ref: '#/components/responses/TooManyRequests' },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },
    '/users/profile': {
      get: {
        summary: 'Get user profile',
        description: 'Get authenticated user profile',
        tags: ['User Profile'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Profile retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
      patch: {
        summary: 'Update user profile',
        description: 'Update user profile information',
        tags: ['User Profile'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  displayName: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Profile updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },
    '/users/addresses': {
      get: {
        summary: 'List user addresses',
        description: 'Get all addresses for authenticated user',
        tags: ['User Profile'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Addresses retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    addresses: {
                      type: 'array',
                      items: { type: 'object' },
                    },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
      post: {
        summary: 'Add address',
        description: 'Add a new address to user profile',
        tags: ['User Profile'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['type', 'firstName', 'lastName', 'addressLine1', 'city', 'state', 'zipCode', 'country'],
                properties: {
                  type: { type: 'string', enum: ['shipping', 'billing', 'both'] },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  addressLine1: { type: 'string' },
                  city: { type: 'string' },
                  state: { type: 'string' },
                  zipCode: { type: 'string' },
                  country: { type: 'string' },
                  phone: { type: 'string' },
                  isDefault: { type: 'boolean', default: false },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Address added successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Success' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },
    '/users/addresses/{addressId}': {
      patch: {
        summary: 'Update address',
        description: 'Update an existing address',
        tags: ['User Profile'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'addressId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  addressLine1: { type: 'string' },
                  city: { type: 'string' },
                  state: { type: 'string' },
                  zipCode: { type: 'string' },
                  country: { type: 'string' },
                  phone: { type: 'string' },
                  isDefault: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Address updated successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Success' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '404': { $ref: '#/components/responses/NotFound' },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
      delete: {
        summary: 'Delete address',
        description: 'Delete an address from user profile',
        tags: ['User Profile'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'addressId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Address deleted successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Success' },
              },
            },
          },
          '404': { $ref: '#/components/responses/NotFound' },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },
    '/users/password': {
      patch: {
        summary: 'Change password',
        description: 'Change user password',
        tags: ['User Profile'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['currentPassword', 'newPassword'],
                properties: {
                  currentPassword: { type: 'string' },
                  newPassword: { type: 'string', minLength: 6 },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Password changed successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Success' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '429': { $ref: '#/components/responses/TooManyRequests' },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },
    '/products': {
      get: {
        summary: 'List products',
        description: 'Get paginated list of products',
        tags: ['Products'],
        parameters: [
          {
            name: 'category',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['rings', 'earrings', 'necklaces', 'bracelets'],
            },
            description: 'Filter by category',
          },
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 20 },
          },
        ],
        responses: {
          '200': {
            description: 'Products retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    products: {
                      type: 'array',
                      items: { type: 'object' },
                    },
                    pagination: { type: 'object' },
                  },
                },
              },
            },
          },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },
    '/products/{slug}': {
      get: {
        summary: 'Get product by slug',
        description: 'Get detailed product information',
        tags: ['Products'],
        parameters: [
          {
            name: 'slug',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Product retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    product: { type: 'object' },
                  },
                },
              },
            },
          },
          '404': { $ref: '#/components/responses/NotFound' },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },
    '/categories': {
      get: {
        summary: 'Get categories',
        description: 'Get all active product categories',
        tags: ['Categories'],
        responses: {
          '200': {
            description: 'Categories retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    categories: {
                      type: 'array',
                      items: { type: 'object' },
                    },
                  },
                },
              },
            },
          },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },
    '/auth/refresh': {
      post: {
        summary: 'Refresh access token',
        description: 'Refresh access token using refresh token (OAuth 2.0 style)',
        tags: ['Authentication'],
        responses: {
          '200': {
            description: 'Token refreshed successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '429': { $ref: '#/components/responses/TooManyRequests' },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },
    '/auth/verify-email': {
      post: {
        summary: 'Verify email OTP',
        description: 'Verify email address with OTP',
        tags: ['Authentication'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['otp'],
                properties: {
                  otp: { type: 'string', pattern: '^[0-9]{6}$', description: '6-digit OTP' },
                  email: { type: 'string', format: 'email', description: 'Email address (optional if authenticated)' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Email verified successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    user: { type: 'object' },
                  },
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '429': { $ref: '#/components/responses/TooManyRequests' },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },
    '/auth/resend-email-otp': {
      post: {
        summary: 'Resend email OTP',
        description: 'Resend OTP to email address',
        tags: ['Authentication'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'OTP resent successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    otp: { type: 'string', description: 'OTP (development only)' },
                  },
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '429': { $ref: '#/components/responses/TooManyRequests' },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },
    '/content/{page}': {
      get: {
        summary: 'Get page content',
        description: 'Get content for a specific page',
        tags: ['Content'],
        parameters: [
          {
            name: 'page',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Page identifier',
          },
        ],
        responses: {
          '200': {
            description: 'Content retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    content: { type: 'object' },
                  },
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '404': { $ref: '#/components/responses/NotFound' },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },
    '/site-settings': {
      get: {
        summary: 'Get site settings',
        description: 'Get site configuration and settings',
        tags: ['Site Settings'],
        responses: {
          '200': {
            description: 'Settings retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    settings: { type: 'object' },
                  },
                },
              },
            },
          },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },
    '/contact': {
      post: {
        summary: 'Submit contact form',
        description: 'Submit contact form message',
        tags: ['Contact'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'message'],
                properties: {
                  name: { type: 'string', maxLength: 100 },
                  email: { type: 'string', format: 'email', maxLength: 254 },
                  phone: { type: 'string', maxLength: 20 },
                  message: { type: 'string', maxLength: 5000 },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Message submitted successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Success' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '413': { description: 'Request too large' },
          '429': { $ref: '#/components/responses/TooManyRequests' },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },
    '/health': {
      get: {
        summary: 'Health check',
        description: 'Check service health and database connectivity',
        tags: ['Health'],
        responses: {
          '200': {
            description: 'Service is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', enum: ['healthy', 'unhealthy'] },
                    timestamp: { type: 'string', format: 'date-time' },
                    uptime: { type: 'number' },
                    services: {
                      type: 'object',
                      properties: {
                        database: {
                          type: 'object',
                          properties: {
                            status: { type: 'string', enum: ['connected', 'disconnected', 'error'] },
                            responseTime: { type: 'number' },
                            error: { type: 'string' },
                          },
                        },
                      },
                    },
                    responseTime: { type: 'number' },
                  },
                },
              },
            },
          },
          '503': {
            description: 'Service is unhealthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', enum: ['unhealthy'] },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/inventory/{productId}': {
      get: {
        summary: 'Get inventory status',
        description: 'Get inventory status for a product (admin only)',
        tags: ['Inventory'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'productId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Product ID',
          },
        ],
        responses: {
          '200': {
            description: 'Inventory status retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    productId: { type: 'string' },
                    inventory: { type: 'object' },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },
    '/inventory/low-stock': {
      get: {
        summary: 'Get low stock alerts',
        description: 'Get products with low stock (admin only)',
        tags: ['Inventory'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 50 },
            description: 'Maximum number of products to return',
          },
        ],
        responses: {
          '200': {
            description: 'Low stock products retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    products: {
                      type: 'array',
                      items: { type: 'object' },
                    },
                    count: { type: 'integer' },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },
    '/inventory/logs': {
      get: {
        summary: 'Get inventory logs',
        description: 'Get inventory transaction logs (admin only)',
        tags: ['Inventory'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'productId',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filter by product ID',
          },
          {
            name: 'orderId',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filter by order ID',
          },
          {
            name: 'type',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filter by log type',
          },
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 50 },
          },
        ],
        responses: {
          '200': {
            description: 'Inventory logs retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    logs: {
                      type: 'array',
                      items: { type: 'object' },
                    },
                    pagination: { type: 'object' },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },
    '/inventory/{productId}/restock': {
      post: {
        summary: 'Restock product',
        description: 'Restock a product (admin only)',
        tags: ['Inventory'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'productId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Product ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['quantity'],
                properties: {
                  quantity: { type: 'integer', minimum: 1 },
                  reason: { type: 'string', maxLength: 500 },
                  idempotencyKey: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Product restocked successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    product: { type: 'object' },
                  },
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
          '429': { $ref: '#/components/responses/TooManyRequests' },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },
  },
  tags: [
    { name: 'Cart', description: 'Shopping cart operations' },
    { name: 'Orders', description: 'Order management' },
    { name: 'Authentication', description: 'User authentication and authorization' },
    { name: 'User Profile', description: 'User profile and address management' },
    { name: 'Products', description: 'Product catalog' },
    { name: 'Categories', description: 'Product categories' },
    { name: 'Content', description: 'Page content' },
    { name: 'Site Settings', description: 'Site configuration' },
    { name: 'Contact', description: 'Contact form' },
    { name: 'Health', description: 'Health checks' },
    { name: 'Inventory', description: 'Inventory management (admin only)' },
  ],
};

/**
 * GET /api/docs
 * Returns OpenAPI 3.0 specification (JSON) or Swagger UI (HTML)
 */
export async function GET(request: NextRequest) {
  const acceptHeader = request.headers.get('accept') || '';
  const isHtmlRequest = acceptHeader.includes('text/html') || request.nextUrl.searchParams.get('ui') === 'true';

  // Serve Swagger UI HTML interface for interactive API documentation
  // Allows developers to test API endpoints directly from browser
  if (isHtmlRequest) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API Documentation - Jewels by NavKush</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
  <style>
    body { margin: 0; }
    #swagger-ui { padding: 20px; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
  <script>
    window.onload = function() {
      SwaggerUIBundle({
        url: '/api/docs',
        dom_id: '#swagger-ui',
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIBundle.presets.standalone,
        ],
        layout: 'StandaloneLayout',
        deepLinking: true,
        displayRequestDuration: true,
        filter: true,
        tryItOutEnabled: true,
      });
    };
  </script>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        ...getSecurityHeaders(),
        'Content-Type': 'text/html',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  }

  // Return OpenAPI 3.0 specification in JSON format
  // Can be imported into Swagger UI, Postman, or other API tools
  return NextResponse.json(openApiSpec, {
    headers: {
      ...getSecurityHeaders(),
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
