import { v4 as uuidv4 } from 'uuid';

/**
 * This is a mock implementation of the Coinbase Commerce service for development
 */

interface MockPaymentIntent {
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

// In-memory storage for payment intents (would be a database in production)
const paymentIntents: Record<string, MockPaymentIntent> = {};

// Mock wallet addresses for different cryptocurrencies
const MOCK_ADDRESSES: Record<string, string> = {
  BTC: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
  ETH: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
  LTC: 'LTdsVS8VDw6syvfQADdhf2PHAm3rMGJvTs',
  DOGE: 'D5tpvRMT3jBgXteMTZ9YAUtaS7DKjMr5XT',
  USDT: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
};

class MockCoinbasePaymentService {
  /**
   * Create a payment intent for crypto payment
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
  ): Promise<MockPaymentIntent> {
    const { email, name, paymentType, coinType = 'BTC' } = options;
    
    // Generate app URL with fallback
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // Generate a unique ID for the payment
    const id = `charge_${uuidv4().slice(0, 8)}`;
    
    // Generate QR code URL (in production, this would be a real URL)
    const qrcode_url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${MOCK_ADDRESSES[coinType]}`;
    
    // Create payment intent
    const paymentIntent: MockPaymentIntent = {
      id,
      status: 'pending',
      client_secret: `${appUrl}/mock-checkout/${id}`,
      payment_method: coinType,
      amount,
      currency,
      metadata: {
        address: MOCK_ADDRESSES[coinType],
        qrcode_url,
        userId,
        email,
        name,
        paymentType,
      },
      created_at: new Date(),
      updated_at: new Date(),
    };
    
    // Store the payment intent in memory
    paymentIntents[id] = paymentIntent;
    
    return paymentIntent;
  }
  
  /**
   * Get the status of a payment intent
   */
  async getPaymentStatus(paymentIntentId: string): Promise<{
    status: 'pending' | 'processing' | 'succeeded' | 'failed';
    metadata?: any;
  }> {
    const paymentIntent = paymentIntents[paymentIntentId];
    
    if (!paymentIntent) {
      throw new Error('Payment intent not found');
    }
    
    // In a real implementation, this would check with Coinbase
    // For our mock, we'll have a random chance to update the status
    if (paymentIntent.status === 'pending') {
      // 30% chance to move to processing
      if (Math.random() < 0.3) {
        paymentIntent.status = 'processing';
        paymentIntent.updated_at = new Date();
      }
    } else if (paymentIntent.status === 'processing') {
      // 50% chance to move to succeeded
      if (Math.random() < 0.5) {
        paymentIntent.status = 'succeeded';
        paymentIntent.metadata = {
          ...paymentIntent.metadata,
          txid: `tx_${uuidv4()}`,
        };
        paymentIntent.updated_at = new Date();
      }
    }
    
    return {
      status: paymentIntent.status,
      metadata: paymentIntent.metadata,
    };
  }
  
  /**
   * Verify a webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    // In mock mode, we always return true
    return true;
  }
  
  /**
   * Simulate a webhook from Coinbase
   */
  simulateWebhook(paymentIntentId: string): {
    success: boolean;
    event: any;
  } {
    const paymentIntent = paymentIntents[paymentIntentId];
    
    if (!paymentIntent) {
      return { success: false, event: null };
    }
    
    // Simulate payment completion
    paymentIntent.status = 'succeeded';
    paymentIntent.metadata = {
      ...paymentIntent.metadata,
      txid: `tx_${uuidv4()}`,
    };
    paymentIntent.updated_at = new Date();
    
    // Create mock webhook event
    const event = {
      id: `evt_${uuidv4()}`,
      type: 'charge:confirmed',
      data: {
        object: {
          code: paymentIntentId,
          name: `Token Purchase - ${paymentIntent.amount} Credits`,
          pricing: {
            local: {
              amount: paymentIntent.amount.toString(),
              currency: paymentIntent.currency
            }
          },
          metadata: paymentIntent.metadata,
          timeline: [
            {
              status: 'NEW',
              time: new Date(paymentIntent.created_at.getTime() - 1000).toISOString()
            },
            {
              status: 'COMPLETED',
              time: new Date().toISOString()
            }
          ]
        }
      }
    };
    
    return { success: true, event };
  }
}

export default new MockCoinbasePaymentService();
