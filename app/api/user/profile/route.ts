import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import emailVerificationService from '@/lib/services/email-verification-service';

// Define validation schema for profile update
const ProfileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Please enter a valid email address"),
});

export async function PUT(request: Request) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse the request body
    const body = await request.json();
    
    // Validate input
    const result = ProfileUpdateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: "Invalid input data", errors: result.error.errors },
        { status: 400 }
      );
    }
    
    const { name, email } = result.data;
    
    // Check if email is already taken by a different user
    if (email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
      
      if (existingUser && existingUser.id !== session.user.id) {
        return NextResponse.json(
          { message: "Email is already in use by another account" },
          { status: 409 }
        );
      }
    }
    
    // Check if email is being changed
    const isEmailChanged = email.toLowerCase() !== session.user.email?.toLowerCase();
    
    if (isEmailChanged) {
      // Generate a verification token
      const token = await emailVerificationService.generateVerificationToken(
        session.user.id, 
        email.toLowerCase()
      );
      
      // Send the verification email
      await emailVerificationService.sendVerificationEmail(
        email.toLowerCase(),
        token,
        name || session.user.name || 'User'
      );
      
      // Update only the name for now
      const updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          name,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      });
      
      return NextResponse.json({
        ...updatedUser,
        message: "We've sent a verification email to your new address. Please check your inbox to complete the email change."
      }, { status: 200 });
    } else {
      // Just update the name
      const updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          name,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      });
      
      return NextResponse.json(updatedUser, { status: 200 });
    }
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
