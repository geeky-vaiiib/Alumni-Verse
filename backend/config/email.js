/**
 * Email Service Configuration
 * Uses nodemailer for sending OTP emails via SMTP
 */

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const isDevelopment = process.env.NODE_ENV === 'development';

// Create transporter based on environment
export const createEmailTransporter = () => {
  // In development without SMTP config, use console logging
  if (isDevelopment && (!process.env.SMTP_HOST || !process.env.SMTP_USER)) {
    console.warn('⚠️  SMTP not configured. OTPs will be logged to console only.');
    return null;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    return transporter;
  } catch (error) {
    console.error('Failed to create email transporter:', error);
    return null;
  }
};

/**
 * Send OTP email
 * @param {string} to - Recipient email
 * @param {string} otp - 6-digit OTP
 * @param {string} purpose - Purpose of OTP (signup, login, forgot)
 */
export const sendOTPEmail = async (to, otp, purpose) => {
  const transporter = createEmailTransporter();

  // In development without SMTP, just log OTP
  if (!transporter) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 [DEV MODE] OTP Email for ${to}`);
    console.log(`Purpose: ${purpose}`);
    console.log(`OTP: ${otp}`);
    console.log(`Expires in: ${process.env.OTP_EXPIRY_MINUTES || 5} minutes`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    return { success: true, dev: true };
  }

  const purposeText = {
    signup: 'sign up',
    login: 'log in',
    forgot: 'reset your password'
  }[purpose] || 'authenticate';

  const subject = `AlumniVerse - Your Verification Code`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .otp-box { background: white; border: 2px solid #667eea; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
        .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #667eea; font-family: 'Courier New', monospace; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">✨ AlumniVerse</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your Alumni Network Platform</p>
        </div>
        <div class="content">
          <h2 style="color: #667eea;">Verification Code</h2>
          <p>Hi there! You requested to ${purposeText} to your AlumniVerse account.</p>
          
          <div class="otp-box">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">Your verification code is:</p>
            <div class="otp-code">${otp}</div>
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">Valid for ${process.env.OTP_EXPIRY_MINUTES || 5} minutes</p>
          </div>

          <div class="warning">
            <strong>⚠️ Security Notice:</strong> Never share this code with anyone. AlumniVerse staff will never ask for your verification code.
          </div>

          <p style="margin-top: 30px;">If you didn't request this code, please ignore this email or contact support if you're concerned about your account security.</p>
        </div>
        <div class="footer">
          <p>© 2025 AlumniVerse - SIT Alumni Network</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
AlumniVerse - Your Verification Code

Hi there!

You requested to ${purposeText} to your AlumniVerse account.

Your verification code is: ${otp}

This code is valid for ${process.env.OTP_EXPIRY_MINUTES || 5} minutes.

SECURITY NOTICE: Never share this code with anyone. AlumniVerse staff will never ask for your verification code.

If you didn't request this code, please ignore this email.

---
© 2025 AlumniVerse - SIT Alumni Network
This is an automated message, please do not reply to this email.
  `;

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"AlumniVerse" <no-reply@alumniverse.sit.ac.in>',
      to,
      subject,
      text: textContent,
      html: htmlContent,
    });

    console.log(`✅ Email sent successfully to ${to} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    throw new Error('Failed to send verification email');
  }
};

export default { createEmailTransporter, sendOTPEmail };
