import { NextResponse } from 'next/server';
import { isUserAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // Check if user is admin
    const isAdmin = await isUserAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get statistics from database
    const [
      totalUsers,
      totalChats,
      totalMessages,
      totalPersonas,
      totalPayments,
      recentUsers,
      recentChats
    ] = await Promise.all([
      prisma.user.count(),
      prisma.chat.count(),
      prisma.message.count(),
      prisma.persona.count(),
      prisma.payment.count(),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true
        }
      }),
      prisma.chat.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          createdAt: true,
          persona: {
            select: {
              name: true
            }
          }
        }
      })
    ]);

    // Format recent chats to include persona name
    const formattedRecentChats = recentChats.map(chat => ({
      id: chat.id,
      title: chat.title,
      personaName: chat.persona.name,
      createdAt: chat.createdAt.toISOString()
    }));

    return NextResponse.json({
      totalUsers,
      totalChats,
      totalMessages,
      totalPersonas,
      totalPayments,
      recentUsers,
      recentChats: formattedRecentChats
    });
  } catch (error) {
    console.error('GET /api/admin/stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
