import { TokenPackage, TokenTier, SubscriptionTier } from '../types/payment';
import { prisma } from '../prisma';

/**
 * Service for handling token-related operations
 */
class TokenServiceImpl {
  /**
   * Check if a user has free messages available
   * @param userId The user ID to check
   * @returns Information about free message availability
   */
  async checkFreeMessageAvailability(userId: string) {
    try {
      // Count the number of free messages used
      const freeMessagesUsed = await prisma.message.count({
        where: {
          userId,
          isFreeMessage: true,
        },
      });
      
      const freeMessageLimit = FREE_MESSAGE_LIMIT;
      const freeMessagesRemaining = Math.max(0, freeMessageLimit - freeMessagesUsed);
      
      return {
        hasFreeMessages: freeMessagesRemaining > 0,
        freeMessagesUsed,
        freeMessagesRemaining,
        freeMessageLimit
      };
    } catch (error) {
      console.error('Error checking free message availability:', error);
      // Default fallback if there's an error
      return {
        hasFreeMessages: true,
        freeMessagesUsed: 0,
        freeMessagesRemaining: 10,
        freeMessageLimit: 10
      };
    }
  }

  /**
   * Calculate the token cost for a message based on persona dominance and user subscription
   * @param dominanceLevel The dominance level of the persona
   * @param subscriptionStatus The subscription status of the user
   * @returns The calculated token cost
   */
  calculateMessageTokenCost(dominanceLevel: number, subscriptionStatus: string): number {
    // Base cost depends on dominance level (higher dominance = higher cost)
    const baseCost = 10 + (dominanceLevel * 2);
    
    // Apply discount based on subscription status
    const discountFactor = subscriptionStatus === 'vip' ? 0.3 :
                          subscriptionStatus === 'premium' ? 0.5 : 
                          subscriptionStatus === 'basic' ? 0.8 : 1.0;
    
    return Math.round(baseCost * discountFactor);
  }

  /**
   * Deduct tokens for a message or use free message if available
   * @param userId The user ID
   * @param chatId The chat ID
   * @param personaId The persona ID
   * @param messageContent The message content
   * @returns Info about the deduction
   */
  async deductTokensForMessage(userId: string, chatId: string, personaId: string, messageContent: string) {
    try {
      // Get the persona's dominance level
      const persona = await prisma.persona.findUnique({
        where: { id: personaId },
        select: { dominanceLevel: true }
      });
      
      // Get the user's subscription status
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { subscriptionStatus: true, credits: true }
      });
      
      if (!persona || !user) {
        throw new Error('Persona or user not found');
      }
      
      // Calculate token cost based on persona dominance and user subscription
      const tokenCost = this.calculateMessageTokenCost(
        persona.dominanceLevel, 
        user.subscriptionStatus || 'free'
      );
      
      // Check if user has free messages
      const freeMessageStatus = await this.checkFreeMessageAvailability(userId);
      
      // Create the AI message first
      const message = {
        id: `msg_${Date.now()}`,
        content: messageContent,
        role: "assistant",
        chatId,
        userId,
        tokenCost,
        createdAt: new Date().toISOString(),
      };
      
      // If user has free messages, use those first
      if (freeMessageStatus.hasFreeMessages) {
        return {
          message,
          tokenCost: 0, // Free message
          remainingTokens: user.credits, // Current balance remains unchanged
          usingFreeMessage: true,
          freeMessagesRemaining: freeMessageStatus.freeMessagesRemaining - 1,
          freeMessagesUsed: freeMessageStatus.freeMessagesUsed + 1,
          freeMessageLimit: freeMessageStatus.freeMessageLimit
        };
      }
      
      // Otherwise deduct tokens
      const newBalance = Math.max(0, user.credits - tokenCost);
      
      // Update user's token balance
      await prisma.user.update({
        where: { id: userId },
        data: { credits: newBalance }
      });
      
