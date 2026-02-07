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
import { getGmailUser, getGmailAppPassword, getGmailFromName, isDevelopment } from '@/lib/utils/env';
import logger from '@/lib/utils/logger';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Create Gmail transporter
 * Uses centralized environment utilities for secure credential access
 * 
 * @returns Nodemailer transporter or null if credentials are not configured
 */
function createTransporter() {
  try {
    const gmailUser = getGmailUser();
    const gmailAppPassword = getGmailAppPassword();
    // Note: gmailFromName is retrieved via getGmailFromName() when needed in email templates

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
  } catch (error) {
    // Gmail credentials not configured - return null to indicate email service unavailable
    logger.error('Gmail credentials not configured', error);
    return null;
  }
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
    if (isDevelopment()) {
      logger.info('DEV MODE: Email would be sent', { to, subject });
      logger.debug('DEV MODE: Email content', { htmlLength: html.length });
      return { success: true };
    }
    return { success: false, error: errorMsg };
  }

  const fromEmail = getGmailUser();
  const fromName = getGmailFromName();

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
  // Email template uses inline styles (required for email clients)
  // Colors match design system: cream background (#faf8f5), text-on-cream (#2a2a2a), beige accent (#CCC4BA)
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #2a2a2a; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #faf8f5;">
      <div style="background-color: #faf8f5; padding: 30px; border-radius: 8px; border: 1px solid #e8e5e0;">
        <h2 style="color: #CCC4BA; margin-top: 0; font-weight: bold;">Jewels by NavKush</h2>
        <p style="color: #2a2a2a;">Your OTP for email verification is:</p>
        <div style="background-color: #CCC4BA; color: #ffffff; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 4px;">
          ${otp}
        </div>
        <p style="color: #2a2a2a;">This OTP is valid for 10 minutes.</p>
        <p style="color: #6a6a6a; font-size: 12px; margin-top: 30px; border-top: 1px solid #e8e5e0; padding-top: 20px;">
          Do not share this OTP with anyone. If you did not request this OTP, please ignore this email.
        </p>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail({ to: email, subject, html });
}
