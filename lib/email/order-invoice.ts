import { sendEmail } from '@/lib/email/gmail';
import { formatPrice } from '@/lib/utils/price-formatting';
import logger from '@/lib/utils/logger';

export interface OrderInvoiceItem {
  productTitle: string;
  productSku: string;
  quantity: number;
  price: number;
  total: number;
}

export interface OrderInvoiceAddress {
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  countryCode: string;
}

export interface OrderInvoiceData {
  orderNumber: string;
  items: OrderInvoiceItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  shippingAddress: OrderInvoiceAddress;
  billingAddress: OrderInvoiceAddress;
  paymentMethod: string;
  customerNotes?: string;
  createdAt: string;
}

function formatAddress(addr: OrderInvoiceAddress): string {
  const lines = [
    `${addr.firstName} ${addr.lastName}`,
    addr.company,
    addr.addressLine1,
    addr.addressLine2,
    `${addr.city}, ${addr.state} ${addr.zipCode}`,
    addr.country,
    `${addr.countryCode} ${addr.phone}`,
  ].filter(Boolean);
  return lines.join('<br>');
}

function paymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    razorpay: 'Razorpay',
    cod: 'Cash on Delivery',
    bank_transfer: 'Bank Transfer',
    other: 'Other',
  };
  return labels[method] ?? method;
}

function buildOrderInvoiceHtml(data: OrderInvoiceData): string {
  const fmt = (n: number) => formatPrice(n, { currencyCode: data.currency });
  const itemsRows = data.items
    .map(
      (item) => `
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e8e5e0; color: #2a2a2a;">${escapeHtml(item.productTitle)}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e8e5e0; color: #6a6a6a; font-size: 13px;">${escapeHtml(item.productSku)}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e8e5e0; color: #2a2a2a; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e8e5e0; color: #2a2a2a; text-align: right;">${fmt(item.price)}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e8e5e0; color: #2a2a2a; text-align: right; font-weight: 600;">${fmt(item.total)}</td>
        </tr>`
    )
    .join('');
  const orderDate = new Date(data.createdAt).toLocaleString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #2a2a2a; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #faf8f5;">
      <div style="background-color: #faf8f5; padding: 30px; border-radius: 8px; border: 1px solid #e8e5e0;">
        <h2 style="color: #CCC4BA; margin-top: 0; font-weight: bold;">Jewels by NavKush</h2>
        <p style="color: #2a2a2a; font-size: 18px; margin-bottom: 4px;">Order Confirmation</p>
        <p style="color: #6a6a6a; font-size: 14px; margin-top: 0;">Order <strong style="color: #2a2a2a;">${escapeHtml(data.orderNumber)}</strong> &middot; ${escapeHtml(orderDate)}</p>

        <table style="width: 100%; border-collapse: collapse; margin: 24px 0; background: #fff; border-radius: 4px; overflow: hidden; border: 1px solid #e8e5e0;">
          <thead>
            <tr style="background-color: #CCC4BA;">
              <th style="padding: 12px; text-align: left; color: #fff; font-size: 13px;">Item</th>
              <th style="padding: 12px; text-align: left; color: #fff; font-size: 13px;">SKU</th>
              <th style="padding: 12px; text-align: center; color: #fff; font-size: 13px;">Qty</th>
              <th style="padding: 12px; text-align: right; color: #fff; font-size: 13px;">Price</th>
              <th style="padding: 12px; text-align: right; color: #fff; font-size: 13px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <table style="width: 100%; max-width: 260px; margin-left: auto;">
          <tr><td style="padding: 6px 0; color: #6a6a6a;">Subtotal</td><td style="padding: 6px 0; text-align: right; color: #2a2a2a;">${fmt(data.subtotal)}</td></tr>
          <tr><td style="padding: 6px 0; color: #6a6a6a;">Tax</td><td style="padding: 6px 0; text-align: right; color: #2a2a2a;">${fmt(data.tax)}</td></tr>
          <tr><td style="padding: 6px 0; color: #6a6a6a;">Shipping</td><td style="padding: 6px 0; text-align: right; color: #2a2a2a;">${fmt(data.shipping)}</td></tr>
          ${data.discount > 0 ? `<tr><td style="padding: 6px 0; color: #6a6a6a;">Discount</td><td style="padding: 6px 0; text-align: right; color: #2a2a2a;">-${fmt(data.discount)}</td></tr>` : ''}
          <tr><td style="padding: 12px 0 0; font-weight: bold; color: #2a2a2a;">Total</td><td style="padding: 12px 0 0; text-align: right; font-weight: bold; color: #2a2a2a; font-size: 18px;">${fmt(data.total)}</td></tr>
        </table>

        <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #e8e5e0;">
          <p style="color: #CCC4BA; font-weight: bold; margin-bottom: 8px; font-size: 14px;">SHIPPING ADDRESS</p>
          <p style="color: #2a2a2a; margin: 0; font-size: 14px;">${formatAddress(data.shippingAddress)}</p>
        </div>
        <div style="margin-top: 20px;">
          <p style="color: #CCC4BA; font-weight: bold; margin-bottom: 8px; font-size: 14px;">BILLING ADDRESS</p>
          <p style="color: #2a2a2a; margin: 0; font-size: 14px;">${formatAddress(data.billingAddress)}</p>
        </div>
        <p style="color: #6a6a6a; font-size: 14px; margin-top: 20px;"><strong style="color: #2a2a2a;">Payment:</strong> ${escapeHtml(paymentMethodLabel(data.paymentMethod))}</p>
        ${data.customerNotes ? `<p style="color: #6a6a6a; font-size: 13px; margin-top: 12px;"><strong style="color: #2a2a2a;">Notes:</strong> ${escapeHtml(data.customerNotes)}</p>` : ''}
        <p style="color: #6a6a6a; font-size: 12px; margin-top: 28px; border-top: 1px solid #e8e5e0; padding-top: 20px;">
          Thank you for your order. If you have any questions, please contact us.
        </p>
      </div>
    </body>
    </html>
  `;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function sendOrderConfirmationEmail(
  to: string,
  data: OrderInvoiceData
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  logger.info('Sending order confirmation email', { to, orderNumber: data.orderNumber });
  const subject = `Order ${data.orderNumber} – Jewels by NavKush`;
  const html = buildOrderInvoiceHtml(data);
  return sendEmail({ to, subject, html });
}
