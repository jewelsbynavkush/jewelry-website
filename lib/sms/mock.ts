/**
 * Mock Email Service for Testing
 * 
 * Provides a mock Email service that stores sent emails in memory
 * for testing purposes. No actual Email is sent.
 */

interface SentEmail {
  email: string;
  subject: string;
  message: string;
  timestamp: Date;
  success: boolean;
}

class MockEmailService {
  private sentEmails: SentEmail[] = [];
  private shouldFail = false;
  private failError = 'Mock Email service failure';

  /**
   * Send Email (mock)
   */
  async sendEmail(email: string, subject: string, message: string): Promise<{ success: boolean; error?: string; messageId?: string }> {
    if (this.shouldFail) {
      return { success: false, error: this.failError };
    }

    if (!email || !email.includes('@')) {
      return { success: false, error: 'Invalid email address' };
    }

    const messageId = `mock-email-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    this.sentEmails.push({
      email,
      subject,
      message,
      timestamp: new Date(),
      success: true,
    });

    return { success: true, messageId };
  }

  /**
   * Send Email OTP (mock)
   */
  async sendEmailOTP(email: string, otp: string): Promise<{ success: boolean; error?: string; messageId?: string }> {
    const subject = 'Your OTP for Jewels by NavKush';
    const message = `Your OTP for Jewels by NavKush is ${otp}. Valid for 10 minutes. Do not share this OTP with anyone.`;
    return this.sendEmail(email, subject, message);
  }


  /**
   * Get all sent emails
   */
  getSentEmails(): SentEmail[] {
    return [...this.sentEmails];
  }

  /**
   * Get last sent email
   */
  getLastEmail(): SentEmail | null {
    return this.sentEmails.length > 0 ? this.sentEmails[this.sentEmails.length - 1] : null;
  }

  /**
   * Get emails sent to a specific email address
   */
  getEmailsForAddress(email: string): SentEmail[] {
    return this.sentEmails.filter(msg => msg.email === email);
  }

  /**
   * Clear all sent emails
   */
  clearMessages(): void {
    this.sentEmails = [];
  }

  /**
   * Set mock to fail
   */
  setShouldFail(shouldFail: boolean, error?: string): void {
    this.shouldFail = shouldFail;
    if (error) {
      this.failError = error;
    }
  }

  /**
   * Reset mock state
   */
  reset(): void {
    this.clearMessages();
    this.shouldFail = false;
    this.failError = 'Mock Email service failure';
  }
}

// Singleton instance
const mockEmailService = new MockEmailService();

export default mockEmailService;
