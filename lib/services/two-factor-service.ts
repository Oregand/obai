import { authenticator } from 'otplib';
import qrcode from 'qrcode';
import { prisma } from '../prisma';

/**
 * Service for handling two-factor authentication
 */
class TwoFactorService {
  /**
   * Generate a new 2FA secret for a user
   * @param userId The user ID
   * @param email The user's email for identification
   * @returns Object with secret and QR code data URL
   */
  async generateSecret(userId: string, email: string): Promise<{
    secret: string;
    qrCodeUrl: string;
  }> {
    try {
      // Generate a new secret
      const secret = authenticator.generateSecret();
      
      // Get the app name from env or use a default
      const appName = process.env.APP_NAME || 'OBAI';
      
      // Create the OTP auth URL
      const otpauth = authenticator.keyuri(email, appName, secret);
      
      // Generate a QR code
      const qrCodeUrl = await qrcode.toDataURL(otpauth);
      
      // Store the secret in the database (not enabling 2FA yet)
      await prisma.user.update({
        where: { id: userId },
        data: {
          twoFactorSecret: secret,
          twoFactorEnabled: false
        }
      });
      
      return {
        secret,
        qrCodeUrl
      };
    } catch (error) {
      console.error('Error generating 2FA secret:', error);
      throw new Error('Failed to generate 2FA secret');
    }
  }
  
  /**
   * Verify a 2FA token against a user's secret
   * @param userId The user ID
   * @param token The token to verify
   * @returns Boolean indicating if the token is valid
   */
  async verifyToken(userId: string, token: string): Promise<boolean> {
    try {
      // Get the user's secret
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { twoFactorSecret: true }
      });
      
      if (!user?.twoFactorSecret) {
        return false;
      }
      
      // Verify the token
      return authenticator.verify({
        token,
        secret: user.twoFactorSecret
      });
    } catch (error) {
      console.error('Error verifying 2FA token:', error);
      return false;
    }
  }
  
  /**
   * Enable 2FA for a user after verifying a token
   * @param userId The user ID
   * @param token The token to verify
   * @returns Boolean indicating success
   */
  async enable2FA(userId: string, token: string): Promise<boolean> {
    try {
      // Verify the token first
      const isValid = await this.verifyToken(userId, token);
      
      if (!isValid) {
        return false;
      }
      
      // Enable 2FA for the user
      await prisma.user.update({
        where: { id: userId },
        data: {
          twoFactorEnabled: true
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      return false;
    }
  }
  
  /**
   * Disable 2FA for a user
   * @param userId The user ID
   * @returns Boolean indicating success
   */
  async disable2FA(userId: string): Promise<boolean> {
    try {
      // Disable 2FA and remove the secret
      await prisma.user.update({
        where: { id: userId },
        data: {
          twoFactorEnabled: false,
          twoFactorSecret: null
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      return false;
    }
  }
  
  /**
   * Check if a user has 2FA enabled
   * @param userId The user ID
   * @returns Boolean indicating if 2FA is enabled
   */
  async is2FAEnabled(userId: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { twoFactorEnabled: true }
      });
      
      return user?.twoFactorEnabled || false;
    } catch (error) {
      console.error('Error checking 2FA status:', error);
      return false;
    }
  }
}

// Export as a singleton
export const twoFactorService = new TwoFactorService();
export default twoFactorService;
