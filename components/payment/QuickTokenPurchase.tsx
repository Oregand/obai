'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../ui/LoadingSpinner';
import CryptoPayment from './CryptoPayment';
import { TOKEN_PACKAGES } from '@/lib/services/token-service';

interface QuickTokenPurchaseProps {
  onClose: () => void;
  onSuccess?: (tokensAdded?: number) => void;
  simpleMode?: boolean; // If true, shows a simplified version with just the basic package
}

export default function QuickTokenPurchase({ 
  onClose,
  onSuccess,
  simpleMode = false
}: QuickTokenPurchaseProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number>(10);
  
  // Get the basic package for simple mode
  const basicPackage = TOKEN_PACKAGES.find(p => p.id === 'basic') || TOKEN_PACKAGES[0];
  
  // Pre-defined quick purchase options
  const purchaseOptions = [
    { amount: 5, tokens: 50, bonus: 0 },
    { amount: 10, tokens: 150, bonus: 15 },
    { amount: 25, tokens: 500, bonus: 100 }
  ];
  
  const handleFullPurchase = () => {
    router.push('/tokens/purchase');
    onClose();
  };
  
  const handleQuickPurchase = (amount: number) => {
    setSelectedAmount(amount);
    setShowPayment(true);
  };
  
  // Used for simple mode
  const handleBasicPackagePurchase = async () => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/tokens/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId: basicPackage.id
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate token purchase');
      }
      
      // Token purchase initiated, route to complete the purchase
      router.push('/tokens/purchase');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error initiating token purchase:', error);
      toast.error('Failed to initiate token purchase. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handlePaymentSuccess = async () => {
    setIsSubmitting(true);
    
    try {
      // Simulate adding tokens (in a real app, this would be handled by the payment processing)
      const option = purchaseOptions.find(opt => opt.amount === selectedAmount);
      if (option) {
        const totalTokens = option.tokens + option.bonus;
        
        if (onSuccess) {
          onSuccess(totalTokens);
        }
        
        toast.success(`Successfully added ${totalTokens} tokens!`);
        onClose();
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Failed to process payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    if (showPayment) {
      setShowPayment(false);
    } else {
      onClose();
    }
  };
  
  const getSelectedOption = () => {
    return purchaseOptions.find(opt => opt.amount === selectedAmount);
  };

  // Simple mode UI
  if (simpleMode) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-midnight-lighter rounded-lg shadow-lg w-full max-w-md overflow-hidden transform transition-all">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-medium text-white">Quick Token Purchase</h3>
              <button
                onClick={onClose}
                className="absolute top-2 right-2 text-white opacity-60 hover:text-primary transition-colors p-1 rounded-full hover:bg-secondary-light"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="mt-4">
              <div className="bg-secondary-dark p-4 rounded-md">
                <div className="flex justify-between">
                  <div>
                    <span className="text-white font-medium">{basicPackage.name}</span>
                    <p className="text-xs text-white opacity-70 mt-1">{basicPackage.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-primary">${basicPackage.price}</span>
                  </div>
                </div>
                
                <div className="mt-3 flex justify-between items-center">
                  <div>
                    <span className="text-white">Tokens:</span>
                    <span className="text-white font-medium ml-1">{basicPackage.tokens}</span>
                    {basicPackage.bonus > 0 && (
                      <span className="text-primary ml-1">+{basicPackage.bonus} bonus</span>
                    )}
                  </div>
                  <div>
                    <span className="text-white opacity-70 text-sm">Total:</span>
                    <span className="text-white ml-1">{basicPackage.tokens + (basicPackage.bonus || 0)} tokens</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
              <button
                type="button"
                onClick={handleFullPurchase}
                className="py-2 px-4 flex items-center justify-center bg-transparent border border-primary/30 rounded-md text-primary hover:bg-primary/10 transition-colors text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                View All Packages
              </button>
              
              <button
                type="button"
                onClick={handleBasicPackagePurchase}
                disabled={isSubmitting}
                className="py-2 px-4 bg-primary rounded-md text-white hover:bg-primary-light transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="small" />
                    <span className="ml-2">Processing...</span>
                  </>
                ) : (
                  <>Buy ${basicPackage.price} Package</>
                )}
              </button>
            </div>
            
            <div className="mt-4 text-center text-xs text-white opacity-60">
              Tokens are used for AI interactions. Purchase once, use anytime.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Advanced mode UI (original with multiple options)
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-midnight-lighter rounded-lg border border-primary/30 p-6 max-w-md w-full">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-primary">Buy Tokens</h3>
          <button 
            onClick={onClose}
            className="text-white/50 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        {!showPayment ? (
          <>
            <p className="text-white mb-6">
              Select a quick token package or go to the full purchase page for more options.
            </p>
            
            <div className="grid grid-cols-3 gap-3 mb-6">
              {purchaseOptions.map((option) => (
                <button
                  key={option.amount}
                  onClick={() => handleQuickPurchase(option.amount)}
                  className={`p-3 rounded-md border text-center ${
                    selectedAmount === option.amount 
                      ? 'border-primary bg-secondary-dark' 
                      : 'border-white/20 bg-secondary-dark/50 hover:border-primary/50'
                  }`}
                >
                  <div className="text-lg font-bold text-primary mb-1">${option.amount}</div>
                  <div className="text-sm text-white">{option.tokens} tokens</div>
                  {option.bonus > 0 && (
                    <div className="text-xs text-primary">+{option.bonus} bonus</div>
                  )}
                </button>
              ))}
            </div>
            
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => handleQuickPurchase(selectedAmount)}
                className="py-2 px-4 bg-primary text-white rounded-md hover:bg-primary-light transition-colors flex items-center justify-center"
              >
                Continue with ${selectedAmount}
              </button>
              
              <button
                onClick={handleFullPurchase}
                className="py-2 px-4 bg-secondary text-white rounded-md border border-primary/30 hover:bg-secondary-light transition-colors"
              >
                View All Purchase Options
              </button>
            </div>
          </>
        ) : (
          <div className="mb-6">
            <div className="bg-secondary-dark bg-opacity-50 p-4 rounded-md mb-6">
              <div className="flex justify-between items-center">
                <span className="text-white opacity-70">Price:</span>
                <span className="text-primary font-medium">${selectedAmount}</span>
              </div>
              
              {getSelectedOption() && (
                <>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-white opacity-70">Tokens:</span>
                    <span className="text-white">{getSelectedOption()?.tokens}</span>
                  </div>
                  
                  {getSelectedOption()?.bonus && getSelectedOption()?.bonus > 0 && (
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-white opacity-70">Bonus:</span>
                      <span className="text-primary">+{getSelectedOption()?.bonus}</span>
                    </div>
                  )}
                  
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-medium">Total tokens:</span>
                      <span className="text-white font-bold">
                        {(getSelectedOption()?.tokens || 0) + (getSelectedOption()?.bonus || 0)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <CryptoPayment 
              amount={selectedAmount} 
              onPaymentSuccess={handlePaymentSuccess}
              onCancel={handleCancel}
            />
          </div>
        )}
      </div>
    </div>
  );
}
