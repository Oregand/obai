'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '../ui/LoadingSpinner';

interface InsufficientTokensPromptProps {
  requiredTokens: number;
  onClose: () => void;
}

export default function InsufficientTokensPrompt({ 
  requiredTokens, 
  onClose 
}: InsufficientTokensPromptProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleBuyTokens = () => {
    setIsLoading(true);
    router.push('/tokens/purchase');
  };

  const handleAddWallet = () => {
    setIsLoading(true);
    router.push('/profile');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-midnight-lighter rounded-lg border border-primary/30 p-6 max-w-md w-full">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-primary">Insufficient Tokens</h3>
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
          <p className="text-white mb-4">
            You need at least <span className="text-primary font-bold">{requiredTokens} tokens</span> to continue this conversation.
          </p>
          <p className="text-white opacity-70 text-sm">
            Tokens are used for AI interactions, unlocking premium content, and tipping creators.
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleBuyTokens}
            disabled={isLoading}
            className="py-2 px-4 bg-primary text-white rounded-md hover:bg-primary-light transition-colors disabled:opacity-70 flex items-center justify-center"
          >
            {isLoading ? <LoadingSpinner size="small" /> : 'Buy Tokens'}
          </button>
          
          <button
            onClick={handleAddWallet}
            disabled={isLoading}
            className="py-2 px-4 bg-secondary text-white rounded-md border border-primary/30 hover:bg-secondary-light transition-colors disabled:opacity-70 flex items-center justify-center"
          >
            {isLoading ? <LoadingSpinner size="small" /> : 'Add Wallet'}
          </button>
        </div>
      </div>
    </div>
  );
}
