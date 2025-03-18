import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const publicPersonas = await prisma.persona.findMany({
      where: {
        isPublic: true,
      },
    });

    const userPersonas = await prisma.persona.findMany({
      where: {
        createdBy: session.user.id,
        isPublic: false,
      },
    });

    return NextResponse.json([...publicPersonas, ...userPersonas]);
  } catch (error) {
    console.error('GET /api/persona error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user's subscription tier
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        subscriptionStatus: true,
        subscriptionExpiry: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if subscription is active and at least premium tier
    const isSubscriptionActive = user.subscriptionExpiry ? new Date(user.subscriptionExpiry) > new Date() : false;
    const hasPremiumOrHigher = ['premium', 'vip'].includes(user.subscriptionStatus || '');

    if (!isSubscriptionActive || !hasPremiumOrHigher) {
      return NextResponse.json(
        { error: 'Persona creation requires an active premium or VIP subscription' }, 
        { status: 403 }
      );
    }

    const { name, description, systemPrompt, imageUrl, isPublic } = await request.json();

    if (!name || !description || !systemPrompt) {
      return NextResponse.json({ error: 'Name, description, and system prompt are required' }, { status: 400 });
    }

    const persona = await prisma.persona.create({
      data: {
        name,
        description,
        systemPrompt,
        imageUrl: imageUrl || null,
        isPublic: isPublic || false,
        createdBy: session.user.id,
      },
    });

    return NextResponse.json(persona, { status: 201 });
  } catch (error) {
    console.error('POST /api/persona error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
