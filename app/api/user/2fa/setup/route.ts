import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import twoFactorService from '@/lib/services/two-factor-service';

/**
 * POST /api/user/2fa/setup - Generate a 2FA secret and QR code
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get user email
    const email = session.user.email || `user-${session.user.id}`;
    
    // Generate a new secret and QR code
    const { secret, qrCodeUrl } = await twoFactorService.generateSecret(
      session.user.id,
      email
    );
    
    return NextResponse.json({
      success: true,
      secret,
      qrCodeUrl
    });
  } catch (error) {
    console.error('Error setting up 2FA:', error);
    
    return NextResponse.json(
      { error: 'Failed to set up 2FA' },
      { status: 500 }
    );
  }
}
