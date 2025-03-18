import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

// GET: Fetch users with pagination and filtering
export async function GET(req: NextRequest) {
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

    // Parse query parameters
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const filter = searchParams.get('filter') || 'all';
    
    // Calculate pagination values
    const skip = (page - 1) * limit;
    
    // Build filter conditions
    let where: any = {};
    
    if (filter === 'free') {
      where.subscriptionStatus = 'free';
    } else if (filter === 'paid') {
      where.subscriptionStatus = { not: 'free' };
    } else if (filter === 'admin') {
      where.isAdmin = true;
    }

    // Fetch users with pagination
    const [users, totalUsers] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          subscriptionStatus: true,
          credits: true,
          isAdmin: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(totalUsers / limit);

    return NextResponse.json({
      users,
      totalUsers,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
