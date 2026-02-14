import { describe, it, expect } from 'vitest';
import {
  generateIdempotencyKey,
  generatePaymentIdempotencyKey,
  generateWebhookIdempotencyKey,
  generateOrderIdempotencyKey,
} from '@/lib/utils/idempotency';

describe('idempotency', () => {
  describe('generateIdempotencyKey', () => {
    it('returns key with default prefix op', () => {
      const key = generateIdempotencyKey();
      expect(key).toMatch(/^op-\d{14}-[a-f0-9]{16}$/);
    });

    it('returns key with custom prefix', () => {
      const key = generateIdempotencyKey('order');
      expect(key).toMatch(/^order-\d{14}-[a-f0-9]{16}$/);
    });

    it('produces different keys on consecutive calls', () => {
      const a = generateIdempotencyKey('x');
      const b = generateIdempotencyKey('x');
      expect(a).not.toBe(b);
    });
  });

  describe('generatePaymentIdempotencyKey', () => {
    it('returns payment key from paymentId only', () => {
      const key = generatePaymentIdempotencyKey('pay_123');
      expect(key).toMatch(/^payment-[a-f0-9]{16}$/);
    });

    it('returns payment key from paymentId and paymentIntentId', () => {
      const key = generatePaymentIdempotencyKey('pay_123', 'pi_456');
      expect(key).toMatch(/^payment-[a-f0-9]{16}$/);
    });

    it('same inputs produce same key', () => {
      const a = generatePaymentIdempotencyKey('pay_1', 'pi_1');
      const b = generatePaymentIdempotencyKey('pay_1', 'pi_1');
      expect(a).toBe(b);
    });
  });

  describe('generateWebhookIdempotencyKey', () => {
    it('returns webhook key', () => {
      const key = generateWebhookIdempotencyKey('wh_1', 'payment.completed');
      expect(key).toMatch(/^webhook-[a-f0-9]{16}$/);
    });

    it('same inputs produce same key', () => {
      const a = generateWebhookIdempotencyKey('ev_1', 'order.created');
      const b = generateWebhookIdempotencyKey('ev_1', 'order.created');
      expect(a).toBe(b);
    });
  });

  describe('generateOrderIdempotencyKey', () => {
    it('returns order key', () => {
      const key = generateOrderIdempotencyKey('ord_1', 'confirm');
      expect(key).toMatch(/^order-confirm-[a-f0-9]{16}$/);
    });

    it('same inputs produce same key', () => {
      const a = generateOrderIdempotencyKey('ord_1', 'cancel');
      const b = generateOrderIdempotencyKey('ord_1', 'cancel');
      expect(a).toBe(b);
    });
  });
});
