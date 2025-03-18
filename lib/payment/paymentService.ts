// This file defines interfaces for payment processing

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  client_secret?: string;
  payment_method?: string;
  created: number; // Unix timestamp
  metadata?: Record<string, string>;
}

export interface PaymentMethodDetails {
  id: string;
  type: 'card' | 'paypal' | 'bank_transfer' | string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  billing_details?: {
    name?: string;
    email?: string;
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      country?: string;
    };
  };
}

export interface CustomerInfo {
  id: string;
  email: string;
  name?: string;
  payment_methods?: PaymentMethodDetails[];
  metadata?: Record<string, string>;
}

export interface PaymentServiceInterface {
  // Create a payment intent
  createPaymentIntent(
    amount: number, 
    currency: string, 
    userId: string, 
    metadata?: Record<string, string>
  ): Promise<PaymentIntent>;
  
  // Complete a payment
  confirmPayment(paymentIntentId: string, paymentMethodId?: string): Promise<PaymentIntent>;
  
  // Get payment status
  getPaymentStatus(paymentIntentId: string): Promise<PaymentIntent>;
  
  // Refund a payment
  refundPayment(
    paymentIntentId: string, 
    amount?: number, 
    reason?: string
  ): Promise<{ id: string; status: string; }>;
  
  // Create or retrieve a customer
  getOrCreateCustomer(userId: string, email: string, name?: string): Promise<CustomerInfo>;
  
  // Save a payment method for a customer
  savePaymentMethod(
    customerId: string, 
    paymentMethodId: string
  ): Promise<PaymentMethodDetails>;
  
  // Get saved payment methods for a customer
  getSavedPaymentMethods(customerId: string): Promise<PaymentMethodDetails[]>;
}

// Mock implementation for testing
export class MockPaymentService implements PaymentServiceInterface {
  async createPaymentIntent(
    amount: number, 
    currency: string, 
    userId: string, 
    metadata?: Record<string, string>
  ): Promise<PaymentIntent> {
    return {
      id: `pi_mock_${Math.random().toString(36).substring(2, 15)}`,
      amount,
      currency,
      status: 'pending',
      client_secret: `pi_mock_secret_${Math.random().toString(36).substring(2, 15)}`,
      created: Date.now() / 1000,
      metadata
    };
  }
  
  async confirmPayment(paymentIntentId: string): Promise<PaymentIntent> {
    return {
      id: paymentIntentId,
      amount: 1000, // $10.00
      currency: 'usd',
      status: 'succeeded',
      created: Date.now() / 1000
    };
  }
  
  async getPaymentStatus(paymentIntentId: string): Promise<PaymentIntent> {
    return {
      id: paymentIntentId,
      amount: 1000,
      currency: 'usd',
      status: 'succeeded',
      created: Date.now() / 1000
    };
  }
  
  async refundPayment(paymentIntentId: string, amount?: number, reason?: string) {
    return {
      id: `re_mock_${Math.random().toString(36).substring(2, 15)}`,
      status: 'succeeded'
    };
  }
  
  async getOrCreateCustomer(userId: string, email: string, name?: string): Promise<CustomerInfo> {
    return {
      id: `cus_mock_${userId.substring(0, 8)}`,
      email,
      name: name || '',
      payment_methods: []
    };
  }
  
  async savePaymentMethod(customerId: string, paymentMethodId: string): Promise<PaymentMethodDetails> {
    return {
      id: paymentMethodId,
      type: 'card',
      card: {
        brand: 'visa',
        last4: '4242',
        exp_month: 12,
        exp_year: 2025
      }
    };
  }
  
  async getSavedPaymentMethods(customerId: string): Promise<PaymentMethodDetails[]> {
    return [
      {
        id: `pm_mock_${Math.random().toString(36).substring(2, 15)}`,
        type: 'card',
        card: {
          brand: 'visa',
          last4: '4242',
          exp_month: 12,
          exp_year: 2025
        }
      }
    ];
  }
}

// Export a mock service instance for testing
export const paymentService = new MockPaymentService();
