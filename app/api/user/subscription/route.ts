import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import TokenService from '@/lib/services/token-service';

// GET /api/user/subscription - Get user's subscription info
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get user subscription from token service
    const subscriptionInfo = await TokenService.getUserSubscription(session.user.id);
    
    return NextResponse.json(subscriptionInfo);
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch user subscription' },
      { status: 500 }
    );
  }
}
