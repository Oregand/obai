import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Link from 'next/link';

interface TokenDisplayProps {
  variant?: 'compact' | 'standard' | 'large';
  showTooltip?: boolean;
  showBuyButton?: boolean;
  hideIfZero?: boolean;
  className?: string;
  refreshInterval?: number; // In milliseconds, if you want auto-refresh
  onBalanceChange?: (balance: number) => void;
}

const TokenDisplay: React.FC<TokenDisplayProps> = ({
  variant = 'standard',
  showTooltip = true,
  showBuyButton = true,
  hideIfZero = false,
  className = '',
  refreshInterval,
  onBalanceChange
}) => {
  const { data: session } = useSession();
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTokens = async () => {
    if (!session?.user) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/user/balance');
      
      if (!response.ok) {
        throw new Error('Failed to fetch tokens');
      }
      
      const data = await response.json();
      setBalance(data.balance);
      
      // Notify parent component if needed
      if (onBalanceChange && data.balance !== balance) {
        onBalanceChange(data.balance);
      }
    } catch (err) {
      setError('Error fetching tokens');
      console.error('Error fetching tokens:', err);
      // Set a default balance of 0 for display
      setBalance(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch tokens when component mounts or session changes
  useEffect(() => {
    fetchTokens();
  }, [session]);

  // Set up refresh interval if provided
  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      const intervalId = setInterval(fetchTokens, refreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [refreshInterval, session]);

  // If user is not authenticated
  if (!session?.user) {
    return null;
  }

  // Hide if balance is zero and hideIfZero is true
  if (hideIfZero && balance === 0) {
    return null;
  }

  if (isLoading) {
    return (
      <div className={`flex items-center px-3 py-1 text-sm text-white bg-secondary-light rounded-full ${className}`}>
        <LoadingSpinner size="small" />
      </div>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={`font-medium ${className}`}>
        <span className="text-primary font-bold">{balance !== null ? balance.toLocaleString() : '0'}</span>
      </div>
    );
  }

  // Large variant with more details
  if (variant === 'large') {
    return (
      <div className={`bg-midnight-lighter p-4 rounded-lg ${className}`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium text-white">Token Balance</h3>
          {showBuyButton && (
            <Link href="/tokens/purchase">
              <button className="px-3 py-1 text-xs font-medium text-white bg-primary hover:bg-primary-light rounded-md">
                Buy Tokens
              </button>
            </Link>
          )}
        </div>
        
        <div className="flex items-center">
          <span className="text-3xl font-bold text-primary">{balance !== null ? balance.toLocaleString() : '0'}</span>
          <span className="ml-2 text-white opacity-70">tokens</span>
        </div>
        
        <p className="text-xs text-white opacity-70 mt-2">
          Tokens are used for AI interactions, unlocking premium content, and tipping creators.
        </p>
      </div>
    );
  }

  // Default standard variant
  return (
    <div className={`relative group ${className}`}>
      <Link href="/tokens/purchase">
        <button className="flex items-center gap-1.5 px-3 py-1 text-sm font-medium text-white bg-secondary-light hover:bg-secondary dark:bg-secondary hover:bg-secondary-light rounded-full transition-colors">
          <span className="text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          </span>
          {balance !== null ? balance.toLocaleString() : '0'} tokens
        </button>
      </Link>
      
      {showTooltip && (
        <div className="absolute right-0 mt-2 w-64 p-4 bg-midnight-lighter dark:bg-midnight-DEFAULT rounded-lg shadow-lg border border-primary/30 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200">
          <h3 className="text-sm font-semibold text-white mb-2">OBAI Tokens</h3>
          <p className="text-xs text-white opacity-70 mb-3">
            Tokens are used for AI interactions. Buy in bulk for better value.
          </p>
          {showBuyButton && (
            <Link href="/tokens/purchase">
              <button className="w-full py-2 px-3 text-xs font-medium text-white bg-primary hover:bg-primary-light rounded-md">
                Buy Tokens
              </button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default TokenDisplay;
