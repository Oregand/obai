import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcrypt';

// DELETE /api/user/account - Delete user account
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get the deletion confirmation data
    const { password, confirmDelete } = await req.json();
    
    if (!confirmDelete) {
      return NextResponse.json(
        { error: 'Deletion not confirmed' },
        { status: 400 }
      );
    }
    
    // Get the user from the database to verify password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Verify password if the user has one
    if (user.password) {
      const passwordMatch = await compare(password, user.password);
      
      if (!passwordMatch) {
        return NextResponse.json(
          { error: 'Invalid password' },
          { status: 401 }
        );
      }
    }
    
    // Delete all related data first to respect foreign key constraints
    
    // Delete message unlocks
    await prisma.messageUnlock.deleteMany({
      where: { userId: session.user.id }
    });
    
    // Delete tips sent and received
    await prisma.tip.deleteMany({
      where: { 
        OR: [
          { fromUserId: session.user.id },
          { toUserId: session.user.id }
        ]
      }
    });
    
    // Delete messages
    await prisma.message.deleteMany({
      where: { userId: session.user.id }
    });
    
    // Delete chats
    await prisma.chat.deleteMany({
      where: { userId: session.user.id }
    });
    
    // Delete auto-topup settings
    await prisma.autoTopupSettings.deleteMany({
      where: { userId: session.user.id }
    });
    
    // Delete payment methods
    await prisma.userPaymentMethod.deleteMany({
      where: { userId: session.user.id }
    });
    
    // Delete subscriptions
    await prisma.subscription.deleteMany({
      where: { userId: session.user.id }
    });
    
    // Delete payments
    await prisma.payment.deleteMany({
      where: { userId: session.user.id }
    });
    
    // Delete persona usages
    await prisma.personaUsage.deleteMany({
      where: { userId: session.user.id }
    });
    
    // Delete sessions
    await prisma.session.deleteMany({
      where: { userId: session.user.id }
    });
    
    // Delete accounts
    await prisma.account.deleteMany({
      where: { userId: session.user.id }
    });
    
    // Finally, delete the user
    await prisma.user.delete({
      where: { id: session.user.id }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}