      return {
        message,
        tokenCost,
        remainingTokens: newBalance,
        usingFreeMessage: false,
        freeMessagesRemaining: 0,
        freeMessagesUsed: freeMessageStatus.freeMessagesUsed,
        freeMessageLimit: freeMessageStatus.freeMessageLimit
      };
    } catch (error) {
      console.error('Error deducting tokens:', error);
      throw error;
    }
  }

  /**
   * Check if a user can create a new chat based on their subscription
   * @param userId The user ID
   * @returns Information about the user's ability to create a chat
   */
  async canUserCreateChat(userId: string) {
    try {
      // Get user subscription status
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { subscriptionStatus: true }
      });
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Get subscription tier limits
      const tierLimit = user.subscriptionStatus === 'vip' ? Infinity :
                      user.subscriptionStatus === 'premium' ? 20 :
                      user.subscriptionStatus === 'basic' ? 5 : 3; // Free users get 3 chats
      
      // Count user's current chats
      const chatCount = await prisma.chat.count({
        where: { userId }
      });
      
      return {
        canCreate: chatCount < tierLimit,
        currentCount: chatCount,
        limit: tierLimit === Infinity ? 'unlimited' : tierLimit,
        subscriptionTier: user.subscriptionStatus || 'free'
      };
    } catch (error) {
      console.error('Error checking if user can create chat:', error);
      // Default to allowing chat creation in case of error
      return {
        canCreate: true,
        currentCount: 0,
        limit: 'unlimited',
        subscriptionTier: 'free'
      };
    }
  }

  /**
   * Get user's token balance
   * @param userId The user ID
   * @returns The user's token balance
   */
  async getUserBalance(userId: string): Promise<{ balance: number }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { credits: true }
      });
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return { balance: Math.round(user.credits) };
    } catch (error) {
      console.error('Error getting user balance:', error);
      return { balance: 0 };
    }
  }

  /**
   * Get user's subscription information
   * @param userId The user ID
   * @returns The user's subscription details
   */
  async getUserSubscription(userId: string) {
    try {
      // Check for active subscription in the subscription table
      const subscription = await prisma.subscription.findFirst({
        where: {
          userId,
          status: 'active',
          endDate: { gt: new Date() }  // subscription hasn't expired
        },
        orderBy: {
          startDate: 'desc'  // get the most recent subscription
        }
      });
      
      // If no subscription found in the subscription table, check user's status
      if (!subscription) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { 
            subscriptionStatus: true,
            subscriptionExpiry: true
          }
        });
        
        if (!user) {
          throw new Error('User not found');
        }
        
        // Get features based on tier
        const features = this.getSubscriptionFeatures(user.subscriptionStatus || 'free');
        
        return {
          tier: user.subscriptionStatus || 'free',
          status: user.subscriptionExpiry && user.subscriptionExpiry > new Date() ? 'active' : 'inactive',
          expiresAt: user.subscriptionExpiry?.toISOString() || null,
          features
        };
      }
      
      // Get features based on tier
      const features = this.getSubscriptionFeatures(subscription.tier);
      
      // Return subscription info
      return {
        tier: subscription.tier,
        status: subscription.status,
        expiresAt: subscription.endDate.toISOString(),
        features
      };
    } catch (error) {
      console.error('Error getting user subscription:', error);
      return {
        tier: 'free',
        status: 'inactive',
        expiresAt: null,
        features: this.getSubscriptionFeatures('free')
      };
    }
  }

  /**
   * Get features for a subscription tier
   * @param tier The subscription tier
   * @returns Array of feature strings
   */
  private getSubscriptionFeatures(tier: string): string[] {
    switch (tier) {
      case 'vip':
        return [
          'Unlimited chats',
          'Access to all personas',
          '70% discount on token usage',
          '5,000 bonus tokens monthly',
          'Priority support',
          'Early access to new features'
        ];
      case 'premium':
        return [
          'Up to 20 chats',
          'Access to premium personas',
          '50% discount on token usage',
          '1,000 bonus tokens monthly',
          'Priority support'
        ];
      case 'basic':
        return [
          'Up to 5 chats',
          'Access to basic personas',
          '20% discount on token usage',
          '300 bonus tokens monthly'
        ];
      case 'free':
      default:
        return [
          'Up to 3 chats',
          'Access to basic personas',
          '10 free messages'
        ];
    }
  }

  /**
   * Process a token purchase
   * @param userId The user ID
   * @param packageId The token package ID or 'custom'
   * @param customTokenAmount The custom token amount if packageId is 'custom'
   * @param paymentMethodId Optional payment method ID
   * @returns The purchase details
   */
  async purchaseTokens(
    userId: string, 
    packageId: string, 
    customTokenAmount: number = 0, 
    paymentMethodId: string | null = null
  ): Promise<{ 
    success: boolean, 
    transactionId: string, 
    amount: number, 
    tokens: number, 
    paymentUrl?: string 
  }> {
    try {
      // Find the token package
      let tokenAmount = 0;
      let price = 0;
      let bonusTokens = 0;

      if (packageId === 'custom') {
        // For custom packages, calculate price based on amount
        const customPackage = calculateCustomTokenPackage(customTokenAmount);
        tokenAmount = customTokenAmount;
        price = customPackage.price;
        
        // Calculate bonus tokens based on tiers
        for (const tier of CUSTOM_TOKEN_TIERS) {
          if (tokenAmount >= tier.minTokens && tokenAmount <= tier.maxTokens) {
            bonusTokens = Math.floor(tokenAmount * (tier.bonusPercentage / 100));
            break;
          }
        }
      } else {
        // For predefined packages, look up the package
        const tokenPackage = TOKEN_PACKAGES.find(pkg => pkg.id === packageId);
        if (!tokenPackage) {
          throw new Error('Invalid package ID');
        }
        tokenAmount = tokenPackage.tokens;
        bonusTokens = tokenPackage.bonus;
        price = tokenPackage.price;
      }

      // Generate a transaction ID
      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      
      // Use a transaction to ensure data consistency
      await prisma.$transaction(async (tx) => {
        // Create a payment record
        await tx.payment.create({
          data: {
            userId,
            amount: price,
            currency: 'USD',
            type: 'token_purchase',
            status: 'completed', // For now, we'll assume payment is immediately completed
            paymentMethod: paymentMethodId ? 'crypto' : 'system',
            paymentMethodId,
            paymentIntent: transactionId,
            tokensAmount: tokenAmount,
            bonusTokens,
            createdAt: new Date(),
            completedAt: new Date()
          }
        });
        
        // Credit the tokens to the user's account
        await tx.user.update({
          where: { id: userId },
          data: {
            credits: {
              increment: tokenAmount + bonusTokens
            }
          }
        });
      });

      return {
        success: true,
        transactionId,
        amount: price,
        tokens: tokenAmount + bonusTokens
      };
    } catch (error) {
      console.error('Error purchasing tokens:', error);
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.message === 'Invalid package ID') {
          throw new Error('The selected token package is invalid. Please choose a different package.');
        } else if (error.message.includes('prisma')) {
          throw new Error('Database error occurred. Please try again later or contact support.');
        } else if (error.message.includes('network')) {
          throw new Error('Network error occurred. Please check your connection and try again.');
        }
      }
      
      // Generic error
      throw new Error('Failed to complete token purchase. Please try again later.');
    }
  }

  /**
   * Create a subscription for a user
   * @param userId The user ID
   * @param tierId The subscription tier ID
   * @param paymentMethodId Optional payment method ID
   * @returns The subscription details
   */
  async createSubscription(
    userId: string,
    tierId: string,
    paymentMethodId: string | null = null
  ): Promise<{
    success: boolean,
    subscriptionId: string,
    tier: string,
    price: number,
    nextBillingDate: string,
    paymentUrl?: string
  }> {
    try {
      // Find the subscription tier
      const tier = SUBSCRIPTION_TIERS.find(t => t.id === tierId);
      if (!tier) {
        throw new Error('Invalid tier ID');
      }

      // Calculate next billing date (30 days from now)
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      // Generate a subscription ID
      const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      
      // Use a transaction to ensure data consistency
      const subscription = await prisma.$transaction(async (tx) => {
        // Create a payment record for the first payment
        const payment = await tx.payment.create({
          data: {
            userId,
            amount: tier.price,
            currency: 'USD',
            type: 'subscription',
            status: 'completed',
            paymentMethod: paymentMethodId ? 'crypto' : 'system',
            paymentMethodId,
            paymentIntent: `payment_${subscriptionId}_initial`,
            createdAt: new Date(),
            completedAt: new Date()
          }
        });
        
        // Create the subscription record
        const subscription = await tx.subscription.create({
          data: {
            userId,
            paymentId: payment.id,
            tier: tier.id,
            price: tier.price,
            status: 'active',
            startDate,
            endDate,
            autoRenew: true,
            bonusTokens: tier.bonusTokens,
            exclusivePersonas: tier.exclusivePersonas,
            discountMultiplier: tier.discountMultiplier
          }
        });
        
        // Update user's subscription status
        await tx.user.update({
          where: { id: userId },
          data: {
            subscriptionStatus: tier.id,
            subscriptionExpiry: endDate,
            // Add bonus tokens to user's account
            credits: {
              increment: tier.bonusTokens
            }
          }
        });
        
        return subscription;
      });

      return {
        success: true,
        subscriptionId: subscription.id,
        tier: tier.id,
        price: tier.price,
        nextBillingDate: endDate.toISOString()
      };
    } catch (error) {
      console.error('Error creating subscription:', error);
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.message === 'Invalid tier ID') {
          throw new Error('The selected subscription tier is invalid. Please choose a different tier.');
        } else if (error.message.includes('prisma')) {
          throw new Error('Database error occurred. Please try again later or contact support.');
        } else if (error.message.includes('network')) {
          throw new Error('Network error occurred. Please check your connection and try again.');
        }
      }
      
      // Generic error
      throw new Error('Failed to create subscription. Please try again later.');
    }
  }
}

