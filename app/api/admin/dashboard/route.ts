import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        isAdmin: true,
      },
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch dashboard data
    const [
      totalUsers,
      activeSubscriptions,
      totalChats,
      totalMessages,
      totalCredits,
      premiumPersonas
    ] = await Promise.all([
      // Count total users
      prisma.user.count(),
      
      // Count active subscriptions
      prisma.subscription.count({
        where: {
          status: 'active',
        },
      }),
      
      // Count total chats
      prisma.chat.count(),
      
      // Count total messages
      prisma.message.count(),
      
      // Sum all user credits
      prisma.user.aggregate({
        _sum: {
          credits: true,
        },
      }),
      
      // Count premium personas
      prisma.persona.count({
        where: {
          isPremium: true,
        },
      }),
    ]);

    return NextResponse.json({
      totalUsers,
      activeSubscriptions,
      totalChats,
      totalMessages,
      totalCredits: totalCredits._sum.credits || 0,
      premiumPersonas,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
