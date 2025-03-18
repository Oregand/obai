import { CryptoTransactionStatus } from './CryptoPayment';

/**
 * General Payment Models
 * These interfaces define the structure of payment-related data
 * across different payment methods
 */

/**
 * Available payment methods in the application
 */
export enum PaymentMethod {
  CARD = 'card',               // Credit/debit card
  PAYPAL = 'paypal',           // PayPal
  CRYPTO_BTC = 'crypto_BTC',   // Bitcoin
  CRYPTO_ETH = 'crypto_ETH',   // Ethereum
  CRYPTO_LTC = 'crypto_LTC',   // Litecoin
  CRYPTO_DOGE = 'crypto_DOGE', // Dogecoin
  CRYPTO_USDT = 'crypto_USDT', // Tether USD
}

/**
 * Payment types available in the application
 */
export enum PaymentType {
  CREDIT_PURCHASE = 'credit_purchase',  // Purchasing credits
  SUBSCRIPTION = 'subscription',        // Subscription payment
  TIP = 'tip',                          // Tip payment
  MESSAGE_UNLOCK = 'message_unlock',    // Unlocking a message
}

/**
 * Common payment status across payment methods
 */
export enum PaymentStatus {
  PENDING = 'pending',         // Waiting for payment
  PROCESSING = 'processing',   // Processing payment
  COMPLETED = 'completed',     // Payment completed
  FAILED = 'failed',           // Payment failed
  CANCELED = 'canceled',       // Payment canceled
}

/**
 * Maps CryptoTransactionStatus to PaymentStatus
 */
export const mapCryptoStatusToPaymentStatus = (
  cryptoStatus: CryptoTransactionStatus
): PaymentStatus => {
  switch (cryptoStatus) {
    case CryptoTransactionStatus.PENDING:
      return PaymentStatus.PENDING;
    case CryptoTransactionStatus.RECEIVED:
    case CryptoTransactionStatus.PROCESSING:
      return PaymentStatus.PROCESSING;
    case CryptoTransactionStatus.COMPLETED:
      return PaymentStatus.COMPLETED;
    case CryptoTransactionStatus.FAILED:
      return PaymentStatus.FAILED;
    case CryptoTransactionStatus.CANCELED:
      return PaymentStatus.CANCELED;
    default:
      return PaymentStatus.PENDING;
  }
};

/**
 * Interface for payment intent data
 */
export interface PaymentIntentData {
  id: string;                      // Payment intent ID
  amount: number;                  // Amount to charge
  currency: string;                // Currency code (USD, EUR, etc.)
  status: PaymentStatus;           // Payment status
  paymentMethod?: PaymentMethod;   // Payment method used
  paymentType: PaymentType;        // Type of payment
  metadata?: Record<string, any>;  // Additional metadata
  clientSecret?: string;           // Client secret for frontend
  createdAt: Date;                 // When the intent was created
  expiresAt?: Date;                // When the intent expires
}

/**
 * Interface for payment result after processing
 */
export interface PaymentResult {
  success: boolean;                // Whether the payment succeeded
  paymentId: string;               // Payment ID in database
  paymentIntentId: string;         // Payment intent ID from provider
  amount: number;                  // Amount charged
  currency: string;                // Currency code
  status: PaymentStatus;           // Payment status
  message?: string;                // Optional message
  redirectUrl?: string;            // Optional redirect URL
  error?: string;                  // Error message if payment failed
}
