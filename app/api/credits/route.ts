import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import TokenService from '@/lib/services/token-service';

// GET /api/credits - Legacy endpoint, redirects to /api/user/balance
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get user balance from token service
    const balance = await TokenService.getUserBalance(session.user.id);
    
    // For backward compatibility, return as "credits"
    return NextResponse.json({ credits: balance });
  } catch (error) {
    console.error('Error fetching user balance:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch user balance' },
      { status: 500 }
    );
  }
}

// POST /api/credits - Legacy endpoint for adding credits
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Redirect to the tokens purchase flow
    return NextResponse.json({
      redirectUrl: '/tokens/purchase',
      message: 'Please use the tokens purchase flow instead'
    });
  } catch (error) {
    console.error('Error processing credits request:', error);
    
    return NextResponse.json(
      { error: 'Failed to process credits request' },
      { status: 500 }
    );
  }
}
