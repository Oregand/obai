export interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  bonus?: number;
  price: number;
  description: string;
  mostPopular?: boolean;
  savePercentage?: number;
}

export interface TokenTier {
  minTokens: number;
  maxTokens: number;
  pricePerToken: number;
  bonusPercentage: number;
}

export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  bonusTokens: number;
  tokenDiscount: number;
  discountMultiplier: number;
  chatLimit: number | typeof Infinity;
  exclusivePersonas: boolean;
  description: string;
}
