import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import imageUploadService from '@/lib/services/upload/image-upload-service';

// POST /api/user/image - Upload or change user profile image
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // In a real implementation, you would use a library like formidable
    // to handle file uploads. For simplicity, we'll handle it using FormData.
    const formData = await req.formData();
    const image = formData.get('image') as File;
    
    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(image.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are supported.' },
        { status: 400 }
      );
    }
    
    // Upload the image using our service
    const uploadResult = await imageUploadService.uploadImage(image, session.user.id);
    
    if (!uploadResult.success) {
      return NextResponse.json(
        { error: uploadResult.error || 'Failed to upload image' },
        { status: 400 }
      );
    }
    
    const imageUrl = uploadResult.url;
    
    // Update the user's image URL in the database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: imageUrl }
    });
    
    return NextResponse.json({ 
      success: true,
      imageUrl 
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}

// DELETE /api/user/image - Remove user profile image
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get current user to find image URL
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true }
    });
    
    // Delete the image if it exists
    if (user?.image) {
      await imageUploadService.deleteImage(user.image);
    }
    
    // Update user record to remove the image URL
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: null }
    });
    
    return NextResponse.json({ 
      success: true,
      message: 'Profile image removed successfully'
    });
  } catch (error) {
    console.error('Error removing image:', error);
    
    return NextResponse.json(
      { error: 'Failed to remove image' },
      { status: 500 }
    );
  }
}
