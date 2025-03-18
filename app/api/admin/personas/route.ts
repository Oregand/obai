import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

// GET: Fetch all personas
export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        isAdmin: true,
      },
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const personas = await prisma.persona.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({ personas });
  } catch (error) {
    console.error('Error fetching personas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch personas' },
      { status: 500 }
    );
  }
}

// POST: Create a new persona
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        isAdmin: true,
        id: true,
      },
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = await req.json();
    
    // Validate required fields
    const requiredFields = ['name', 'description', 'systemPrompt'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create persona with defaults for optional fields
    const persona = await prisma.persona.create({
      data: {
        name: data.name,
        description: data.description,
        systemPrompt: data.systemPrompt,
        imageUrl: data.imageUrl || null,
        isPublic: data.isPublic ?? true,
        tipEnabled: data.tipEnabled ?? true,
        tipSuggestions: data.tipSuggestions || [1, 3, 5],
        lockMessageChance: data.lockMessageChance ?? 0.05,
        lockMessagePrice: data.lockMessagePrice ?? 0.5,
        tokenRatePerMessage: data.tokenRatePerMessage ?? 1.0,
        tokenRatePerMinute: data.tokenRatePerMinute ?? 0.0,
        isPremium: data.isPremium ?? false,
        dominanceLevel: data.dominanceLevel ?? 1,
        exclusivityMultiplier: data.exclusivityMultiplier ?? 1.0,
        createdBy: user.id,
      },
    });

    return NextResponse.json({ persona }, { status: 201 });
  } catch (error) {
    console.error('Error creating persona:', error);
    return NextResponse.json(
      { error: 'Failed to create persona' },
      { status: 500 }
    );
  }
}
