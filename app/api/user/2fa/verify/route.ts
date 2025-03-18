import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import twoFactorService from '@/lib/services/two-factor-service';

/**
 * POST /api/user/2fa/verify - Verify a 2FA token and enable 2FA if needed
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
    
    // Get the token and enable flag from the request
    const { token, enable } = await req.json();
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }
    
    // If enable is true, enable 2FA and verify token
    if (enable) {
      const success = await twoFactorService.enable2FA(session.user.id, token);
      
      if (!success) {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 400 }
        );
      }
      
      return NextResponse.json({
        success: true,
        enabled: true,
        message: 'Two-factor authentication enabled successfully'
      });
    }
    
    // Otherwise, just verify the token
    const isValid = await twoFactorService.verifyToken(session.user.id, token);
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      verified: true
    });
  } catch (error) {
    console.error('Error verifying 2FA token:', error);
    
    return NextResponse.json(
      { error: 'Failed to verify token' },
      { status: 500 }
    );
  }
}
