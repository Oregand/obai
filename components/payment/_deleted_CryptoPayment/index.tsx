'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface CryptoPaymentProps {
  amount: number;
  currency?: string;
  paymentType: string;
  onSuccess?: (transactionId: string) => void;
  onCancel?: () => void;
  onError?: (error: string) => void;
}

interface PaymentIntent {
  id: string;
  status: string;
  amount: number;
  currency: string;
  checkout_url: string;
  address?: string;
  qrcode_url?: string;
}

interface CryptoCurrency {
  code: string;
  name: string;
  image: string;
}

const SUPPORTED_CRYPTO: CryptoCurrency[] = [
  { code: 'BTC', name: 'Bitcoin', image: 'https://cryptologos.cc/logos/bitcoin-btc-logo.svg?v=025' },
  { code: 'ETH', name: 'Ethereum', image: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=025' },
  { code: 'LTC', name: 'Litecoin', image: 'https://cryptologos.cc/logos/litecoin-ltc-logo.svg?v=025' },
  { code: 'DOGE', name: 'Dogecoin', image: 'https://cryptologos.cc/logos/dogecoin-doge-logo.svg?v=025' },
  { code: 'USDT', name: 'Tether USD', image: 'https://cryptologos.cc/logos/tether-usdt-logo.svg?v=025' }
];

const CryptoPayment: React.FC<CryptoPaymentProps> = ({
  amount,
  currency = 'USD',
  paymentType,
  onSuccess,
  onCancel,
  onError
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [isChecking, setIsChecking] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [checkInterval, setCheckInterval] = useState<NodeJS.Timeout | null>(null);

  // Create a payment intent when the component loads
  useEffect(() => {
    if (!selectedCrypto) return;
    
    createPaymentIntent();
    
    return () => {
      // Clean up any intervals when component unmounts
      if (checkInterval) {
        clearInterval(checkInterval);
      }
    };
  }, [selectedCrypto]);

  // Check payment status at regular intervals
  useEffect(() => {
    if (paymentIntent?.id && paymentIntent.status === 'pending') {
      const interval = setInterval(() => {
        checkPaymentStatus();
      }, 5000); // Check every 5 seconds
      
      setCheckInterval(interval);
      
      return () => {
        clearInterval(interval);
      };
    } else if (checkInterval && paymentIntent?.status !== 'pending') {
      clearInterval(checkInterval);
      setCheckInterval(null);
    }
  }, [paymentIntent]);

  // Create a payment intent
  const createPaymentIntent = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          paymentType,
          paymentMethod: 'crypto',
          coinType: selectedCrypto
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment');
      }
      
      setPaymentIntent(data.paymentIntent);
    } catch (error: any) {
      console.error('Error creating payment intent:', error);
      setError(error.message || 'Failed to initiate payment');
      
      if (onError) {
        onError(error.message || 'Failed to initiate payment');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Check payment status
  const checkPaymentStatus = async () => {
    if (!paymentIntent?.id) return;
    
    if (!isChecking) {
      setIsChecking(true);
      
      try {
        const response = await fetch('/api/payments', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id
          }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to check payment status');
        }
        
        setPaymentStatus(data.status);
        
        // Handle payment completion
        if (data.status === 'succeeded') {
          // Clear check interval
          if (checkInterval) {
            clearInterval(checkInterval);
            setCheckInterval(null);
          }
          
          // Update payment intent
          setPaymentIntent({
            ...paymentIntent,
            status: data.status
          });
          
          // Call success callback
          if (onSuccess) {
            onSuccess(paymentIntent.id);
          }
        }
      } catch (error: any) {
        console.error('Error checking payment status:', error);
      } finally {
        setIsChecking(false);
      }
    }
  };

  // Cancel payment
  const handleCancel = () => {
    if (checkInterval) {
      clearInterval(checkInterval);
      setCheckInterval(null);
    }
    
    if (onCancel) {
      onCancel();
    }
  };

  // Change selected cryptocurrency
  const handleChangeCrypto = (cryptoCode: string) => {
    if (cryptoCode !== selectedCrypto) {
      // Clear current payment intent
      setPaymentIntent(null);
      
      // Clear interval
      if (checkInterval) {
        clearInterval(checkInterval);
        setCheckInterval(null);
      }
      
      // Set new crypto
      setSelectedCrypto(cryptoCode);
    }
  };

  // If still loading
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-secondary-dark rounded-lg border border-primary/30">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-white">Initializing payment...</p>
      </div>
    );
  }

  // If there was an error
  if (error) {
    return (
      <div className="p-6 bg-secondary-dark rounded-lg border border-primary/30">
        <div className="bg-secondary-light border border-primary text-primary px-4 py-3 rounded mb-4">
          {error}
        </div>
        <div className="flex justify-between mt-4">
          <button
            onClick={createPaymentIntent}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-light transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary-dark transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // If payment is succeeded
  if (paymentIntent?.status === 'succeeded' || paymentStatus === 'succeeded') {
    return (
      <div className="p-6 bg-secondary-dark rounded-lg border border-green-500">
        <div className="flex flex-col items-center">
          <div className="bg-green-500 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mt-4 text-white">Payment Successful!</h3>
          <p className="text-white/70 mt-2">
            Your payment of {amount} {currency} has been successfully processed.
          </p>
          <p className="text-primary font-medium mt-1">
            Transaction ID: {paymentIntent?.id}
          </p>
          
          <button
            onClick={() => router.push('/tokens')}
            className="mt-6 px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-light transition-colors"
          >
            View Your Tokens
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-secondary-dark rounded-lg border border-primary/30">
      <h3 className="text-lg font-semibold text-primary mb-4">Pay with Cryptocurrency</h3>
      
      {/* Select cryptocurrency */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-white mb-2">
          Select Cryptocurrency
        </label>
        <div className="grid grid-cols-5 gap-2">
          {SUPPORTED_CRYPTO.map((crypto) => (
            <div
              key={crypto.code}
              className={`p-2 border rounded-md cursor-pointer ${
                selectedCrypto === crypto.code
                  ? 'border-primary bg-secondary-light'
                  : 'border-primary/30 hover:bg-secondary-light bg-opacity-50'
              }`}
              onClick={() => handleChangeCrypto(crypto.code)}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-8 h-8 mb-1 relative">
                  <Image
                    src={crypto.image}
                    alt={crypto.name}
                    width={32}
                    height={32}
                  />
                </div>
                <span className="text-xs font-medium text-white">{crypto.code}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {paymentIntent && (
        <div className="space-y-4">
          <div className="border border-primary/30 rounded-lg p-4">
            <div className="flex justify-between mb-2">
              <span className="text-white/70">Amount:</span>
              <span className="text-white font-semibold">{paymentIntent.amount} {paymentIntent.currency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Payment Method:</span>
              <span className="text-white font-semibold">{selectedCrypto}</span>
            </div>
          </div>
          
          {paymentIntent.address && (
            <div className="flex flex-col items-center">
              <p className="text-white mb-2">Send exact amount to this address:</p>
              <div className="bg-white p-3 rounded-lg mb-3">
                {paymentIntent.qrcode_url && (
                  <Image
                    src={paymentIntent.qrcode_url}
                    alt="QR Code for payment"
                    width={200}
                    height={200}
                    className="mx-auto"
                  />
                )}
              </div>
              <div className="bg-secondary-light p-2 rounded font-mono text-primary text-sm break-all max-w-full">
                {paymentIntent.address}
              </div>
              <p className="text-white/70 text-sm mt-4 text-center">
                The payment will be automatically confirmed once detected on the blockchain.
                This may take a few minutes.
              </p>
            </div>
          )}
          
          <div className="flex items-center justify-center pt-4">
            <div className="flex items-center">
              {isChecking ? (
                <LoadingSpinner size="small" />
              ) : (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              <span className="text-primary">Waiting for payment...</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-end mt-6">
        <button
          onClick={handleCancel}
          className="px-4 py-2 border border-primary/30 text-white rounded-md hover:bg-secondary-dark transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CryptoPayment;
