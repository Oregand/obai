import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import TokenService from '@/lib/services/token-service';

// POST /api/subscriptions/activate - Activate a subscription after payment
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { subscriptionId } = await req.json();
    
    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      );
    }
    
    // Verify this subscription belongs to the user
    const subscription = await prisma.subscription.findUnique({
      where: {
        id: subscriptionId,
        userId: session.user.id
      }
    });
    
    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }
    
    // Activate subscription through token service
    const result = await TokenService.activateSubscription(subscriptionId);
    
    return NextResponse.json({
      success: true,
      subscription: result.subscription,
      bonusTokensAdded: result.bonusTokensAdded,
      chatLimit: result.chatLimit,
      tokenDiscount: result.tokenDiscount
    });
  } catch (error) {
    console.error('Error activating subscription:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to activate subscription' },
      { status: 500 }
    );
  }
}
