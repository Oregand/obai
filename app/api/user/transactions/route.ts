import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/user/transactions - Get user's transaction history
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get transactions from payments table
    const payments = await prisma.payment.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20 // Limit to 20 most recent transactions
    });

    // Get message transactions (token usage)
    const messageTransactions = await prisma.message.findMany({
      where: {
        userId: session.user.id,
        role: 'assistant',
        tokenCost: {
          gt: 0 // Only include messages that cost tokens
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        tokenCost: true,
        createdAt: true,
        chatId: true
      },
      take: 20
    });

    // Format payments into transaction history items
    const paymentTransactions = payments.map(payment => {
      let type = 'purchase';
      let amount = payment.tokensAmount || 0;
      
      if (payment.bonusTokens) {
        amount += payment.bonusTokens;
      }
      
      if (payment.type === 'token_purchase') {
        type = 'purchase';
      } else if (payment.type === 'subscription') {
        type = 'bonus';
      } else if (payment.type === 'message_unlock') {
        type = 'used';
        amount = -payment.amount; // Show as negative for token usage
      }
      
      return {
        id: payment.id,
        type,
        amount,
        date: payment.createdAt.toISOString(),
        description: getTransactionDescription(payment.type),
        relatedId: payment.id
      };
    });

    // Format message usage into transaction history items
    const messageUsageTransactions = messageTransactions.map(msg => {
      return {
        id: msg.id,
        type: 'used',
        amount: -msg.tokenCost, // Negative for token usage
        date: msg.createdAt.toISOString(),
        description: 'Used in Conversation',
        relatedId: msg.chatId
      };
    });

    // Combine and sort by date (most recent first)
    const allTransactions = [
      ...paymentTransactions,
      ...messageUsageTransactions
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Return the transactions
    return NextResponse.json({
      transactions: allTransactions.slice(0, 20) // Return only 20 most recent after sorting
    });
  } catch (error) {
    console.error('Error getting transaction history:', error);
    return NextResponse.json(
      { error: 'Failed to get transaction history' },
      { status: 500 }
    );
  }
}

// Helper function to get human-readable description based on transaction type
function getTransactionDescription(type: string): string {
  switch (type) {
    case 'token_purchase':
      return 'Token Purchase';
    case 'subscription':
      return 'Subscription Bonus';
    case 'message_unlock':
      return 'Message Unlock';
    case 'tip':
      return 'Tip';
    default:
      return 'Transaction';
  }
}