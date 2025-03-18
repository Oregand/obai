/**
 * Type definitions for payment-related data structures
 */

/**
 * Token package information
 */
export interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  bonus?: number;
  price: number;
  description?: string;
  mostPopular?: boolean;
  savePercentage?: number;
}

/**
 * Custom token tier information
 */
export interface TokenTier {
  minTokens: number;
  maxTokens: number;
  pricePerToken: number;
  bonusPercentage: number;
}

/**
 * Subscription tier information
 */
export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  bonusTokens: number;
  tokenDiscount: number;
  discountMultiplier: number;
  chatLimit: number;
  exclusivePersonas: boolean;
  description: string;
}

/**
 * Formatted token package with calculated values
 */
export interface FormattedTokenPackage {
  id: string;
  name: string;
  baseTokens: number;
  bonusTokens: number;
  totalTokens: number;
  price: number;
  pricePerToken: number;
  description?: string;
}

/**
 * Payment data for token purchases
 */
export interface TokenPaymentData {
  success: boolean;
  transactionId: string;
  payment: {
    id: string;
    status: string;
  };
  amount: number;
  tokens: number;
  packageInfo: FormattedTokenPackage;
}

/**
 * Payment data for subscription purchases
 */
export interface SubscriptionPaymentData {
  success: boolean;
  transactionId: string;
  subscription: {
    id: string;
    tier: string;
    status: string;
    nextBillingDate: string;
  };
  amount: number;
  tierInfo: SubscriptionTier;
}

/**
 * Crypto payment intent information
 */
export interface CryptoPaymentIntent {
  id: string;
  status: string;
  amount: number;
  currency: string;
  checkout_url: string;
  address: string;
  qrcode_url: string;
}

/**
 * Transaction history item
 */
export interface TransactionHistoryItem {
  id: string;
  type: 'purchase' | 'used' | 'bonus' | 'subscription' | 'refund';
  amount: number;
  date: string;
  description?: string;
  relatedId?: string; // ID of related chat, persona, etc.
}
