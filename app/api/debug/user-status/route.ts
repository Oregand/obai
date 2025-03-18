import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import TokenService from '@/lib/services/token-service';

// GET /api/debug/user-status - Get detailed user status and subscription info
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get user details directly from the database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        subscriptionStatus: true,
        subscriptionExpiry: true,
        credits: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    // Get subscription info from the TokenService
    const subscriptionInfo = await TokenService.getUserSubscription(session.user.id);
    
    // Get active subscriptions from the database
    const activeSubscriptions = await prisma.subscription.findMany({
      where: {
        userId: session.user.id,
        status: 'active',
        endDate: { gt: new Date() }
      },
      orderBy: {
        startDate: 'desc'
      }
    });
    
    return NextResponse.json({
      user,
      serviceSubscription: subscriptionInfo,
      dbSubscriptions: activeSubscriptions,
      session
    });
  } catch (error) {
    console.error('Error fetching user status:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch user status' },
      { status: 500 }
    );
  }
}
