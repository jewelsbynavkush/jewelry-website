import { describe, it, expect, beforeEach, vi } from 'vitest';
import { sendOrderConfirmationEmail, type OrderInvoiceData } from '@/lib/email/order-invoice';
import { sendEmail } from '@/lib/email/gmail';

vi.mock('@/lib/utils/logger', () => ({
  default: { info: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

const mockOrderData: OrderInvoiceData = {
  orderNumber: 'ORD-2026-000001',
  items: [
    { productTitle: 'Gold Ring', productSku: 'SKU-RING-01', quantity: 2, price: 5000, total: 10000 },
    { productTitle: 'Silver Pendant', productSku: 'SKU-PEND-02', quantity: 1, price: 2500, total: 2500 },
  ],
  subtotal: 12500,
  tax: 2250,
  shipping: 100,
  discount: 0,
  total: 14850,
  currency: 'INR',
  shippingAddress: {
    firstName: 'Test',
    lastName: 'User',
    addressLine1: '123 Test St',
    city: 'Mumbai',
    state: 'MH',
    zipCode: '400001',
    country: 'India',
    phone: '9876543210',
    countryCode: '+91',
  },
  billingAddress: {
    firstName: 'Test',
    lastName: 'User',
    addressLine1: '123 Test St',
    city: 'Mumbai',
    state: 'MH',
    zipCode: '400001',
    country: 'India',
    phone: '9876543210',
    countryCode: '+91',
  },
  paymentMethod: 'cod',
  createdAt: new Date().toISOString(),
};

describe('Order Invoice Email', () => {
  beforeEach(() => {
    vi.mocked(sendEmail).mockClear();
  });

  describe('sendOrderConfirmationEmail', () => {
    it('should call sendEmail with correct to, subject and html containing order number', async () => {
      const to = 'customer@example.com';
      await sendOrderConfirmationEmail(to, mockOrderData);

      expect(sendEmail).toHaveBeenCalledTimes(1);
      const call = vi.mocked(sendEmail).mock.calls[0][0];
      expect(call.to).toBe(to);
      expect(call.subject).toContain(mockOrderData.orderNumber);
      expect(call.subject).toContain('Jewels by NavKush');
      expect(call.html).toContain(mockOrderData.orderNumber);
    });

    it('should include order items, totals and addresses in html', async () => {
      await sendOrderConfirmationEmail('user@test.com', mockOrderData);

      const html = vi.mocked(sendEmail).mock.calls[0][0].html;
      expect(html).toContain('Gold Ring');
      expect(html).toContain('Silver Pendant');
      expect(html).toContain('SKU-RING-01');
      expect(html).toContain('SKU-PEND-02');
      expect(html).toContain('12,500');
      expect(html).toContain('14,850');
      expect(html).toContain('SHIPPING ADDRESS');
      expect(html).toContain('BILLING ADDRESS');
      expect(html).toContain('Test User');
      expect(html).toContain('123 Test St');
      expect(html).toContain('Mumbai');
      expect(html).toContain('Cash on Delivery');
    });

    it('should escape HTML in user-supplied content to prevent XSS', async () => {
      const dataWithXss: OrderInvoiceData = {
        ...mockOrderData,
        orderNumber: 'ORD-<script>alert(1)</script>',
        items: [
          { productTitle: '<img src=x onerror=alert(1)>', productSku: 'SKU-1', quantity: 1, price: 100, total: 100 },
        ],
        customerNotes: 'Note with "quotes" and <b>tags</b>',
      };
      await sendOrderConfirmationEmail('user@test.com', dataWithXss);

      const html = vi.mocked(sendEmail).mock.calls[0][0].html;
      expect(html).not.toContain('<script>');
      expect(html).toContain('&lt;script&gt;');
      expect(html).not.toContain('<img ');
      expect(html).toContain('&lt;img');
      expect(html).toContain('&quot;quotes&quot;');
      expect(html).toContain('&lt;b&gt;');
    });

    it('should include discount row when discount > 0', async () => {
      const dataWithDiscount: OrderInvoiceData = {
        ...mockOrderData,
        discount: 500,
        total: 14350,
      };
      await sendOrderConfirmationEmail('user@test.com', dataWithDiscount);

      const html = vi.mocked(sendEmail).mock.calls[0][0].html;
      expect(html).toContain('Discount');
      expect(html).toContain('-₹500.00');
    });

    it('should not include customer notes section when absent', async () => {
      const dataNoNotes: OrderInvoiceData = { ...mockOrderData };
      delete dataNoNotes.customerNotes;
      await sendOrderConfirmationEmail('user@test.com', dataNoNotes);

      const html = vi.mocked(sendEmail).mock.calls[0][0].html;
      expect(html).not.toContain('Notes:</strong>');
    });

    it('should return result from sendEmail', async () => {
      vi.mocked(sendEmail).mockResolvedValueOnce({ success: true, messageId: 'msg-123' });
      const result = await sendOrderConfirmationEmail('user@test.com', mockOrderData);
      expect(result).toEqual({ success: true, messageId: 'msg-123' });

      vi.mocked(sendEmail).mockResolvedValueOnce({ success: false, error: 'SMTP failed' });
      const failResult = await sendOrderConfirmationEmail('user@test.com', mockOrderData);
      expect(failResult).toEqual({ success: false, error: 'SMTP failed' });
    });
  });
});
