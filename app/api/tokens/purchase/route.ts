import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import TokenService from '@/lib/services/token-service';

// POST /api/tokens/purchase - Initiate a token purchase
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { packageId, customTokenAmount, paymentMethodId } = await req.json();
    
    if (!packageId) {
      return NextResponse.json(
        { error: 'Package ID is required' },
        { status: 400 }
      );
    }
    
    // Validate custom token amount if provided
    if (packageId === 'custom' && (!customTokenAmount || customTokenAmount < 10)) {
      return NextResponse.json(
        { error: 'Custom token amount must be at least 10' },
        { status: 400 }
      );
    }
    
    // Initiate purchase through token service
    const purchaseData = await TokenService.purchaseTokens(
      session.user.id,
      packageId,
      customTokenAmount || 0,
      paymentMethodId || null
    );
    
    return NextResponse.json(purchaseData);
  } catch (error) {
    console.error('Error initiating token purchase:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to initiate token purchase' },
      { status: 500 }
    );
  }
}
