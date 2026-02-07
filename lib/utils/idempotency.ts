/**
 * Idempotency Key Utilities
 * 
 * Provides functions to generate and validate idempotency keys
 * for preventing duplicate processing of operations (payments, webhooks, etc.)
 */

import crypto from 'crypto';

/**
 * Generate a unique idempotency key
 * 
 * Format: {prefix}-{timestamp}-{random}
 * Example: "payment-20250101120000-abc123def456"
 * 
 * @param prefix - Prefix for the key (e.g., 'payment', 'webhook', 'order')
 * @returns Unique idempotency key
 */
export function generateIdempotencyKey(prefix: string = 'op'): string {
  const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
  const random = crypto.randomBytes(8).toString('hex');
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Generate idempotency key from payment data
 * Useful for payment webhooks to ensure same payment isn't processed twice
 * 
 * @param paymentId - Payment ID from payment gateway
 * @param paymentIntentId - Payment intent ID (optional)
 * @returns Idempotency key
 */
export function generatePaymentIdempotencyKey(
  paymentId: string,
  paymentIntentId?: string
): string {
  const base = paymentIntentId ? `${paymentIntentId}-${paymentId}` : paymentId;
  const hash = crypto.createHash('sha256').update(base).digest('hex').slice(0, 16);
  return `payment-${hash}`;
}

/**
 * Generate idempotency key from webhook data
 * 
 * @param webhookId - Webhook event ID
 * @param eventType - Type of webhook event
 * @returns Idempotency key
 */
export function generateWebhookIdempotencyKey(
  webhookId: string,
  eventType: string
): string {
  const base = `${eventType}-${webhookId}`;
  const hash = crypto.createHash('sha256').update(base).digest('hex').slice(0, 16);
  return `webhook-${hash}`;
}

/**
 * Generate idempotency key for order operations
 * 
 * @param orderId - Order ID
 * @param operation - Operation type (e.g., 'confirm', 'cancel', 'refund')
 * @returns Idempotency key
 */
export function generateOrderIdempotencyKey(
  orderId: string,
  operation: string
): string {
  const hash = crypto.createHash('sha256').update(`${orderId}-${operation}`).digest('hex').slice(0, 16);
  return `order-${operation}-${hash}`;
}
