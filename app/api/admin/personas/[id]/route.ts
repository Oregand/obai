import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

// GET: Fetch a specific persona by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const persona = await prisma.persona.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!persona) {
      return NextResponse.json({ error: 'Persona not found' }, { status: 404 });
    }

    return NextResponse.json({ persona });
  } catch (error) {
    console.error('Error fetching persona:', error);
    return NextResponse.json(
      { error: 'Failed to fetch persona' },
      { status: 500 }
    );
  }
}

// PUT: Update a specific persona
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if persona exists
    const existingPersona = await prisma.persona.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!existingPersona) {
      return NextResponse.json({ error: 'Persona not found' }, { status: 404 });
    }

    // Update persona
    const updatedPersona = await prisma.persona.update({
      where: {
        id: params.id,
      },
      data: {
        name: data.name,
        description: data.description,
        systemPrompt: data.systemPrompt,
        imageUrl: data.imageUrl,
        isPublic: data.isPublic,
        tipEnabled: data.tipEnabled,
        tipSuggestions: data.tipSuggestions,
        lockMessageChance: data.lockMessageChance,
        lockMessagePrice: data.lockMessagePrice,
        tokenRatePerMessage: data.tokenRatePerMessage,
        tokenRatePerMinute: data.tokenRatePerMinute,
        isPremium: data.isPremium,
        dominanceLevel: data.dominanceLevel,
        exclusivityMultiplier: data.exclusivityMultiplier,
      },
    });

    return NextResponse.json({ persona: updatedPersona });
  } catch (error) {
    console.error('Error updating persona:', error);
    return NextResponse.json(
      { error: 'Failed to update persona' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a persona
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if persona exists
    const existingPersona = await prisma.persona.findUnique({
      where: {
        id: params.id,
      },
      include: {
        chats: {
          take: 1, // Just check if there are any chats
        },
      },
    });

    if (!existingPersona) {
      return NextResponse.json({ error: 'Persona not found' }, { status: 404 });
    }

    // Check if persona is being used in chats
    if (existingPersona.chats.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete persona that is being used in chats' },
        { status: 400 }
      );
    }

    // Delete all analytics data for this persona first
    await prisma.personaAnalytics.deleteMany({
      where: {
        personaId: params.id,
      },
    });

    await prisma.personaUsage.deleteMany({
      where: {
        personaId: params.id,
      },
    });

    // Delete the persona
    await prisma.persona.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting persona:', error);
    return NextResponse.json(
      { error: 'Failed to delete persona' },
      { status: 500 }
    );
  }
}
