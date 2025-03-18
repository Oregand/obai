import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// This is a temporary debug endpoint to help upgrade a user's subscription for testing
// POST /api/debug/upgrade-subscription?tier=premium|vip
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get the tier from query params
    const tier = req.nextUrl.searchParams.get('tier');
    
    if (!tier || !['premium', 'vip'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier. Must be "premium" or "vip"' },
        { status: 400 }
      );
    }
    
    // Calculate expiry date (30 days from now)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    
    // Update the user's subscription status
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        subscriptionStatus: tier,
        subscriptionExpiry: expiryDate
      }
    });
    
    // Create a subscription record
    const subscription = await prisma.subscription.create({
      data: {
        userId: session.user.id,
        paymentId: 'debug_payment_id',
        tier: tier,
        price: tier === 'premium' ? 19.99 : 49.99,
        status: 'active',
        startDate: new Date(),
        endDate: expiryDate,
        autoRenew: true,
        bonusTokens: tier === 'premium' ? 1000 : 5000,
        exclusivePersonas: true,
        discountMultiplier: tier === 'premium' ? 0.75 : 0.6
      }
    });
    
    return NextResponse.json({
      success: true,
      message: `Subscription upgraded to ${tier}`,
      tier: tier,
      expiresAt: expiryDate.toISOString(),
      user: {
        id: user.id,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionExpiry: user.subscriptionExpiry
      },
      subscription: {
        id: subscription.id,
        tier: subscription.tier,
        status: subscription.status,
        startDate: subscription.startDate,
        endDate: subscription.endDate
      }
    });
  } catch (error) {
    console.error('Error upgrading subscription:', error);
    
    return NextResponse.json(
      { error: 'Failed to upgrade subscription' },
      { status: 500 }
    );
  }
}
