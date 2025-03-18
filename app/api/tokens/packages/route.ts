import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { TOKEN_PACKAGES } from '@/lib/services/token-service';

// GET /api/tokens/packages - Get all token packages
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Return all available token packages
    return NextResponse.json({ packages: TOKEN_PACKAGES });
  } catch (error) {
    console.error('Error fetching token packages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch token packages' },
      { status: 500 }
    );
  }
}
