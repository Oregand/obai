'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  date: string;
  description?: string;
  relatedId?: string;
}

export default function TokensPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentBalance, setCurrentBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch user's current token balance and transaction history
  useEffect(() => {
    if (status === 'authenticated') {
      // Fetch balance
      fetch('/api/user/balance')
        .then(res => res.json())
        .then(data => {
          // Fix: Access the nested balance property
          setCurrentBalance(data.balance.balance);
        })
        .catch(error => {
          console.error('Error fetching balance:', error);
          setError('Failed to load balance data');
        });
      
      // Fetch transaction history from our new API endpoint
      fetch('/api/user/transactions')
        .then(res => res.json())
        .then(data => {
          if (data.transactions) {
            setTransactions(data.transactions);
          } else {
            setTransactions([]);
          }
        })
        .catch(error => {
          console.error('Error fetching transactions:', error);
          setError('Failed to load transaction history');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [status]);
  
  // If not authenticated, redirect to login
  if (status === 'unauthenticated') {
    router.push('/login?callbackUrl=/tokens');
    return null;
  }
  
  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-midnight-DEFAULT py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Breadcrumbs 
            items={[
              { label: 'Tokens' }
            ]}
          />
          <Link href="/chat">
            <button className="flex items-center text-white opacity-70 hover:opacity-100 hover:text-primary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Chat
            </button>
          </Link>
        </div>
        
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-primary neon-text mb-2">
            Your Tokens
          </h1>
          <p className="text-white opacity-70 max-w-2xl mx-auto">
            Tokens are used for AI interactions, unlocking premium content, and tipping creators.
          </p>
        </div>
        
        {/* Token Balance Card */}
        <div className="bg-midnight-lighter rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h2 className="text-lg font-medium text-white">Current Balance</h2>
              <div className="mt-2 flex items-baseline">
                <span className="text-4xl font-bold text-primary">{currentBalance}</span>
                <span className="ml-2 text-white opacity-70">tokens</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/tokens/purchase">
                <button className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-light transition-colors">
                  Purchase Tokens
                </button>
              </Link>
              <Link href="/subscriptions">
                <button className="px-6 py-3 border border-primary/50 text-white rounded-md hover:bg-secondary/20 transition-colors">
                  View Subscription Plans
                </button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Transaction History */}
        <div className="bg-midnight-lighter rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-medium text-white mb-4">Transaction History</h2>
          
          {error && (
            <div className="text-center py-4 text-primary">
              {error}
            </div>
          )}
          
          {!error && transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-secondary-dark/50">
                    <th className="px-4 py-3 text-left text-sm text-white opacity-70">Date</th>
                    <th className="px-4 py-3 text-left text-sm text-white opacity-70">Transaction</th>
                    <th className="px-4 py-3 text-right text-sm text-white opacity-70">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(transaction => (
                    <tr key={transaction.id} className="border-b border-secondary-dark/30 hover:bg-secondary-dark/10">
                      <td className="px-4 py-3 text-sm text-white">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-white">
                        {transaction.description || 
                          (transaction.type === 'purchase' && 'Token Purchase') ||
                          (transaction.type === 'used' && 'Used in Conversation') ||
                          (transaction.type === 'bonus' && 'Subscription Bonus')
                        }
                      </td>
                      <td className={`px-4 py-3 text-sm text-right ${
                        transaction.amount > 0 ? 'text-green-400' : 'text-primary'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-6 text-white opacity-70">
              {!error && 'No transactions yet. Purchase tokens to get started!'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
