/**
 * CryptoPayment Models
 * These interfaces define the structure of crypto payment-related data
 */

/**
 * Interface for a crypto coin available for payment
 */
export interface CryptoCoin {
  code: string;      // Currency code (e.g., BTC, ETH)
  name: string;      // Full name (e.g., Bitcoin, Ethereum)
  image?: string;    // URL to coin logo
  rate?: number;     // Exchange rate to BTC or USD
  minTxFee?: number; // Minimum transaction fee
}

/**
 * Interface for crypto payment transaction details
 * Used for interacting with crypto payment providers like CoinPayments
 */
export interface CryptoTransaction {
  txnId: string;            // Transaction ID from payment provider
  address: string;          // Cryptocurrency address to send funds to
  amount: number;           // Amount in fiat currency (usually USD)
  amountCrypto?: number;    // Amount in cryptocurrency
  currency: string;         // Fiat currency code (usually USD)
  cryptoCurrency: string;   // Cryptocurrency code (BTC, ETH, etc.)
  status: CryptoTransactionStatus;
  confirmsNeeded?: number;  // Confirmations needed
  timeCreated: number;      // Unix timestamp
  timeExpires?: number;     // Unix timestamp for expiration
  checkoutUrl?: string;     // URL to payment provider checkout page
  statusUrl?: string;       // URL to check transaction status
  qrcodeUrl?: string;       // URL to QR code image
}

/**
 * Status of a crypto transaction
 */
export enum CryptoTransactionStatus {
  PENDING = 'pending',      // Waiting for payment
  RECEIVED = 'received',    // Payment received but not confirmed
  PROCESSING = 'processing',// Confirming on blockchain
  COMPLETED = 'completed',  // Payment confirmed and completed
  FAILED = 'failed',        // Payment failed
  CANCELED = 'canceled',    // Payment canceled or timed out
}

/**
 * Interface for Instant Payment Notification (IPN) data
 * from crypto payment processors like CoinPayments
 */
export interface CryptoIpnData {
  ipn_type: string;         // Type of IPN (usually 'api')
  ipn_id: string;           // Unique ID for this IPN
  ipn_mode: string;         // IPN mode (usually 'hmac')
  merchant: string;         // Merchant ID
  ipn_version: string;      // IPN version
  
  // Transaction details
  txn_id: string;           // Transaction ID on payment processor
  status: number;           // Status code (varies by provider)
  status_text: string;      // Human-readable status
  
  // Payment details
  amount1: string;          // Amount in currency1 (usually fiat)
  currency1: string;        // First currency (usually fiat like USD)
  amount2: string;          // Amount in currency2 (crypto)
  currency2: string;        // Second currency (crypto like BTC)
  
  // Additional info
  address: string;          // Crypto payment address
  buyer_name?: string;      // Buyer name if provided
  buyer_email?: string;     // Buyer email if provided
  item_name?: string;       // Item name if provided
  item_number?: string;     // Item number if provided
  invoice?: string;         // Invoice number if provided
  custom?: string;          // Custom field (usually JSON)
  [key: string]: any;       // Other fields that might be present
}

/**
 * Interface for frontend payment response
 * This is the data returned to the frontend when creating a payment
 */
export interface CryptoPaymentResponse {
  success: boolean;
  paymentIntent: {
    id: string;             // Payment intent ID
    status: string;         // Payment status
    amount: number;         // Amount in fiat
    currency: string;       // Fiat currency code
    checkout_url: string;   // URL to checkout page
    address: string;        // Crypto address
    qrcode_url?: string;    // URL to QR code
  };
}
