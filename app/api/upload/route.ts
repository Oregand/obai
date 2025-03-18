import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

// Max file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get form data with the file
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'user' or 'persona'
    const entityId = formData.get('id') as string; // userId or personaId
    
    // Validate file
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
    }
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }
    
    // Create a unique filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.type.split('/')[1];
    const filename = `${uuidv4()}.${ext}`;
    
    // Create directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    try {
      await import('fs').then(fs => {
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
      });
    } catch (err) {
      console.error('Error creating directory:', err);
    }
    
    // Write file to disk
    const filePath = join(uploadDir, filename);
    await writeFile(filePath, buffer);
    
    // Update database based on type
    const imageUrl = `/uploads/${filename}`;
    
    if (type === 'user') {
      // Verify user can only update their own profile
      if (entityId !== session.user.id && !session.user.isAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
      
      // Update user image
      await prisma.user.update({
        where: { id: entityId },
        data: { image: imageUrl }
      });
    } else if (type === 'persona') {
      // For persona, check if user is admin or the creator
      const persona = await prisma.persona.findUnique({
        where: { id: entityId }
      });
      
      if (!persona) {
        return NextResponse.json({ error: 'Persona not found' }, { status: 404 });
      }
      
      // Check if user is authorized to update this persona
      if (
        !session.user.isAdmin && 
        persona.createdBy !== session.user.id && 
        persona.isPublic
      ) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
      
      // Update persona image
      await prisma.persona.update({
        where: { id: entityId },
        data: { imageUrl }
      });
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: true, 
      imageUrl
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
