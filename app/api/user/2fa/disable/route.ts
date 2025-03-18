import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcrypt';
import twoFactorService from '@/lib/services/two-factor-service';

/**
 * POST /api/user/2fa/disable - Disable 2FA for a user
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get the user's password for verification
    const { password } = await req.json();
    
    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }
    
    // Verify the user's password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true }
    });
    
    if (!user?.password) {
      return NextResponse.json(
        { error: 'User has no password set' },
        { status: 400 }
      );
    }
    
    const passwordValid = await compare(password, user.password);
    
    if (!passwordValid) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 400 }
      );
    }
    
    // Disable 2FA
    await twoFactorService.disable2FA(session.user.id);
    
    return NextResponse.json({
      success: true,
      message: 'Two-factor authentication disabled successfully'
    });
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    
    return NextResponse.json(
      { error: 'Failed to disable 2FA' },
      { status: 500 }
    );
  }
}
