import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import TokenService from '@/lib/services/token-service';

// GET /api/chat - Get all user's chats
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get all chats for this user
    const chats = await prisma.chat.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        persona: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
    
    return NextResponse.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch chats' },
      { status: 500 }
    );
  }
}

// POST /api/chat - Create a new chat
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { personaId, title } = await req.json();
    
    if (!personaId) {
      return NextResponse.json(
        { error: 'Persona ID is required' },
        { status: 400 }
      );
    }
    
    // Verify persona exists
    const persona = await prisma.persona.findUnique({
      where: { id: personaId }
    });
    
    if (!persona) {
      return NextResponse.json(
        { error: 'Persona not found' },
        { status: 404 }
      );
    }
    
    // Check if user can create a new chat based on subscription
    const chatCheckResult = await TokenService.canUserCreateChat(session.user.id);
    
    if (!chatCheckResult.canCreate) {
      return NextResponse.json(
        {
          error: 'Chat limit reached',
          code: 'CHAT_LIMIT_REACHED',
          currentCount: chatCheckResult.currentCount,
          limit: chatCheckResult.limit,
          subscriptionTier: chatCheckResult.subscriptionTier,
          // Return upgrade info if not on VIP tier
          upgradeOptions: chatCheckResult.subscriptionTier !== 'vip' ? {
            nextTier: chatCheckResult.subscriptionTier === 'free' ? 'basic' : 
                     chatCheckResult.subscriptionTier === 'basic' ? 'premium' : 'vip',
            upgradeUrl: '/subscriptions'
          } : null
        },
        { status: 403 }
      );
    }
    
    // Create new chat
    try {
      // First verify the user exists in the database
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true }
      });
      
      if (!user) {
        console.error(`User with ID ${session.user.id} not found in database`);
        return NextResponse.json(
          { error: 'User not found', code: 'USER_NOT_FOUND' },
          { status: 404 }
        );
      }

      const chat = await prisma.chat.create({
        data: {
          title: title || `Chat with ${persona.name}`,
          userId: session.user.id,
          personaId,
        },
        include: {
          persona: true
        }
      });
      
      return NextResponse.json(chat);
    } catch (createChatError) {
      console.error('Error in chat creation transaction:', createChatError);
      return NextResponse.json(
        { 
          error: 'Failed to create chat', 
          details: createChatError instanceof Error ? createChatError.message : 'Unknown error' 
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error creating chat:', error);
    
    return NextResponse.json(
      { error: 'Failed to create chat' },
      { status: 500 }
    );
  }
}
