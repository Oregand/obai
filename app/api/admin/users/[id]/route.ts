import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

// GET: Fetch a specific user by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        isAdmin: true,
      },
    });

    if (!admin?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: params.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        subscriptionStatus: true,
        subscriptionExpiry: true,
        credits: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
        image: true,
        // Include related data
        chats: {
          select: {
            id: true,
            title: true,
            createdAt: true,
            persona: {
              select: {
                id: true,
                name: true,
              },
            },
            _count: {
              select: {
                messages: true,
              },
            },
          },
          orderBy: {
            updatedAt: 'desc',
          },
          take: 10, // Limit to most recent 10 chats
        },
        subscriptions: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 5, // Limit to most recent 5 subscriptions
        },
        payments: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10, // Limit to most recent 10 payments
        },
        paymentMethods: true,
        autoTopupSettings: true,
        // Get message statistics
        _count: {
          select: {
            messages: true,
            chats: true,
            subscriptions: true,
            payments: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PATCH: Update user properties (like isAdmin status)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        isAdmin: true,
        id: true,
      },
    });

    if (!admin?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Prevent users from removing their own admin access
    if (params.id === admin.id) {
      const data = await req.json();
      if (data.isAdmin === false) {
        return NextResponse.json(
          { error: 'Cannot remove your own admin privileges' },
          { status: 400 }
        );
      }
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const data = await req.json();
    const allowedFields = ['isAdmin', 'credits', 'subscriptionStatus'];
    
    // Filter out any fields that shouldn't be updated
    const updateData: any = {};
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: {
        id: params.id,
      },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        credits: true,
        subscriptionStatus: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
