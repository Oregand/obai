import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import cryptoPaymentService from '@/lib/payment/crypto';

// Get payment history
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all payments for this user
    const payments = await prisma.payment.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error('GET /api/payments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Create a new payment
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, currency = 'USD', paymentType = 'credit_purchase', paymentMethod, coinType } = await request.json();

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Handle crypto payments
    if (paymentMethod === 'crypto') {
      try {
        const paymentIntent = await cryptoPaymentService.createPaymentIntent(
          amount, 
          currency, 
          session.user.id,
          {
            email: session.user.email || '',
            name: session.user.name || '',
            paymentType,
            // If coinType is specified, use it instead of the default
            ...(coinType && { coinType })
          }
        );

        // Create a payment record in pending state
        await prisma.payment.create({
          data: {
            userId: session.user.id,
            amount,
            currency,
            type: paymentType,
            status: 'pending',
            paymentMethod: `crypto_${coinType || paymentIntent.payment_method}`,
            paymentIntent: paymentIntent.id
          }
        });

        return NextResponse.json({
          success: true,
          paymentIntent: {
            id: paymentIntent.id,
            status: paymentIntent.status,
            amount,
            currency,
            checkout_url: paymentIntent.client_secret,
            address: paymentIntent.metadata?.address,
            qrcode_url: paymentIntent.metadata?.qrcode_url
          }
        });
      } catch (error) {
        console.error('Error creating crypto payment:', error);
        return NextResponse.json(
          { error: 'Failed to create crypto payment' }, 
          { status: 500 }
        );
      }
    } else {
      // For other payment methods (to be implemented)
      return NextResponse.json(
        { error: 'Payment method not supported yet' }, 
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('POST /api/payments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Get payment status
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { paymentIntentId } = await request.json();

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Payment ID required' }, { status: 400 });
    }

    // First check our database
    const payment = await prisma.payment.findFirst({
      where: { 
        paymentIntent: paymentIntentId,
        userId: session.user.id
      }
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // For crypto payments, check status with the provider
    if (payment.paymentMethod?.startsWith('crypto_')) {
      try {
        const paymentStatus = await cryptoPaymentService.getPaymentStatus(paymentIntentId);
        
        // Update our payment record if status changed
        if (payment.status !== paymentStatus.status) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: paymentStatus.status,
              completedAt: paymentStatus.status === 'succeeded' ? new Date() : null
            }
          });

          // If payment is now complete, add credits
          if (paymentStatus.status === 'succeeded' && payment.type === 'credit_purchase') {
            await prisma.user.update({
              where: { id: session.user.id },
              data: {
                credits: { increment: payment.amount }
              }
            });
          }
        }

        return NextResponse.json({
          success: true,
          status: paymentStatus.status,
          metadata: paymentStatus.metadata
        });
      } catch (error) {
        console.error('Error checking crypto payment status:', error);
        return NextResponse.json(
          { error: 'Failed to check payment status' }, 
          { status: 500 }
        );
      }
    } else {
      // For other payment methods (to be implemented)
      return NextResponse.json({ 
        success: true,
        status: payment.status
      });
    }
  } catch (error) {
    console.error('PUT /api/payments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
