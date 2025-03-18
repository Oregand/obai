// Type definitions for database models and related objects

import { Prisma } from '@prisma/client';

// Extend chat instance for AI service
export interface ChatInstance {
  id: string;
  title: string;
  userId: string;
  personaId: string;
  createdAt: Date;
  updatedAt: Date;
  persona: {
    id: string;
    name: string;
    description: string;
    systemPrompt: string;
    imageUrl?: string | null;
    isPublic: boolean;
    createdBy?: string | null;
    tipEnabled: boolean;
    tipSuggestions: number[];
    lockMessageChance: number;
    lockMessagePrice: number;
    tokenRatePerMessage: number;
    tokenRatePerMinute: number;
    isPremium: boolean;
    dominanceLevel: number;
    exclusivityMultiplier: number;
  }
}

// Message types
export type MessageRole = 'user' | 'assistant' | 'system';

export interface MessageInstance {
  id: string;
  content: string;
  role: MessageRole;
  chatId: string;
  userId: string;
  createdAt: Date;
  isLocked: boolean;
  isFreeMessage: boolean;
  unlockPrice?: number | null;
  tokenCost: number;
  duration?: number | null;
  tipped: boolean;
  tipAmount?: number | null;
}

// Subscription and payment types
export type SubscriptionStatus = 'free' | 'basic' | 'premium' | 'vip';
export type SubscriptionTier = 'basic' | 'premium' | 'vip';
export type PaymentType = 'token_purchase' | 'subscription' | 'tip';
export type PaymentStatus = 'pending' | 'completed' | 'failed';
export type PaymentMethod = 'crypto' | 'paypal' | 'credit_card';

// Token package
export interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  price: number;
  description: string;
}

// Chat limit result returned by TokenService
export interface ChatLimitResult {
  canCreate: boolean;
  currentCount: number;
  limit: number;
  subscriptionTier: string;
}
