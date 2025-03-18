import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import TokenService from '@/lib/services/token-service';
import { prisma } from '@/lib/prisma';

// GET /api/user/profile/info - Get user profile info including balance and subscription
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        subscriptionStatus: true,
      },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Get user balance from token service
    const balanceInfo = await TokenService.getUserBalance(session.user.id);
    
    // Get user subscription from token service
    const subscription = await TokenService.getUserSubscription(session.user.id);
    
    // Combine all data into a single response
    const userProfile = {
      ...user,
      balance: balanceInfo.balance,
      subscription: {
        plan: subscription.tier,
        status: subscription.status,
        expiresAt: subscription.expiresAt,
        features: subscription.features
      }
    };
    
    return NextResponse.json(userProfile);
  } catch (error) {
    console.error('Error fetching user profile info:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch user profile information' },
      { status: 500 }
    );
  }
}
