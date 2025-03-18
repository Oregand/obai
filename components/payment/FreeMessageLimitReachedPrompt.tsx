'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '../ui/LoadingSpinner';

interface FreeMessageLimitReachedPromptProps {
  requiredTokens: number;
  freeMessageLimit: number;
  onClose: () => void;
}

export default function FreeMessageLimitReachedPrompt({ 
  requiredTokens, 
  freeMessageLimit,
  onClose 
}: FreeMessageLimitReachedPromptProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleBuyTokens = () => {
    setIsLoading(true);
    router.push('/tokens/purchase');
  };

  const handleSubscribe = () => {
    setIsLoading(true);
    router.push('/subscriptions');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-midnight-lighter rounded-lg border border-primary/30 p-6 max-w-md w-full">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-primary">Free Messages Used</h3>
          <button 
            onClick={onClose}
            className="text-white/50 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div className="mb-6">
          <div className="p-4 bg-secondary-dark rounded-lg mb-4 text-center">
            <div className="text-lg text-white mb-2">
              You've used all <span className="text-primary font-bold">{freeMessageLimit} free messages</span>
            </div>
            <div className="flex items-center justify-center gap-1 text-white text-sm">
              {Array.from({ length: freeMessageLimit }).map((_, i) => (
                <div key={i} className="w-3 h-3 rounded-full bg-primary"></div>
              ))}
            </div>
          </div>
          
          <p className="text-white mb-4">
            To continue chatting with our AI personas, you'll need to either:
          </p>
          
          <ul className="text-white space-y-3 mb-6">
            <li className="flex items-start">
              <span className="flex-shrink-0 w-5 h-5 bg-primary flex items-center justify-center rounded-full mr-2 mt-0.5">1</span>
              <span>
                <strong>Buy tokens</strong> - Purchase tokens to pay for individual AI responses
                <div className="text-white/70 text-sm mt-1">
                  Next message costs approximately {requiredTokens} tokens
                </div>
              </span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-5 h-5 bg-primary flex items-center justify-center rounded-full mr-2 mt-0.5">2</span>
              <span>
                <strong>Subscribe</strong> - Get monthly token discounts, bonus tokens, and more chats
              </span>
            </li>
          </ul>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleBuyTokens}
            disabled={isLoading}
            className="py-2 px-4 bg-primary text-white rounded-md hover:bg-primary-light transition-colors disabled:opacity-70 flex items-center justify-center"
          >
            {isLoading ? <LoadingSpinner size="small" /> : 'Buy Tokens'}
          </button>
          
          <button
            onClick={handleSubscribe}
            disabled={isLoading}
            className="py-2 px-4 bg-secondary text-white rounded-md border border-primary/30 hover:bg-secondary-light transition-colors disabled:opacity-70 flex items-center justify-center"
          >
            {isLoading ? <LoadingSpinner size="small" /> : 'Subscribe'}
          </button>
        </div>
      </div>
    </div>
  );
}
