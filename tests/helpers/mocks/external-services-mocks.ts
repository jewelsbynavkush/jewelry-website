/**
 * External Services Mocks
 *
 * Mocks for all outbound external services so tests never call real APIs or SMTP.
 * - Email (Gmail/nodemailer): sendEmail, sendEmailOTP
 * Order confirmation (sendOrderConfirmationEmail) uses sendEmail, so it is covered by the gmail mock.
 */

import { vi } from 'vitest';

vi.mock('@/lib/email/gmail', () => ({
  sendEmail: vi.fn().mockResolvedValue({ success: true, messageId: 'mock-message-id' }),
  sendEmailOTP: vi.fn().mockResolvedValue({ success: true, messageId: 'mock-message-id' }),
}));
