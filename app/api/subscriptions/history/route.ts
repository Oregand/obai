import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/subscriptions/history - Get user's subscription history
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get all subscriptions for this user
    const subscriptions = await prisma.subscription.findMany({
      where: { userId: session.user.id },
      orderBy: { startDate: 'desc' },
      include: {
        payment: {
          select: {
            amount: true,
            currency: true,
            status: true,
            completedAt: true
          }
        }
      }
    });
    
    // Get all payments related to subscriptions
    const payments = await prisma.payment.findMany({
      where: {
        userId: session.user.id,
        type: 'subscription'
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json({
      subscriptions,
      payments
    });
  } catch (error) {
    console.error('Error fetching subscription history:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch subscription history' },
      { status: 500 }
    );
  }
}
