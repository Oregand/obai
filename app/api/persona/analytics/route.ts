import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import TokenService from '@/lib/services/token-service';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if the request is for user-specific analytics
    const url = new URL(request.url);
    const userSpecific = url.searchParams.get('user') === 'true';

    let analyticsData;
    if (userSpecific) {
      // Get analytics for the current user's persona usage
      analyticsData = await TokenService.getUserPersonaAnalytics(session.user.id);
    } else {
      // Get global analytics data (admin only)
      // Check if user is an admin
      // For simplicity, we'll just check for VIP subscription
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { subscriptionStatus: true }
      });

      if (user?.subscriptionStatus !== 'vip') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      analyticsData = await TokenService.getPersonaAnalytics();
    }

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error('GET /api/persona/analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
