/**
 * Mock SMS & Email Service for Testing
 * 
 * Provides a mock SMS/Email service that stores sent messages in memory
 * for testing purposes. No actual SMS/Email is sent.
 */

interface SentSMS {
  mobile: string;
  countryCode?: string;
  message: string;
  timestamp: Date;
  success: boolean;
}

interface SentEmail {
  email: string;
  subject: string;
  message: string;
  timestamp: Date;
  success: boolean;
}

class MockSMSService {
  private sentMessages: SentSMS[] = [];
  private sentEmails: SentEmail[] = [];
  private shouldFail = false;
  private failError = 'Mock SMS service failure';

  /**
   * Send SMS (mock) - handles country codes
   */
  async sendSMS(mobile: string, message: string, countryCode?: string): Promise<{ success: boolean; error?: string; messageId?: string }> {
    if (this.shouldFail) {
      return { success: false, error: this.failError };
    }

    // Format mobile: remove +, spaces, ensure 10 digits for India
    let formattedMobile = mobile.replace(/[+\s-]/g, '');
    
    // Handle country code
    if (countryCode) {
      const countryCodeDigits = countryCode.replace('+', '');
      // Remove country code if present
      if (formattedMobile.startsWith(countryCodeDigits)) {
        formattedMobile = formattedMobile.slice(countryCodeDigits.length);
      }
    }
    
    // Take last 10 digits for India
    formattedMobile = formattedMobile.slice(-10);
    
    if (formattedMobile.length !== 10) {
      return { success: false, error: 'Invalid mobile number' };
    }

    // Store sent message
    const messageId = `mock-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    this.sentMessages.push({
      mobile: formattedMobile,
      countryCode: countryCode || '+91',
      message,
      timestamp: new Date(),
      success: true,
    });

    return { success: true, messageId };
  }

  /**
   * Send OTP (mock) - handles country codes
   */
  async sendOTP(mobile: string, otp: string, countryCode?: string): Promise<{ success: boolean; error?: string; messageId?: string }> {
    const message = `Your OTP for Jewels by NavKush is ${otp}. Valid for 10 minutes. Do not share this OTP with anyone.`;
    return this.sendSMS(mobile, message, countryCode);
  }

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
   * Get all sent messages
   */
  getSentMessages(): SentSMS[] {
    return [...this.sentMessages];
  }

  /**
   * Get last sent message
   */
  getLastMessage(): SentSMS | null {
    return this.sentMessages.length > 0 ? this.sentMessages[this.sentMessages.length - 1] : null;
  }

  /**
   * Get messages sent to a specific mobile number
   */
  getMessagesForMobile(mobile: string): SentSMS[] {
    const formattedMobile = mobile.replace(/[+\s-]/g, '').slice(-10);
    return this.sentMessages.filter(msg => msg.mobile === formattedMobile);
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
   * Clear all sent messages and emails
   */
  clearMessages(): void {
    this.sentMessages = [];
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
    this.failError = 'Mock SMS service failure';
  }
}

// Singleton instance
const mockSMSService = new MockSMSService();

export default mockSMSService;
