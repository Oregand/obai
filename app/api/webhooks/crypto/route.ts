import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import cryptoPaymentService from '@/lib/payment/crypto';

// Check if we're using mock service for development
const useMockService = process.env.NODE_ENV === 'development' && process.env.USE_MOCK_CRYPTO === 'true';

/**
 * Webhook handler for Coinbase Commerce
 * This endpoint receives notifications when crypto payments are made
 */
export async function POST(request: Request) {
  try {
    // Get the signature from headers
    const headersList = headers();
    const signature = headersList.get('X-CC-Webhook-Signature') || '';
    
    if (!signature && !useMockService) {
      console.error('Missing X-CC-Webhook-Signature header');
      return NextResponse.json({ error: 'Invalid request signature' }, { status: 401 });
    }
    
    // Parse the request body
    const rawBody = await request.text();
    let webhookData: any = {};
    
    try {
      webhookData = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('Error parsing webhook payload:', parseError);
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }
    
    // Variables to store payment information
    let chargeId = '';
    let userId = '';
    let paymentType = 'credit_purchase';
    let amount = 0;
    let currency = 'USD';
    let paymentStatus = 'pending';
    
    // Handle test/mock mode differently
    if (useMockService) {
      console.log('[Mock] Received webhook:', webhookData);
      
      // Parse the data from mock service
      const event = webhookData.event || {};
      const charge = event.data?.object || {};
      
      chargeId = charge.code || webhookData.id || '';
      
      // Extract metadata
      const metadata = charge.metadata || webhookData.metadata || {};
      userId = metadata.userId || '';
      paymentType = metadata.paymentType || 'credit_purchase';
      
      if (!userId) {
        console.error('[Mock] Missing userId in webhook metadata');
        return NextResponse.json({ error: 'Invalid payment data' }, { status: 400 });
      }
      
      // Get pricing info from either structure
      const pricing = charge.pricing || webhookData.pricing || {};
      const localPrice = pricing.local || {};
      amount = parseFloat(localPrice.amount || webhookData.amount || '0');
      currency = localPrice.currency || webhookData.currency || 'USD';
      
      // Map status
      const eventType = event.type || '';
      paymentStatus = eventType.includes('confirmed') || eventType.includes('resolved') || 
                      webhookData.status === 'COMPLETED' ? 'completed' : 
                      eventType.includes('failed') || webhookData.status === 'EXPIRED' || 
                      webhookData.status === 'CANCELED' ? 'failed' : 'processing';
    } else {
      // Verify the webhook signature
      if (!cryptoPaymentService.verifyWebhookSignature(rawBody, signature)) {
        console.error('Invalid signature for webhook');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
      
      // Extract the event type
      const event = webhookData.event || {};
      if (event.type !== 'charge:confirmed' && 
          event.type !== 'charge:failed' && 
          event.type !== 'charge:pending' && 
          event.type !== 'charge:resolved') {
        // Not a payment event we're interested in
        return NextResponse.json({ success: true });
      }
      
      // Extract charge data
      const charge = webhookData.event?.data?.object || {};
      chargeId = charge.code || '';
      
      // Extract metadata
      const metadata = charge.metadata || {};
      userId = metadata.userId || '';
      paymentType = metadata.paymentType || 'credit_purchase';
      
      if (!userId || !chargeId) {
        console.error('Missing userId or chargeId in webhook');
        return NextResponse.json({ error: 'Invalid payment data' }, { status: 400 });
      }
      
      // Get amount and currency
      const pricing = charge.pricing || {};
      const localPrice = pricing.local || {};
      amount = parseFloat(localPrice.amount || '0');
      currency = localPrice.currency || 'USD';
      
      // Map Coinbase status to our payment status
      switch (event.type) {
        case 'charge:confirmed':
        case 'charge:resolved':
          paymentStatus = 'completed';
          break;
        case 'charge:failed':
          paymentStatus = 'failed';
          break;
        case 'charge:pending':
        default:
          paymentStatus = 'processing';
          break;
      }
    }

    // First check if we've already processed this payment
    const existingPayment = await prisma.payment.findFirst({
      where: { paymentIntent: chargeId }
    });
    
    // Update or create the payment record within a transaction to ensure data consistency
    const payment = await prisma.$transaction(async (tx) => {
      // Update or create the payment record
      const payment = existingPayment
        ? await tx.payment.update({
            where: { id: existingPayment.id },
            data: {
              status: paymentStatus,
              completedAt: paymentStatus === 'completed' ? new Date() : null
            }
          })
        : await tx.payment.create({
            data: {
              userId,
              amount,
              currency,
              type: paymentType,
              status: paymentStatus,
              paymentMethod: 'crypto_coinbase',
              paymentIntent: chargeId,
              completedAt: paymentStatus === 'completed' ? new Date() : null
            }
          });
    
      // If payment is completed, add credits to user account
      if (paymentStatus === 'completed' && paymentType === 'credit_purchase') {
        const creditsToAdd = amount; // 1 USD = 1 credit, adjust as needed
        
        await tx.user.update({
          where: { id: userId },
          data: { credits: { increment: creditsToAdd } }
        });
        
        console.log(`Added ${creditsToAdd} credits to user ${userId}`);
      }

      return payment;
    });
    
    return NextResponse.json({
      success: true,
      id: payment.id,
      status: paymentStatus
    });
  } catch (error) {
    console.error('Error processing Coinbase webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
