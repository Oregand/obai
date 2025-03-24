import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/debug/direct-update
// Updates user subscription status directly in the database
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const data = await req.json();
    const { tier } = data;
    
    if (!tier || !['free', 'basic', 'premium', 'vip'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier. Must be "free", "basic", "premium", or "vip"' },
        { status: 400 }
      );
    }
    
    // Set expiry date to 30 days from now (or 1 day for free tier for database compatibility)
    const defaultExpiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const expiryDate = tier !== 'free' ? defaultExpiryDate : null;
    
    // Update user record directly
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        subscriptionStatus: tier === 'free' ? null : tier,
        subscriptionExpiry: expiryDate
      }
    });
    
    // Delete any existing subscriptions (to avoid conflicts)
    await prisma.subscription.deleteMany({
      where: { userId: session.user.id }
    });
    
    // Create a new subscription if not free
    let subscription: null | {
      id: string;
      createdAt: Date;
      updatedAt: Date;
      status: string;
      userId: string;
      paymentId: string | null;
      tier: string;
      price: number;
      startDate: Date;
      endDate: Date;
      autoRenew: boolean;
      bonusTokens: number;
      exclusivePersonas: boolean;
      discountMultiplier: number;
    } = null;
    if (tier !== 'free') {
      subscription = await prisma.subscription.create({
        data: {
          userId: session.user.id,
          paymentId: `debug_${Date.now()}`,
          tier,
          price: tier === 'vip' ? 49.99 : tier === 'premium' ? 19.99 : 9.99,
          status: 'active',
          startDate: new Date(),
          endDate: defaultExpiryDate, // Always use a valid date for endDate
          autoRenew: true,
          bonusTokens: tier === 'vip' ? 5000 : tier === 'premium' ? 1000 : 300,
          exclusivePersonas: tier === 'basic' ? false : true,
          discountMultiplier: tier === 'vip' ? 0.6 : tier === 'premium' ? 0.75 : 0.9
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      message: `Subscription updated to ${tier}`,
      user: {
        id: user.id,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionExpiry: user.subscriptionExpiry
      },
      subscription
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    );
  }
}
