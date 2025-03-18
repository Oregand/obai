import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import mockCryptoPaymentService from '@/lib/payment/crypto/mockCryptoService';

/**
 * Testing endpoint for crypto payments
 * This is only available in development mode
 */
export async function POST(request: Request) {
  try {
    // Check if we're in development mode and using mock service
    if (process.env.NODE_ENV !== 'development' || process.env.USE_MOCK_CRYPTO !== 'true') {
      return NextResponse.json(
        { error: 'This endpoint is only available in development mode with USE_MOCK_CRYPTO=true' },
        { status: 403 }
      );
    }
    
    // Get user auth
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { action, paymentIntentId } = await request.json();
    
    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Payment ID required' }, { status: 400 });
    }
    
    // Find the payment
    const payment = await prisma.payment.findFirst({
      where: { 
        paymentIntent: paymentIntentId,
        userId: session.user.id
      }
    });
    
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }
    
    if (action === 'advance') {
      // Advance the payment status
      try {
        const newStatus = mockCryptoPaymentService.advancePaymentStatus(paymentIntentId);
        
        // Update the payment status in our database
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: newStatus === 'completed' ? 'completed' : 
                  newStatus === 'processing' ? 'processing' : 'pending',
            completedAt: newStatus === 'completed' ? new Date() : null
          }
        });
        
        // If payment is now complete, add credits
        if (newStatus === 'completed' && payment.type === 'credit_purchase') {
          await prisma.user.update({
            where: { id: session.user.id },
            data: {
              credits: { increment: payment.amount }
            }
          });
          
          console.log(`[Test] Added ${payment.amount} credits to user ${session.user.id}`);
        }
        
        return NextResponse.json({
          success: true,
          status: newStatus
        });
      } catch (error) {
        console.error('Error advancing payment status:', error);
        return NextResponse.json({ error: 'Failed to advance payment status' }, { status: 500 });
      }
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in crypto testing endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
