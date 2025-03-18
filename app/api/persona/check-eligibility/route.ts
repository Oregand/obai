import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's subscription tier
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        subscriptionStatus: true,
        subscriptionExpiry: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if subscription is expired
    let isSubscriptionActive = false;
    if (user.subscriptionStatus && user.subscriptionStatus !== 'free') {
      isSubscriptionActive = user.subscriptionExpiry ? new Date(user.subscriptionExpiry) > new Date() : false;
    }

    // Determine eligibility
    const eligibility = {
      canCreatePersona: false,
      canUseGuidedCreation: false,
      canUseAdvancedCreation: false,
      currentTier: user.subscriptionStatus || 'free',
      subscriptionActive: isSubscriptionActive,
      requiredTierForGuided: 'premium',
      requiredTierForAdvanced: 'vip'
    };

    // Set permissions based on subscription tier
    if (isSubscriptionActive) {
      if (user.subscriptionStatus === 'premium') {
        eligibility.canCreatePersona = true;
        eligibility.canUseGuidedCreation = true;
      } else if (user.subscriptionStatus === 'vip') {
        eligibility.canCreatePersona = true;
        eligibility.canUseGuidedCreation = true;
        eligibility.canUseAdvancedCreation = true;
      }
    }

    return NextResponse.json(eligibility);
  } catch (error) {
    console.error('GET /api/persona/check-eligibility error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
