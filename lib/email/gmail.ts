/**
 * Gmail Email Service
 * 
 * Sends emails using Gmail SMTP (nodemailer)
 * 
 * Setup:
 * 1. Enable 2FA on your Gmail account
 * 2. Generate App Password: Google Account → Security → 2-Step Verification → App passwords
 * 3. Add to .env: GMAIL_USER=your-email@gmail.com, GMAIL_APP_PASSWORD=your-app-password
 */

import nodemailer from 'nodemailer';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

import logger from '@/lib/utils/logger';

/**
 * Create Gmail transporter
 */
function createTransporter() {
  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailAppPassword) {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: gmailUser,
      pass: gmailAppPassword,
    },
  });
}

/**
 * Send email using Gmail SMTP
 */
export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; error?: string; messageId?: string }> {
  const { to, subject, html, text } = options;
  const startTime = Date.now();

  logger.info('Sending Email', { to, subject, htmlLength: html.length });

  // Check if Gmail is configured
  const transporter = createTransporter();
  
  if (!transporter) {
    const errorMsg = 'Gmail credentials not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in environment variables.';
    logger.error('Gmail credentials not configured');
    if (process.env.NODE_ENV === 'development') {
      logger.info('DEV MODE: Email would be sent', { to, subject });
      logger.debug('DEV MODE: Email content', { htmlLength: html.length });
      return { success: true };
    }
    return { success: false, error: errorMsg };
  }

  const fromEmail = process.env.GMAIL_USER;
  const fromName = process.env.GMAIL_FROM_NAME || 'Jewels by NavKush';

  logger.debug('Email request details', {
    from: `${fromName} <${fromEmail}>`,
    to,
    subject,
  });

  try {
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    });

    const duration = Date.now() - startTime;

    logger.info('Email sent successfully', {
      to,
      messageId: info.messageId,
      duration: `${duration}ms`,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Exception while sending email', error, {
      to,
      duration: `${duration}ms`,
    });
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to send email';
    return { 
      success: false, 
      error: errorMessage
    };
  }
}

/**
 * Send Email OTP
 */
export async function sendEmailOTP(email: string, otp: string): Promise<{ success: boolean; error?: string; messageId?: string }> {
  logger.info('Sending Email OTP', { email, otpLength: otp.length });
  
  const subject = 'Your OTP for Jewels by NavKush';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f8f8f8; padding: 30px; border-radius: 8px;">
        <h2 style="color: #d4af37; margin-top: 0;">Jewels by NavKush</h2>
        <p>Your OTP for email verification is:</p>
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 4px;">
          ${otp}
        </div>
        <p>This OTP is valid for 10 minutes.</p>
        <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
          Do not share this OTP with anyone. If you did not request this OTP, please ignore this email.
        </p>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail({ to: email, subject, html });
}
