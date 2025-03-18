import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user is admin (you can implement your own admin check here)
    // For now, we'll assume all authenticated users can manage personas
    
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const personaId = formData.get('personaId') as string;
    
    if (!file) {
      return NextResponse.json(
        { message: "No image file provided" },
        { status: 400 }
      );
    }
    
    if (!personaId) {
      return NextResponse.json(
        { message: "Persona ID is required" },
        { status: 400 }
      );
    }
    
    // Validate the persona exists
    const persona = await prisma.persona.findUnique({
      where: { id: personaId },
    });
    
    if (!persona) {
      return NextResponse.json(
        { message: "Persona not found" },
        { status: 404 }
      );
    }
    
    // Validate file type
    const fileType = file.type;
    if (!fileType.startsWith('image/')) {
      return NextResponse.json(
        { message: "File must be an image" },
        { status: 400 }
      );
    }
    
    // Get file extension
    const fileExtension = fileType.split('/')[1];
    
    // Create a unique filename
    const fileName = `persona_${uuidv4()}.${fileExtension}`;
    
    // Define upload directory and path
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'personas');
    const filePath = join(uploadDir, fileName);
    const publicPath = `/uploads/personas/${fileName}`;
    
    // Convert file to buffer and save it
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);
    
    // Update persona with the new image
    await prisma.persona.update({
      where: { id: personaId },
      data: {
        imageUrl: publicPath,
        updatedAt: new Date(),
      },
    });
    
    return NextResponse.json(
      { imageUrl: publicPath },
      { status: 200 }
    );
  } catch (error) {
    console.error('Persona image upload error:', error);
    return NextResponse.json(
      { message: "Failed to upload persona image" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse the URL to get the persona ID
    const url = new URL(request.url);
    const personaId = url.searchParams.get('personaId');
    
    if (!personaId) {
      return NextResponse.json(
        { message: "Persona ID is required" },
        { status: 400 }
      );
    }
    
    // Validate the persona exists
    const persona = await prisma.persona.findUnique({
      where: { id: personaId },
    });
    
    if (!persona) {
      return NextResponse.json(
        { message: "Persona not found" },
        { status: 404 }
      );
    }
    
    // Update persona to remove the image
    await prisma.persona.update({
      where: { id: personaId },
      data: {
        imageUrl: null,
        updatedAt: new Date(),
      },
    });
    
    return NextResponse.json(
      { message: "Persona image removed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error('Persona image removal error:', error);
    return NextResponse.json(
      { message: "Failed to remove persona image" },
      { status: 500 }
    );
  }
}
