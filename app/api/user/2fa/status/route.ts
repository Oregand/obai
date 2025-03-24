import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import twoFactorService from '@/lib/services/two-factor-service';

// Mark this route as dynamic
export const dynamic = 'force-dynamic';

/**
 * GET /api/user/2fa/status - Check if 2FA is enabled for the user
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if 2FA is enabled
    const isEnabled = await twoFactorService.is2FAEnabled(session.user.id);
    
    return NextResponse.json({
      enabled: isEnabled
    });
  } catch (error) {
    console.error('Error checking 2FA status:', error);
    
    return NextResponse.json(
      { error: 'Failed to check 2FA status' },
      { status: 500 }
    );
  }
}
