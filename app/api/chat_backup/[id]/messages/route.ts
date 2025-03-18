import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getAIResponse } from '@/lib/grokService';

interface Params {
  params: {
    id: string;
  };
}

export async function POST(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: chatId } = params;
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    // Check if chat exists and belongs to user
    const chat = await prisma.chat.findUnique({
      where: {
        id: chatId,
        userId: session.user.id,
      },
      include: {
        persona: true,
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    // Save user message
    const userMessage = await prisma.message.create({
      data: {
        content,
        role: 'user',
        chatId,
        userId: session.user.id,
      },
    });

    // Get chat history for context
    const chatHistory = chat.messages.map(message => ({
      role: message.role,
      content: message.content,
    }));

    // Add user's new message to history
    chatHistory.push({
      role: 'user',
      content,
    });

    // Generate AI response using the wrapper service (real or mock)
    const aiResponse = await getAIResponse(
      chatHistory,
      chat.persona.systemPrompt
    );

    // Determine if this message should be locked (based on persona settings)
    const shouldLockMessage = Math.random() < (chat.persona.lockMessageChance || 0.05);
    const unlockPrice = chat.persona.lockMessagePrice || 0.5;
    
    // Save AI response
    const assistantMessage = await prisma.message.create({
      data: {
        content: aiResponse,
        role: 'assistant',
        chatId,
        userId: session.user.id,
        isLocked: shouldLockMessage,
        unlockPrice: shouldLockMessage ? unlockPrice : null
      },
    });

    // If this is the first message, update the chat title
    if (chat.messages.length === 0) {
      await prisma.chat.update({
        where: {
          id: chatId,
        },
        data: {
          title: content.length > 30 ? `${content.substring(0, 30)}...` : content,
        },
      });
    }

    // If the message is locked, provide a preview
    const responseContent = assistantMessage.isLocked 
      ? {
          ...assistantMessage,
          content: "This message is locked. You can unlock it to see the full content.",
          previewType: "locked_message",
          unlockPrice
        }
      : assistantMessage;

    return NextResponse.json({
      userMessage,
      assistantMessage: responseContent,
    });
  } catch (error) {
    console.error(`POST /api/chat/${params.id}/messages error:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Get messages for a chat
export async function GET(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: chatId } = params;

    // Check if chat exists and belongs to user
    const chat = await prisma.chat.findUnique({
      where: {
        id: chatId,
        userId: session.user.id,
      },
    });

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    // Get all messages for this chat
    const messages = await prisma.message.findMany({
      where: {
        chatId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Process locked messages to only show preview
    const processedMessages = messages.map(message => {
      if (message.isLocked) {
        return {
          ...message,
          content: "This message is locked. You can unlock it to see the full content.",
          previewType: "locked_message",
          unlockPrice: message.unlockPrice || 0.5
        };
      }
      return message;
    });

    return NextResponse.json(processedMessages);
  } catch (error) {
    console.error(`GET /api/chat/${params.id}/messages error:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
