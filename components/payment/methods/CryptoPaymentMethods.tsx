import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface CryptoWallet {
  id: string;
  type: string;
  name: string;
  address: string;
  isDefault: boolean;
  createdAt: string;
}

interface CryptoPaymentMethodsProps {
  userId: string;
}

interface CryptoCoin {
  code: string;
  name: string;
  image: string;
}

const SUPPORTED_COINS: CryptoCoin[] = [
  { code: 'BTC', name: 'Bitcoin', image: 'https://cryptologos.cc/logos/bitcoin-btc-logo.svg?v=025' },
  { code: 'ETH', name: 'Ethereum', image: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=025' },
  { code: 'LTC', name: 'Litecoin', image: 'https://cryptologos.cc/logos/litecoin-ltc-logo.svg?v=025' },
  { code: 'DOGE', name: 'Dogecoin', image: 'https://cryptologos.cc/logos/dogecoin-doge-logo.svg?v=025' },
  { code: 'USDT', name: 'Tether USD', image: 'https://cryptologos.cc/logos/tether-usdt-logo.svg?v=025' }
];

const CryptoPaymentMethods: React.FC<CryptoPaymentMethodsProps> = ({ userId }) => {
  const [wallets, setWallets] = useState<CryptoWallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddWalletForm, setShowAddWalletForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [selectedCoin, setSelectedCoin] = useState<string>('BTC');
  const [walletName, setWalletName] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [isDefaultWallet, setIsDefaultWallet] = useState(false);

  // Fetch user's saved wallets
  const fetchWallets = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/user/payment-methods');
      
      if (!response.ok) {
        throw new Error('Failed to fetch payment methods');
      }
      
      const data = await response.json();
      setWallets(data.paymentMethods || []);
    } catch (err: any) {
      console.error('Error fetching wallets:', err);
      setError(err.message || 'Failed to load payment methods');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, [userId]);

  // Add new wallet
  const handleAddWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/user/payment-methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: selectedCoin,
          name: walletName,
          address: walletAddress,
          isDefault: isDefaultWallet,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add payment method');
      }

      setSuccessMessage('Wallet added successfully!');
      
      // Reset form
      setSelectedCoin('BTC');
      setWalletName('');
      setWalletAddress('');
      setIsDefaultWallet(false);
      setShowAddWalletForm(false);
      
      // Refresh list
      fetchWallets();
    } catch (err: any) {
      console.error('Error adding wallet:', err);
      setError(err.message || 'Failed to add payment method');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Set a wallet as default
  const handleSetDefaultWallet = async (walletId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/user/payment-methods/${walletId}/default`, {
        method: 'PUT',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update default payment method');
      }

      // Update local state
      const updatedWallets = wallets.map(wallet => ({
        ...wallet,
        isDefault: wallet.id === walletId
      }));
      
      setWallets(updatedWallets);
      setSuccessMessage('Default wallet updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err: any) {
      console.error('Error setting default wallet:', err);
      setError(err.message || 'Failed to update default payment method');
    } finally {
      setIsLoading(false);
    }
  };

  // Remove a wallet
  const handleRemoveWallet = async (walletId: string) => {
    if (!confirm('Are you sure you want to remove this payment method?')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/user/payment-methods/${walletId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove payment method');
      }

      // Update local state
      setWallets(wallets.filter(wallet => wallet.id !== walletId));
      setSuccessMessage('Wallet removed successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err: any) {
      console.error('Error removing wallet:', err);
      setError(err.message || 'Failed to remove payment method');
    } finally {
      setIsLoading(false);
    }
  };

  const getCoinInfo = (code: string) => {
    return SUPPORTED_COINS.find(coin => coin.code === code) || SUPPORTED_COINS[0];
  };

  // Render loading state
  if (isLoading && wallets.length === 0) {
    return (
      <div className="flex justify-center items-center h-32">
        <LoadingSpinner size="medium" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-secondary-light border border-primary text-primary px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-secondary-light border border-primary/30 text-primary px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      {/* List of saved wallets */}
      {wallets.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Your Crypto Wallets</h3>
          <div className="space-y-2">
            {wallets.map((wallet) => {
              const coin = getCoinInfo(wallet.type);
              return (
                <div
                  key={wallet.id}
                  className={`p-4 rounded-md border ${
                    wallet.isDefault ? 'border-primary' : 'border-primary/30'
                  } bg-secondary-light flex items-center justify-between`}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 relative mr-3">
                      <Image
                        src={coin.image}
                        alt={coin.name}
                        width={40}
                        height={40}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-white">{wallet.name}</p>
                      <p className="text-sm text-white/70 font-mono">{wallet.address}</p>
                      {wallet.isDefault && (
                        <span className="text-xs text-primary">Default</span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {!wallet.isDefault && (
                      <button
                        onClick={() => handleSetDefaultWallet(wallet.id)}
                        className="text-xs px-2 py-1 bg-secondary text-white hover:bg-secondary-dark rounded-md"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveWallet(wallet.id)}
                      className="text-xs px-2 py-1 bg-primary/20 text-primary hover:bg-primary/30 rounded-md"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : !isLoading ? (
        <div className="text-center py-6 bg-secondary-light bg-opacity-30 rounded-md border border-primary/20">
          <p className="text-white/70 mb-2">No crypto wallets added yet</p>
          <p className="text-sm text-white/50 mb-4">
            Add your crypto wallet addresses to use for payments and receiving funds
          </p>
        </div>
      ) : null}

      {/* Add new wallet button/form */}
      {!showAddWalletForm ? (
        <div className="text-center mt-4">
          <button
            onClick={() => setShowAddWalletForm(true)}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-light transition-colors"
          >
            Add New Crypto Wallet
          </button>
        </div>
      ) : (
        <div className="bg-secondary-light bg-opacity-30 p-4 rounded-md border border-primary/30 mt-4">
          <h3 className="text-lg font-medium text-white mb-4">Add New Crypto Wallet</h3>
          <form onSubmit={handleAddWallet} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Cryptocurrency
              </label>
              <div className="grid grid-cols-5 gap-2">
                {SUPPORTED_COINS.map((coin) => (
                  <div
                    key={coin.code}
                    className={`p-2 border rounded-md cursor-pointer ${
                      selectedCoin === coin.code
                        ? 'border-primary bg-secondary-light'
                        : 'border-primary/30 hover:bg-secondary-light bg-opacity-50'
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
                      <span className="text-xs font-medium text-white">{coin.code}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="walletName" className="block text-sm font-medium text-white mb-1">
                Wallet Name
              </label>
              <input
                type="text"
                id="walletName"
                value={walletName}
                onChange={(e) => setWalletName(e.target.value)}
                placeholder="e.g. My Bitcoin Wallet"
                className="w-full px-3 py-2 bg-midnight-DEFAULT text-white border border-primary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label htmlFor="walletAddress" className="block text-sm font-medium text-white mb-1">
                Wallet Address
              </label>
              <input
                type="text"
                id="walletAddress"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder={`Enter your ${getCoinInfo(selectedCoin).name} address`}
                className="w-full px-3 py-2 bg-midnight-DEFAULT text-white border border-primary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isDefaultWallet"
                checked={isDefaultWallet}
                onChange={(e) => setIsDefaultWallet(e.target.checked)}
                className="h-4 w-4 text-primary border-primary focus:ring-primary bg-midnight-DEFAULT"
              />
              <label htmlFor="isDefaultWallet" className="ml-2 block text-sm text-white">
                Set as default payment method
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddWalletForm(false)}
                className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary-dark transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="small" />
                    <span className="ml-2">Adding...</span>
                  </>
                ) : (
                  'Add Wallet'
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CryptoPaymentMethods;
