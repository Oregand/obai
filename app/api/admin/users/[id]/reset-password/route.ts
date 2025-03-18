import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

// POST: Reset a user's password
export async function POST(
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

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: {
        id: params.id,
      },
      select: {
        id: true,
        email: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // In a real application, you would:
    // 1. Generate a password reset token
    // 2. Store it in the database with an expiration time
    // 3. Send an email to the user with a link to reset their password
    
    // For now, we'll just simulate the process
    await prisma.user.update({
      where: {
        id: params.id,
      },
      data: {
        // Optionally set a flag indicating a password reset is pending
        // We'd need to add this field to the User model
        // passwordResetRequested: true,
        // passwordResetToken: generatedToken,
        // passwordResetExpires: new Date(Date.now() + 3600000), // 1 hour
      },
    });

    return NextResponse.json({ 
      success: true,
      message: `Password reset initiated for user: ${user.email}` 
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
