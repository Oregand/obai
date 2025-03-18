import prisma from '../../prisma';
import { TOKEN_PACKAGES } from '../token-service';
import { logger } from '../../logger';

/**
 * Processes auto top-ups for all eligible users
 * This should be called regularly, e.g. by a cron job
 */
export async function processAutoTopups() {
  try {
    logger.info('Starting auto top-up processing');

    // Find all active auto top-up settings
    const activeSettings = await prisma.autoTopupSettings.findMany({
      where: {
        enabled: true,
        // Ensure there's a payment method attached
        paymentMethodId: {
          not: null
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            credits: true,
          }
        }
      }
    });

    logger.info(`Found ${activeSettings.length} active auto top-up settings`);

    for (const setting of activeSettings) {
      await processUserTopup(setting);
    }

    logger.info('Auto top-up processing completed');
  } catch (error) {
    logger.error('Error in auto top-up processor:', error);
  }
}

/**
 * Process auto top-up for a single user
 */
async function processUserTopup(setting: any) {
  try {
    const { user, thresholdAmount, packageId, paymentMethodId } = setting;
    
    // Skip if user balance is above threshold
    if (user.credits >= thresholdAmount) {
      return;
    }

    logger.info(`Processing auto top-up for user ${user.id} (${user.email})`);
    logger.info(`Current balance: ${user.credits}, threshold: ${thresholdAmount}`);

    // Get the token package
    const tokenPackage = TOKEN_PACKAGES.find(p => p.id === packageId);
    if (!tokenPackage) {
      logger.error(`Invalid token package ID: ${packageId}`);
      return;
    }

    // Create a payment
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        amount: tokenPackage.price,
        type: 'auto_topup',
        status: 'pending',
        paymentMethodId: paymentMethodId as string,
        tokensAmount: tokenPackage.tokens,
        bonusTokens: tokenPackage.bonus
      }
    });

    logger.info(`Created payment ${payment.id} for auto top-up`);

    // Process the payment - in a real system, this would interact with a payment gateway
    // For this example, we'll simulate successful payment immediately
    const totalTokens = (tokenPackage.tokens || 0) + (tokenPackage.bonus || 0);

    // Update the payment to completed
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'completed',
        completedAt: new Date()
      }
    });

    // Add tokens to user's balance
    await prisma.user.update({
      where: { id: user.id },
      data: {
        credits: {
          increment: totalTokens
        }
      }
    });

    // Update the last top-up timestamp
    await prisma.autoTopupSettings.update({
      where: { id: setting.id },
      data: {
        lastTopupAt: new Date()
      }
    });

    logger.info(`Added ${totalTokens} tokens to user ${user.id}`);

    // In a real application, you would also:
    // 1. Send a notification to the user
    // 2. Create a receipt or invoice
    // 3. Record the transaction in detail
  } catch (error) {
    logger.error(`Error processing auto top-up for user ${setting.user.id}:`, error);
  }
}
