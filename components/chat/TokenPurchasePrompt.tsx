import React from 'react';
import Link from 'next/link';

interface TokenPurchasePromptProps {
  onClose: () => void;
}

const TokenPurchasePrompt: React.FC<TokenPurchasePromptProps> = ({ onClose }) => {
  return (
    <div className="p-4 mb-4 border border-primary/40 bg-midnight-lighter rounded-md relative">
      <button 
        onClick={onClose}
        className="absolute top-2 right-2 text-white opacity-60 hover:text-primary transition-colors p-1 rounded-full hover:bg-secondary-light"
        aria-label="Close"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      
      <h3 className="text-lg font-medium text-primary mb-2">Out of Tokens</h3>
      <p className="text-white opacity-80 mb-4">
        You don't have enough tokens to continue this conversation. Purchase tokens to keep chatting.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/tokens/purchase" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
          Purchase Tokens
        </Link>
        <Link href="/subscriptions" className="inline-flex justify-center py-2 px-4 border border-primary text-sm font-medium rounded-md text-primary hover:bg-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
          Subscribe for Monthly Tokens
        </Link>
      </div>
      
      <div className="mt-4 text-xs text-white opacity-60">
        <p>Need more information? Visit our <Link href="/help/tokens" className="text-primary hover:underline">token system guide</Link>.</p>
      </div>
    </div>
  );
};

export default TokenPurchasePrompt;
