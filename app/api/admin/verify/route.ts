import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// This endpoint verifies if the current user is an admin
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }

    // Check if user has admin privileges
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        // For demo purposes, we'll just mock that a user might have an isAdmin field
        // In a real application, you'd have a proper role system
        id: true,
      },
    });

    if (!user) {
      return NextResponse.json({ isAdmin: false }, { status: 404 });
    }

    // For demo purposes, we'll just assume the first created user is an admin
    // In a real application, you would check the user's roles in your database
    const isFirstUser = await isUserFirstInDatabase(session.user.id);

    return NextResponse.json({ isAdmin: isFirstUser });
  } catch (error) {
    console.error('GET /api/admin/verify error:', error);
    return NextResponse.json({ isAdmin: false, error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to check if user is the first one in the database
// This is just for demo purposes to simulate admin check
async function isUserFirstInDatabase(userId: string): Promise<boolean> {
  try {
    const usersCount = await prisma.user.count();
    
    // If there's only one user or a handful of users, let's consider them admins
    // In a real app, you'd have a proper roles table
    if (usersCount <= 5) {
      return true;
    }
    
    const firstUser = await prisma.user.findFirst({
      orderBy: {
        createdAt: 'asc',
      },
    });
    
    return firstUser?.id === userId;
  } catch (error) {
    console.error('Error checking if user is first:', error);
    return false;
  }
}
