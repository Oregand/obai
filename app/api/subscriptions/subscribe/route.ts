import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import TokenService from '@/lib/services/token-service';

// POST /api/subscriptions/subscribe - Subscribe to a tier
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const { tierId, paymentMethodId } = await req.json();
    
    // Validate required fields
    if (!tierId) {
      return NextResponse.json(
        { error: 'Tier ID is required' },
        { status: 400 }
      );
    }
    
    // Process subscription
    const result = await TokenService.createSubscription(userId, tierId, paymentMethodId);
    
    return NextResponse.json({ 
      success: true,
      subscription: result.subscription || {
        id: result.subscriptionId,
        tier: result.tier,
        nextBillingDate: result.nextBillingDate
      },
      payment: result.payment,
      tier: result.tier
    });
  } catch (error: any) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create subscription' },
      { status: error.status || 500 }
    );
  }
}
