import axios from 'axios';
import crypto from 'crypto';

interface CoinbasePaymentIntent {
  id: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed';
  client_secret: string; // URL to payment page or other auth token
  payment_method: string; // Cryptocurrency type
  amount: number;
  currency: string;
  metadata?: {
    address?: string; // Crypto wallet address
    qrcode_url?: string; // URL to QR code image
    txid?: string; // Blockchain transaction ID when completed
    userId?: string;
    email?: string;
    name?: string;
    paymentType?: string;
  };
  created_at: Date;
  updated_at: Date;
}

class CoinbasePaymentService {
  private apiKey: string;
  private webhookSecret: string;
  
  constructor() {
    this.apiKey = process.env.COINBASE_COMMERCE_API_KEY || '';
    this.webhookSecret = process.env.COINBASE_COMMERCE_WEBHOOK_SECRET || '';
    
    // Log environment setup status without exposing actual keys
    if (!this.apiKey) {
      console.warn('Coinbase Commerce API key is not set');
    }
    if (!this.webhookSecret) {
      console.warn('Coinbase Commerce webhook secret is not set');
    }
  }
  
  /**
   * Create a payment intent using Coinbase Commerce
   */
  async createPaymentIntent(
    amount: number,
    currency: string,
    userId: string,
    options: {
      email?: string;
      name?: string;
      paymentType?: string;
      coinType?: string;
    } = {}
  ): Promise<CoinbasePaymentIntent> {
    const { email, name, paymentType } = options;
    
    try {
          // Get app URL with fallback to localhost if not set
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
          
          // Create charge via Coinbase Commerce API
          const response = await axios.post(
            'https://api.commerce.coinbase.com/charges',
            {
              name: `Token Purchase - ${amount} Credits`,
              description: `Purchase of ${amount} credits for OBAI`,
              pricing_type: 'fixed_price',
              local_price: {
                amount: amount.toString(),
                currency: currency
              },
              metadata: {
                userId,
                paymentType,
                customer_name: name,
                customer_email: email
              },
              redirect_url: `${appUrl}/credits/success`,
              cancel_url: `${appUrl}/credits/cancel`
            },
        {
          headers: {
            'X-CC-Api-Key': this.apiKey,
            'X-CC-Version': '2018-03-22',
            'Content-Type': 'application/json'
          }
        }
      );
      
      const charge = response.data.data;
      
      // Get the hosted URL and one crypto address (if available)
      const hostedUrl = charge.hosted_url;
      const addresses = charge.addresses || {};
      const firstCryptoType = Object.keys(addresses)[0] || '';
      const address = addresses[firstCryptoType] || '';
      
      // Convert to our standardized payment intent format
      return {
        id: charge.code,
        status: this.mapCoinbaseStatus(charge.timeline[0]?.status || 'NEW'),
        client_secret: hostedUrl,
        payment_method: firstCryptoType || 'MULTIPLE',
        amount,
        currency,
        metadata: {
          address,
          qrcode_url: address ? `https://chart.googleapis.com/chart?chs=250x250&cht=qr&chl=${address}` : undefined,
          userId,
          email,
          name,
          paymentType
        },
        created_at: new Date(charge.created_at),
        updated_at: new Date(charge.created_at)
      };
    } catch (error) {
      console.error('Error creating Coinbase payment:', error);
      throw new Error('Failed to create crypto payment');
    }
  }
  
  /**
   * Check the status of a payment
   */
  async getPaymentStatus(chargeCode: string): Promise<{
    status: 'pending' | 'processing' | 'succeeded' | 'failed';
    metadata?: any;
  }> {
    try {
      const response = await axios.get(
        `https://api.commerce.coinbase.com/charges/${chargeCode}`,
        {
          headers: {
            'X-CC-Api-Key': this.apiKey,
            'X-CC-Version': '2018-03-22'
          }
        }
      );
      
      const charge = response.data.data;
      const timeline = charge.timeline || [];
      
      // Find the most recent status
      let currentStatus = 'NEW';
      if (timeline.length > 0) {
        // Sort by timestamp descending to get the most recent status
        timeline.sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime());
        currentStatus = timeline[0].status;
      }
      
      // Map to our status format
      const status = this.mapCoinbaseStatus(currentStatus);
      
      return {
        status,
        metadata: {
          ...charge.metadata,
          coinbase_status: currentStatus,
          payments: charge.payments
        }
      };
    } catch (error) {
      console.error('Error checking Coinbase payment status:', error);
      throw new Error('Failed to check payment status');
    }
  }
  
  /**
   * Verify webhook signature from Coinbase Commerce
   * Based on Coinbase's documentation: https://commerce.coinbase.com/docs/api/#webhooks
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      if (!this.webhookSecret) {
        console.warn('Webhook secret not configured, skipping signature verification');
        return true;
      }
      
      // Coinbase uses HMAC SHA256 with the webhook shared secret
      const hmac = crypto.createHmac('sha256', this.webhookSecret);
      hmac.update(payload);
      const computedSignature = hmac.digest('hex');
      
      // Compare the signatures in constant time to prevent timing attacks
      try {
        return crypto.timingSafeEqual(
          Buffer.from(signature),
          Buffer.from(computedSignature)
        );
      } catch (e) {
        // If there's a buffer length mismatch, do a regular comparison as fallback
        // This is less secure but better than failing completely
        console.warn('Failed to use timingSafeEqual, falling back to regular comparison');
        return signature === computedSignature;
      }
    } catch (error) {
      console.error('Error verifying webhook signature:', error);
      return false;
    }
  }
  
  /**
   * Map Coinbase status to our application status
   */
  private mapCoinbaseStatus(coinbaseStatus: string): 'pending' | 'processing' | 'succeeded' | 'failed' {
    switch (coinbaseStatus.toUpperCase()) {
      case 'COMPLETED':
      case 'CONFIRMED':
      case 'RESOLVED':
        return 'succeeded';
      case 'PENDING':
      case 'NEW':
        return 'pending';
      case 'UNRESOLVED':
      case 'DELAYED':
        return 'processing';
      case 'EXPIRED':
      case 'CANCELED':
      case 'REFUND PENDING':
      case 'REFUNDED':
        return 'failed';
      default:
        return 'pending';
    }
  }
}

export default new CoinbasePaymentService();
