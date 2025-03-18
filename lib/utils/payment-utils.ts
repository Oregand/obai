/**
 * Shared utility functions for handling payments, tokens, and subscriptions
 */

import { TOKEN_PACKAGES, CUSTOM_TOKEN_TIERS, calculateCustomTokenPackage } from '@/lib/services/token-service';
import { FormattedTokenPackage } from '@/lib/types/payment';

/**
 * Calculate total tokens including any bonuses for a package
 * @param packageId The package ID to calculate for
 * @param customAmount For custom packages, the amount of tokens
 * @returns The total tokens including bonus
 */
export function calculateTotalTokens(packageId: string, customAmount: number = 0): number {
  if (packageId === 'custom' && customAmount > 0) {
    // For custom amount, calculate based on tier bonus
    const tier = CUSTOM_TOKEN_TIERS.find(
      t => customAmount >= t.minTokens && customAmount <= t.maxTokens
    ) || CUSTOM_TOKEN_TIERS[0];
    
    const bonusTokens = Math.floor(customAmount * (tier.bonusPercentage / 100));
    return customAmount + bonusTokens;
  } else {
    // For predefined packages, use the package info
    const pkg = TOKEN_PACKAGES.find(p => p.id === packageId);
    if (!pkg) return 0;
    
    return pkg.tokens + (pkg.bonus || 0);
  }
}

/**
 * Calculate the price for tokens
 * @param packageId The package ID to calculate for
 * @param customAmount For custom packages, the amount of tokens
 * @returns The price in USD
 */
export function calculateTokenPrice(packageId: string, customAmount: number = 0): number {
  if (packageId === 'custom' && customAmount > 0) {
    const customPackage = calculateCustomTokenPackage(customAmount);
    return customPackage.price;
  } else {
    const pkg = TOKEN_PACKAGES.find(p => p.id === packageId);
    return pkg ? pkg.price : 0;
  }
}

/**
 * Format a token object with all necessary info for display
 * @param packageId The package ID 
 * @param customAmount For custom packages, the amount of tokens
 * @returns A formatted token package object with all relevant info
 */
export function formatTokenPackage(packageId: string, customAmount: number = 0): FormattedTokenPackage {
  // For custom packages
  if (packageId === 'custom' && customAmount > 0) {
    const tier = CUSTOM_TOKEN_TIERS.find(
      t => customAmount >= t.minTokens && customAmount <= t.maxTokens
    ) || CUSTOM_TOKEN_TIERS[0];
    
    const bonusTokens = Math.floor(customAmount * (tier.bonusPercentage / 100));
    const totalTokens = customAmount + bonusTokens;
    const price = calculateTokenPrice('custom', customAmount);
    
    return {
      id: 'custom',
      name: 'Custom',
      baseTokens: customAmount,
      bonusTokens,
      totalTokens,
      price,
      pricePerToken: tier.pricePerToken,
      description: `${customAmount} tokens with ${tier.bonusPercentage}% bonus`
    };
  }
  
  // For predefined packages
  const pkg = TOKEN_PACKAGES.find(p => p.id === packageId);
  if (!pkg) {
    // Return a default empty package if not found
    return {
      id: 'unknown',
      name: 'Unknown',
      baseTokens: 0,
      bonusTokens: 0,
      totalTokens: 0,
      price: 0,
      pricePerToken: 0
    };
  }
  
  return {
    id: pkg.id,
    name: pkg.name,
    baseTokens: pkg.tokens,
    bonusTokens: pkg.bonus || 0,
    totalTokens: pkg.tokens + (pkg.bonus || 0),
    price: pkg.price,
    pricePerToken: pkg.tokens > 0 ? pkg.price / pkg.tokens : 0,
    description: pkg.description
  };
}

/**
 * Format a price for display
 * @param amount The amount to format
 * @param currency The currency code (default: USD)
 * @param includeSymbol Whether to include the currency symbol (default: true)
 * @returns Formatted price string
 */
export function formatPrice(amount: number, currency: string = 'USD', includeSymbol: boolean = true): string {
  return new Intl.NumberFormat('en-US', {
    style: includeSymbol ? 'currency' : 'decimal',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Format a token count for display
 * @param count The token count to format
 * @returns Formatted token count
 */
export function formatTokenCount(count: number): string {
  return new Intl.NumberFormat('en-US').format(count);
}
