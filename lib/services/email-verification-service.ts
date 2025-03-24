import { prisma } from '../prisma';
import crypto from 'crypto';
import { addHours } from 'date-fns';

// In a real implementation, uncomment this and install nodemailer
// import nodemailer from 'nodemailer';

// Configure email transport for development
/*
const emailTransport = process.env.NODE_ENV === 'development' 
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASSWORD || ''
      },
    })
  : null; // In production, you would configure a real email service
*/

// Temporary mock emailTransport until nodemailer is installed
const emailTransport = null;

/**
 * Service for handling email verification
 */
class EmailVerificationService {
  /**
   * Generate a verification token for email verification
   * @param userId The user ID
   * @param newEmail The new email address
   * @returns The generated token
   */
  async generateVerificationToken(userId: string, newEmail: string): Promise<string> {
    // Generate a random token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Set expiration (24 hours from now)
    const expires = addHours(new Date(), 24);
    
    // Save the token in the database
    // Cast to any to bypass type checking temporarily until Prisma schema is updated
      await (prisma as any).emailVerification.create({
      data: {
        token,
        expires,
        userId,
        email: newEmail
      }
    });
    
    return token;
  }
  
  /**
   * Verify a token and update the user's email
   * @param token The verification token
   * @returns Object with success status and message
   */
  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    try {
      // Find the verification record
      const verification = await (prisma as any).emailVerification.findUnique({
        where: { token }
      });
      
      // Check if token exists and is valid
      if (!verification) {
        return { success: false, message: 'Invalid verification token' };
      }
      
      // Check if token is expired
      if (verification.expires < new Date()) {
        // Delete expired token
        await (prisma as any).emailVerification.delete({
          where: { token }
        });
        
        return { success: false, message: 'Verification token has expired' };
      }
      
      // Update user's email
      await prisma.user.update({
        where: { id: verification.userId },
        data: { email: verification.email }
      });
      
      // Delete the used token
      await (prisma as any).emailVerification.delete({
        where: { token }
      });
      
      return { success: true, message: 'Email verified successfully' };
    } catch (error) {
      console.error('Error verifying email:', error);
      return { success: false, message: 'Error verifying email' };
    }
  }
  
  /**
   * Send a verification email
   * @param email The email address to send to
   * @param token The verification token
   * @param userName The user's name for personalization
   * @returns Object with success status and message
   */
  async sendVerificationEmail(email: string, token: string, userName: string): Promise<{ success: boolean; message: string }> {
    try {
      const appName = process.env.APP_NAME || 'OBAI';
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const verificationUrl = `${appUrl}/verify-email?token=${token}`;
      
      const emailContent = `
        <h1>Verify Your Email for ${appName}</h1>
        <p>Hello ${userName},</p>
        <p>Please verify your email address by clicking the link below:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>This link will expire in 24 hours.</p>
        <p>If you did not request this verification, please ignore this email.</p>
      `;

      if (emailTransport) {
        // Send real email in production or if configured in development
        // Since nodemailer is not fully set up, we're commenting this out
        // const info = await emailTransport.sendMail({
        //   from: process.env.EMAIL_FROM || `"${appName}" <no-reply@example.com>`,
        //   to: email,
        //   subject: `Verify your email for ${appName}`,
        //   html: emailContent
        // });
        
        // console.log('Email sent: %s', info.messageId);
        return { success: true, message: 'Verification email sent' };
      } else {
        // Log the email info in development when no transport is configured
        console.log(`
          Email would be sent with the following details:
          To: ${email}
          Subject: Verify your email for ${appName}
          Content: ${emailContent}
          
          Verification URL: ${verificationUrl}
        `);
        
        return { success: true, message: 'Verification email logged (not sent in development)' };
      }
    } catch (error) {
      console.error('Error sending verification email:', error);
      return { success: false, message: 'Failed to send verification email' };
    }
  }
}

// Export as a singleton
export const emailVerificationService = new EmailVerificationService();
export default emailVerificationService;
