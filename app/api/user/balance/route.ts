import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import TokenService from '@/lib/services/token-service';

// Mark this route as dynamic
export const dynamic = 'force-dynamic';

// GET /api/user/balance - Get user's token balance
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get user balance from token service
    const balance = await TokenService.getUserBalance(session.user.id);
    
    return NextResponse.json({ balance });
  } catch (error) {
    console.error('Error fetching user balance:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch user balance' },
      { status: 500 }
    );
  }
}