// Export as a singleton
export const TokenService = new TokenServiceImpl();

// Export constants needed by other parts of the application
export const FREE_MESSAGE_LIMIT = 10;

export const TOKEN_PACKAGES: TokenPackage[] = [
  { id: 'basic', name: 'Basic', tokens: 100, bonus: 0, price: 4.99, description: 'Good for occasional chats' },
  { id: 'standard', name: 'Standard', tokens: 300, bonus: 30, price: 9.99, description: 'Popular choice for regular users', mostPopular: true },
  { id: 'premium', name: 'Premium', tokens: 1000, bonus: 200, price: 19.99, description: 'Best value for power users' },
];

export const CUSTOM_TOKEN_TIERS: TokenTier[] = [
  { minTokens: 1, maxTokens: 99, pricePerToken: 0.05, bonusPercentage: 0 },
  { minTokens: 100, maxTokens: 499, pricePerToken: 0.045, bonusPercentage: 5 },
  { minTokens: 500, maxTokens: 999, pricePerToken: 0.04, bonusPercentage: 10 },
  { minTokens: 1000, maxTokens: 2499, pricePerToken: 0.035, bonusPercentage: 20 },
  { minTokens: 2500, maxTokens: 10000, pricePerToken: 0.03, bonusPercentage: 40 },
];

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  { 
    id: 'basic', 
    name: 'Basic', 
    price: 9.99, 
    bonusTokens: 300,
    tokenDiscount: 0.2,
    discountMultiplier: 0.9,
    chatLimit: 5,
    exclusivePersonas: false,
    description: 'Perfect for casual users'
  },
  { 
    id: 'premium', 
    name: 'Premium', 
    price: 19.99, 
    bonusTokens: 1000,
    tokenDiscount: 0.5,
    discountMultiplier: 0.75,
    chatLimit: 20,
    exclusivePersonas: true,
    description: 'Ideal for regular users'
  },
  { 
    id: 'vip', 
    name: 'VIP', 
    price: 49.99, 
    bonusTokens: 5000,
    tokenDiscount: 0.7,
    discountMultiplier: 0.6,
    chatLimit: Infinity,
    exclusivePersonas: true,
    description: 'Unlimited access for power users'
  }
];

export function calculateCustomTokenPackage(tokenAmount: number): { tokens: number; price: number } {
  const baseRate = 0.05; // 5 cents per token
  const discountRate = 0.001; // 0.1% discount per token
  
  // Calculate discount based on volume (max 30%)
  const discount = Math.min(tokenAmount * discountRate, 0.3);
  const adjustedRate = baseRate * (1 - discount);
  
  // Calculate final price with volume discount
  const price = tokenAmount * adjustedRate;
  
  return {
    tokens: tokenAmount,
    price: Math.round(price * 100) / 100, // Round to 2 decimal places
  };
}

// Default export for convenience
export default TokenService;
