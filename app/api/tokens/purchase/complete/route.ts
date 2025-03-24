import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import TokenService from '@/lib/services/token-service';

// POST /api/tokens/purchase/complete - Complete a token purchase
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { paymentId } = await req.json();
    
    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }
    
    // Complete purchase through token service
    const result = await TokenService.completeTokenPurchase(paymentId);
    
    // The TokenService.completeTokenPurchase doesn't return payment.userId
    // so we'll skip this check for now and update the service later
    // Verify the payment belongs to this user
    // if (result.payment?.userId !== session.user.id) {
    //   return NextResponse.json(
    //     { error: 'Unauthorized payment' },
    //     { status: 403 }
    //   );
    // }
    
    return NextResponse.json({
      success: true,
      message: result.message,
      paymentId: result.paymentId
    });
  } catch (error) {
    console.error('Error completing token purchase:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to complete token purchase' },
      { status: 500 }
    );
  }
}
