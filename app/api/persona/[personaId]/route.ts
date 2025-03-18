import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { personaId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const personaId = params.personaId;

    const persona = await prisma.persona.findUnique({
      where: { id: personaId }
    });

    if (!persona) {
      return NextResponse.json({ error: 'Persona not found' }, { status: 404 });
    }

    // If persona is private and not created by the user, deny access
    if (!persona.isPublic && persona.createdBy !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(persona);
  } catch (error) {
    console.error('GET /api/persona/[personaId] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { personaId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const personaId = params.personaId;
    
    // Check if persona exists and belongs to the user
    const existingPersona = await prisma.persona.findFirst({
      where: {
        id: personaId,
        createdBy: session.user.id
      }
    });

    if (!existingPersona) {
      return NextResponse.json({ error: 'Persona not found or you do not have permission to edit it' }, { status: 404 });
    }

    const { name, description, systemPrompt, imageUrl, isPublic } = await request.json();

    if (!name || !description || !systemPrompt) {
      return NextResponse.json({ error: 'Name, description, and system prompt are required' }, { status: 400 });
    }

    const updatedPersona = await prisma.persona.update({
      where: { id: personaId },
      data: {
        name,
        description,
        systemPrompt,
        imageUrl: imageUrl || null,
        isPublic: isPublic || false
      }
    });

    return NextResponse.json(updatedPersona);
  } catch (error) {
    console.error('PUT /api/persona/[personaId] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { personaId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const personaId = params.personaId;
    
    // Check if persona exists and belongs to the user
    const existingPersona = await prisma.persona.findFirst({
      where: {
        id: personaId,
        createdBy: session.user.id
      }
    });

    if (!existingPersona) {
      return NextResponse.json({ error: 'Persona not found or you do not have permission to delete it' }, { status: 404 });
    }

    // Check if the persona is being used in any active chats
    const activeChats = await prisma.chat.count({
      where: {
        personaId,
        updatedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Active in the last 7 days
        }
      }
    });

    if (activeChats > 0) {
      return NextResponse.json({ 
        error: 'This persona is being used in active chats and cannot be deleted',
        activeChats
      }, { status: 400 });
    }

    // Delete the persona
    await prisma.persona.delete({
      where: { id: personaId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/persona/[personaId] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
