import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import TokenService from '@/lib/services/token-service';

// GET /api/user/free-messages - Get user's free message usage
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get free message status from token service
    const freeMessageStatus = await TokenService.checkFreeMessageAvailability(session.user.id);
    
    return NextResponse.json(freeMessageStatus);
  } catch (error) {
    console.error('Error fetching free message usage:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch free message usage' },
      { status: 500 }
    );
  }
}
