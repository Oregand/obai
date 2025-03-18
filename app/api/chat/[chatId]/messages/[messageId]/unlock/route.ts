import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// POST /api/chat/[chatId]/messages/[messageId]/unlock - Unlock a premium message
export async function POST(
  req: NextRequest,
  { params }: { params: { chatId: string; messageId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { chatId, messageId } = params;
    
    // Verify this chat belongs to the user
    const chat = await prisma.chat.findUnique({
      where: {
        id: chatId,
        userId: session.user.id
      }
    });
    
    if (!chat) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      );
    }
    
    // Find the message
    const message = await prisma.message.findUnique({
      where: {
        id: messageId,
        chatId
      }
    });
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }
    
    if (!message.isLocked) {
      return NextResponse.json(
        { error: 'Message is not locked' },
        { status: 400 }
      );
    }
    
    // Check if user has sufficient tokens
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true }
    });
    
    const unlockPrice = message.unlockPrice || 0.5;
    
    if (!user || user.credits < unlockPrice) {
      return NextResponse.json(
        { 
          error: 'Insufficient tokens', 
          code: 'INSUFFICIENT_TOKENS',
          requiredTokens: unlockPrice,
          currentBalance: user?.credits || 0
        },
        { status: 402 }
      );
    }
    
    // Process the transaction
    const [payment, unlock, updatedUser, updatedMessage] = await prisma.$transaction([
      // Record the payment
      prisma.payment.create({
        data: {
          userId: session.user.id,
          amount: unlockPrice,
          currency: 'USD',
          type: 'message_unlock',
          status: 'completed',
          completedAt: new Date()
        }
      }),
      
      // Record the message unlock
      prisma.messageUnlock.create({
        data: {
          messageId,
          userId: session.user.id,
          amount: unlockPrice,
          paymentId: null // Will be updated after transaction
        }
      }),
      
      // Deduct credits from user
      prisma.user.update({
        where: { id: session.user.id },
        data: { credits: { decrement: unlockPrice } }
      }),
      
      // Mark message as unlocked
      prisma.message.update({
        where: { id: messageId },
        data: { isLocked: false }
      })
    ]);
    
    // Update message unlock with payment ID
    await prisma.messageUnlock.update({
      where: { id: unlock.id },
      data: { paymentId: payment.id }
    });
    
    return NextResponse.json({
      success: true,
      content: updatedMessage.content,
      remainingTokens: updatedUser.credits
    });
  } catch (error) {
    console.error('Error unlocking message:', error);
    
    return NextResponse.json(
      { error: 'Failed to unlock message' },
      { status: 500 }
    );
  }
}
