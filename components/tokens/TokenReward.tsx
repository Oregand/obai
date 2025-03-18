import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../ui/LoadingSpinner';

interface TokenRewardProps {
  reason: 'daily_login' | 'first_purchase' | 'streak' | 'premium_bonus';
  amount: number;
  onClose: () => void;
}

const getRewardTitle = (reason: string): string => {
  switch (reason) {
    case 'daily_login':
      return 'Daily Login Bonus!';
    case 'first_purchase':
      return 'First Purchase Bonus!';
    case 'streak':
      return 'Login Streak Bonus!';
    case 'premium_bonus':
      return 'Premium Subscriber Bonus!';
    default:
      return 'Token Bonus!';
  }
};

const getRewardDescription = (reason: string, amount: number): string => {
  switch (reason) {
    case 'daily_login':
      return `Thanks for using OBAI today! We've added ${amount} tokens to your account.`;
    case 'first_purchase':
      return `Thanks for your first purchase! We've added ${amount} bonus tokens to your account.`;
    case 'streak':
      return `You've logged in for 5 days in a row! ${amount} bonus tokens have been added to your account.`;
    case 'premium_bonus':
      return `As a premium member, we've added ${amount} monthly bonus tokens to your account.`;
    default:
      return `${amount} tokens have been added to your account.`;
  }
};

const TokenReward: React.FC<TokenRewardProps> = ({ reason, amount, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentBalance, setCurrentBalance] = useState<number | null>(null);
  
  // Fetch current balance to display
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await fetch('/api/user/balance');
        
        if (!response.ok) {
          throw new Error('Failed to fetch balance');
        }
        
        const data = await response.json();
        setCurrentBalance(data.balance);
      } catch (error) {
        console.error('Error fetching balance:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-midnight-lighter border border-primary/30 rounded-lg shadow-xl w-full max-w-sm overflow-hidden transform transition-all animate-fadeIn">
        <div className="relative p-6">
          {/* Confetti or decoration elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/4 w-2 h-6 bg-primary transform rotate-45 opacity-70"></div>
            <div className="absolute top-10 left-1/3 w-2 h-12 bg-primary transform -rotate-12 opacity-50"></div>
            <div className="absolute top-5 right-1/4 w-3 h-8 bg-primary transform rotate-20 opacity-60"></div>
            <div className="absolute bottom-10 left-1/5 w-2 h-10 bg-primary transform rotate-45 opacity-40"></div>
            <div className="absolute bottom-20 right-1/3 w-2 h-6 bg-primary transform -rotate-30 opacity-50"></div>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/20 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </div>
            
            <h3 className="text-xl font-bold text-primary mb-2">
              {getRewardTitle(reason)}
            </h3>
            
            <p className="text-white mb-4">
              {getRewardDescription(reason, amount)}
            </p>
            
            <div className="bg-secondary-dark p-3 rounded-md mb-4">
              <div className="flex justify-between items-center">
                <span className="text-white opacity-70">New Balance:</span>
                {isLoading ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <span className="text-white font-bold">{currentBalance} tokens</span>
                )}
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary-light transition-colors"
            >
              Awesome, Thanks!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenReward;
