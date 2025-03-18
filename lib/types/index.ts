// Export types from other files
export * from './payment';

// Define core types for the application

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
    dominanceLevel: number;
    exclusivityMultiplier: number;
    // Add other persona properties as needed
  };
  // Add other properties as needed
}

export interface MessageInstance {
  id: string;
  content: string;
  role: 'user' | 'assistant';
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

export interface UserInstance {
  id: string;
  name?: string | null;
  email?: string | null;
  emailVerified?: Date | null;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
  subscriptionStatus?: string | null;
  subscriptionExpiry?: Date | null;
  credits: number;
}

// Add other types as needed
