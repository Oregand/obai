import { NextRequest, NextResponse } from 'next/server';
import emailVerificationService from '@/lib/services/email-verification-service';

/**
 * Endpoint for verifying an email change
 */
export async function GET(req: NextRequest) {
  try {
    // Extract token from the URL
    const token = req.nextUrl.searchParams.get('token');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }
    
    // Verify the token
    const result = await emailVerificationService.verifyEmail(token);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }
    
    // Redirect to profile page with success message
    return NextResponse.redirect(
      new URL(`/profile?verified=true&message=${encodeURIComponent(result.message)}`, req.url)
    );
  } catch (error) {
    console.error('Error verifying email:', error);
    
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    );
  }
}
