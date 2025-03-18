import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Send a tip to a persona/creator
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, chatId, message } = await request.json();

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Invalid tip amount' }, { status: 400 });
    }

    if (!chatId) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 });
    }

    // Get the chat to find recipient
    const chat = await prisma.chat.findUnique({
      where: { 
        id: chatId,
        userId: session.user.id // Ensure user owns this chat
      },
      include: {
        persona: true
      }
    });

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    if (!chat.persona.tipEnabled) {
      return NextResponse.json({ error: 'Tips are not enabled for this persona' }, { status: 400 });
    }

    // Check if user has enough credits
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true }
    });

    if (!user || user.credits < amount) {
      return NextResponse.json({ 
        error: 'Insufficient credits', 
        credits: user?.credits || 0,
        required: amount
      }, { status: 400 });
    }

    // Determine recipient (if persona has a creator, it's them; otherwise, system)
    let recipientId = chat.persona.createdBy;
    if (!recipientId) {
      // If persona is a system persona, find an admin account
      // For now, we'll just use a placeholder "system" user ID
      recipientId = "system"; // This would be a real admin ID in production
    }

    // Create a transaction to send tip
    const [payment, tipRecord, updatedSender] = await prisma.$transaction([
      // Record the payment
      prisma.payment.create({
        data: {
          userId: session.user.id,
          amount,
          currency: 'USD',
          type: 'tip',
          status: 'completed',
          completedAt: new Date()
        }
      }),
      
      // Create the tip record
      prisma.tip.create({
        data: {
          amount,
          chatId,
          fromUserId: session.user.id,
          toUserId: recipientId,
          message: message || null
        }
      }),
      
      // Deduct credits from sender
      prisma.user.update({
        where: { id: session.user.id },
        data: { credits: { decrement: amount } }
      })
    ]);

    return NextResponse.json({
      success: true,
      tipId: tipRecord.id,
      message: `You sent a $${amount} tip!`,
      remainingCredits: updatedSender.credits
    });
  } catch (error) {
    console.error('POST /api/tips error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Get tips for a specific chat
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const chatId = url.searchParams.get('chatId');

    if (!chatId) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 });
    }

    // Ensure user has access to this chat
    const chat = await prisma.chat.findUnique({
      where: { 
        id: chatId,
        userId: session.user.id
      }
    });

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    // Get tips for this chat
    const tips = await prisma.tip.findMany({
      where: { chatId },
      orderBy: { createdAt: 'desc' },
      include: {
        fromUser: {
          select: { id: true, name: true, image: true }
        }
      }
    });

    return NextResponse.json(tips);
  } catch (error) {
    console.error('GET /api/tips error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
