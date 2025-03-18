import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface CryptoPaymentProps {
  amount: number;
  onPaymentSuccess?: () => void;
  onCancel?: () => void;
}

interface CryptoCoin {
  code: string;
  name: string;
  image: string;
}

interface PaymentResponse {
  success: boolean;
  paymentIntent: {
    id: string;
    status: string;
    amount: number;
    currency: string;
    checkout_url: string;
    address: string;
    qrcode_url: string;
  };
}

const CryptoPayment: React.FC<CryptoPaymentProps> = ({ 
  amount, 
  onPaymentSuccess, 
  onCancel 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supportedCoins, setSupportedCoins] = useState<CryptoCoin[]>([]);
  const [selectedCoin, setSelectedCoin] = useState<string>('BTC');
  const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>('pending');
  const [statusCheckInterval, setStatusCheckInterval] = useState<NodeJS.Timeout | null>(null);
  
  const router = useRouter();

  // Fetch supported coins
  useEffect(() => {
    const fetchSupportedCoins = async () => {
      try {
        // In a real implementation, fetch this from your backend
        // For now, we'll use a hardcoded list of common coins
        const defaultCoins: CryptoCoin[] = [
          { code: 'BTC', name: 'Bitcoin', image: 'https://cryptologos.cc/logos/bitcoin-btc-logo.svg?v=025' },
          { code: 'ETH', name: 'Ethereum', image: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=025' },
          { code: 'LTC', name: 'Litecoin', image: 'https://cryptologos.cc/logos/litecoin-ltc-logo.svg?v=025' },
          { code: 'DOGE', name: 'Dogecoin', image: 'https://cryptologos.cc/logos/dogecoin-doge-logo.svg?v=025' },
          { code: 'USDT', name: 'Tether USD', image: 'https://cryptologos.cc/logos/tether-usdt-logo.svg?v=025' }
        ];
        
        setSupportedCoins(defaultCoins);
      } catch (err) {
        console.error('Error fetching supported coins:', err);
        setError('Failed to load supported cryptocurrencies.');
      }
    };
    
    fetchSupportedCoins();
  }, []);
  
  // Check payment status periodically
  useEffect(() => {
    if (paymentData?.paymentIntent?.id && paymentStatus !== 'succeeded') {
      const interval = setInterval(async () => {
        try {
          const response = await fetch('/api/payments', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentIntentId: paymentData.paymentIntent.id
            })
          });
          
          const data = await response.json();
          
          if (data.success) {
            setPaymentStatus(data.status);
            
            if (data.status === 'succeeded') {
              clearInterval(interval);
              onPaymentSuccess?.();
            }
          }
        } catch (err) {
          console.error('Error checking payment status:', err);
        }
      }, 10000); // Check every 10 seconds
      
      setStatusCheckInterval(interval);
    }
    
    // Cleanup interval on unmount
    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    };
  }, [paymentData, paymentStatus, onPaymentSuccess]);
  
  const handleCreatePayment = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          currency: 'USD',
          paymentType: 'credit_purchase',
          paymentMethod: 'crypto',
          coinType: selectedCoin
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment');
      }
      
      setPaymentData(data);
    } catch (err: any) {
      console.error('Error creating payment:', err);
      setError(err.message || 'Failed to create payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCancel = () => {
    if (statusCheckInterval) {
      clearInterval(statusCheckInterval);
    }
    setPaymentData(null);
    onCancel?.();
  };
  
  const openCheckoutUrl = () => {
    if (paymentData?.paymentIntent?.checkout_url) {
      window.open(paymentData.paymentIntent.checkout_url, '_blank');
    }
  };
  
  // Render coin selection UI when no payment is created yet
  if (!paymentData) {
    return (
      <div className="p-4 border border-primary/30 rounded-lg shadow-sm bg-midnight-lighter">
        <h3 className="text-lg font-medium text-white mb-4">Pay with Cryptocurrency</h3>
        
        {error && (
          <div className="p-3 my-2 bg-primary/20 text-primary rounded-md">
            {error}
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-white mb-1">
            Select Cryptocurrency
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {supportedCoins.map((coin) => (
              <div
                key={coin.code}
                className={`p-2 border rounded-md cursor-pointer hover:bg-secondary-light transition duration-200 ${
                  selectedCoin === coin.code ? 'border-primary bg-secondary-light' : ''
                }`}
                onClick={() => setSelectedCoin(coin.code)}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="w-8 h-8 mb-1 relative">
                    <Image
                      src={coin.image}
                      alt={coin.name}
                      width={32}
                      height={32}
                    />
                  </div>
                  <span className="text-xs font-medium">{coin.code}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-sm font-medium text-white">
            Amount: <span className="font-bold text-primary">${amount ? amount.toFixed(2) : '0.00'} USD</span>
          </p>
          <p className="text-xs text-white/70 mt-1">
            You will receive {amount ? amount : 0} credits. The exact crypto amount will be calculated at current exchange rates.
          </p>
        </div>
        
        <div className="flex justify-between space-x-2">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-primary/30 rounded-md hover:bg-secondary-light text-white flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back
          </button>
          <button
            type="button"
            onClick={handleCreatePayment}
            disabled={isLoading}
            className={`px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-light ${
              isLoading ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Processing...' : 'Proceed to Payment'}
          </button>
        </div>
      </div>
    );
  }
  
  // Render payment instructions when payment is created
  return (
    <div className="p-4 border border-primary/30 rounded-lg shadow-sm bg-midnight-lighter">
      <h3 className="text-lg font-medium text-white mb-4">Complete Your Crypto Payment</h3>
      
      {paymentStatus === 'pending' && (
        <div className="flex flex-col items-center p-4 border border-primary/50 bg-secondary-light bg-opacity-30 rounded-md mb-4">
          <p className="text-primary text-sm mb-2">
            Waiting for payment. Please complete your transaction.
          </p>
          <div className="h-1 w-full bg-midnight-DEFAULT rounded-full">
            <div className="h-1 bg-primary rounded-full animate-pulse" style={{ width: '50%' }}></div>
          </div>
        </div>
      )}
      
      {paymentStatus === 'processing' && (
        <div className="flex flex-col items-center p-4 border border-primary/50 bg-secondary-light bg-opacity-30 rounded-md mb-4">
          <p className="text-primary text-sm mb-2">
            Payment received! Waiting for blockchain confirmation.
          </p>
          <div className="h-1 w-full bg-midnight-DEFAULT rounded-full">
            <div className="h-1 bg-primary rounded-full animate-pulse" style={{ width: '75%' }}></div>
          </div>
        </div>
      )}
      
      {paymentStatus === 'succeeded' && (
        <div className="flex flex-col items-center p-4 border border-primary/50 bg-secondary-light bg-opacity-30 rounded-md mb-4">
          <p className="text-primary text-sm mb-2">
            Payment successful! Your credits have been added.
          </p>
          <div className="h-1 w-full bg-midnight-DEFAULT rounded-full">
            <div className="h-1 bg-primary rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1">
          <div className="mb-4">
            <label className="block text-sm font-medium text-white mb-1">Send {selectedCoin} to this address:</label>
            <div className="p-3 bg-midnight-DEFAULT border border-primary/30 rounded-md overflow-x-auto font-mono text-sm break-all text-white">
              {paymentData?.paymentIntent?.address || 'Address unavailable'}
            </div>
          </div>
          
          <div className="mb-4">
            <p className="text-sm font-medium text-white mb-1">Transaction Details:</p>
            <ul className="text-sm space-y-1 text-white/70">
              <li>Amount: ${paymentData?.paymentIntent?.amount || 0} USD</li>
              <li>Status: {paymentStatus || 'pending'}</li>
              <li>Payment ID: {paymentData?.paymentIntent?.id || 'N/A'}</li>
            </ul>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center">
          {paymentData?.paymentIntent?.qrcode_url && (
            <div className="mb-2">
              <p className="text-sm text-center text-white mb-2">Scan QR Code with your wallet app</p>
              <div className="w-48 h-48 relative mx-auto border border-primary/30 p-2 rounded-md bg-white">
                <Image
                  src={paymentData?.paymentIntent?.qrcode_url || ''}
                  alt="Payment QR Code"
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
            </div>
          )}
          
          <button
            type="button"
            onClick={openCheckoutUrl}
            className="mt-2 text-sm text-primary hover:text-primary-light"
          >
            Open CoinPayments checkout page
          </button>
        </div>
      </div>
      
      <div className="flex justify-between space-x-2 mt-4">
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 border border-primary/30 rounded-md hover:bg-secondary-light text-white flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          {paymentStatus === 'succeeded' ? 'Back to Tokens' : 'Cancel Payment'}
        </button>
      </div>
    </div>
  );
};

export default CryptoPayment;
