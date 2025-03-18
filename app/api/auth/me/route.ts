import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/auth/me - Get current user info
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Check if the user exists in the database
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        credits: true,
        subscriptionStatus: true,
        subscriptionExpiry: true,
        createdAt: true
      }
    });
    
    // If user not found in DB but we have a session, this indicates a mismatch
    if (!dbUser) {
      return NextResponse.json({
        session: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image
        },
        dbUser: null,
        error: 'User found in session but not in database'
      });
    }
    
    return NextResponse.json({
      session: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image
      },
      dbUser: dbUser,
      isTestUser: dbUser.email === 'test@example.com'
    });
  } catch (error) {
    console.error('Error fetching user info:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch user information' },
      { status: 500 }
    );
  }
}
