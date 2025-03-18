'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import CryptoPayment from '@/components/payment/CryptoPayment';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import TokenDisplay from '@/components/tokens/TokenDisplay';
import { TOKEN_PACKAGES, CUSTOM_TOKEN_TIERS } from '@/lib/services/token-service';
import { 
  formatTokenPackage, 
  formatPrice, 
  formatTokenCount 
} from '@/lib/utils/payment-utils';

export default function TokensPurchasePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedPackage, setSelectedPackage] = useState<string>('basic');
  const [customTokenAmount, setCustomTokenAmount] = useState<number>(100);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [currentBalance, setCurrentBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTier, setCurrentTier] = useState<any>(CUSTOM_TOKEN_TIERS[0]);
  const [nextTier, setNextTier] = useState<any>(CUSTOM_TOKEN_TIERS[1]);
  
  // Fetch user's current token balance
  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/user/balance')
        .then(res => res.json())
        .then(data => {
          setCurrentBalance(data.balance);
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Error fetching balance:', error);
          setIsLoading(false);
        });
    }
  }, [status]);
  
  // Handle token purchase
  const handlePurchase = async () => {
    if (!session?.user) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/tokens/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId: selectedPackage,
          customTokenAmount: selectedPackage === 'custom' ? customTokenAmount : 0
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate token purchase');
      }
      
      // Format package info using our utility function
      const packageInfo = formatTokenPackage(selectedPackage, customTokenAmount);
      
      // Enhance payment data with selected package info
      setPaymentData({
        ...data,
        packageInfo: {
          ...packageInfo,
          finalPrice: data.amount
        }
      });
    } catch (error) {
      console.error('Error purchasing tokens:', error);
      toast.error('Failed to initiate token purchase. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle successful crypto payment
  const handlePaymentSuccess = async () => {
    if (!paymentData?.payment?.id) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/tokens/purchase/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId: paymentData.payment.id
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete token purchase');
      }
      
      toast.success(`Successfully added ${formatTokenCount(data.tokensAdded)} tokens to your account!`);
      
      // Update local balance
      setCurrentBalance(data.newBalance);
      
      // Reset payment data
      setPaymentData(null);
    } catch (error) {
      console.error('Error completing token purchase:', error);
      toast.error('Failed to add tokens. Please contact support.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Calculate current and next tier for custom tokens
  useEffect(() => {
    // Get current tier for custom tokens
    const curTier = CUSTOM_TOKEN_TIERS.find(
      tier => customTokenAmount >= tier.minTokens && customTokenAmount <= tier.maxTokens
    ) || CUSTOM_TOKEN_TIERS[0];
    
    setCurrentTier(curTier);
    
    // Get next tier for custom tokens (if any)
    const nextTierIndex = CUSTOM_TOKEN_TIERS.findIndex(tier => tier === curTier) + 1;
    const nextT = nextTierIndex < CUSTOM_TOKEN_TIERS.length ? CUSTOM_TOKEN_TIERS[nextTierIndex] : null;
    
    setNextTier(nextT);
  }, [customTokenAmount]);

  // If not authenticated, redirect to login
  if (status === 'unauthenticated') {
    router.push('/login?callbackUrl=/tokens/purchase');
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
              { label: 'Tokens', href: '/tokens' },
              { label: 'Purchase' }
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
            Purchase Tokens
          </h1>
          <p className="text-white opacity-70 max-w-2xl mx-auto">
            Tokens are used for AI interactions, unlocking premium content, and tipping creators.
          </p>
          
          {currentBalance !== null && (
            <div className="mt-4">
              <TokenDisplay variant="large" showBuyButton={false} />
            </div>
          )}
        </div>
        
        {!paymentData ? (
          <>
            {/* Token Packages */}
            <div className="bg-secondary-dark bg-opacity-60 shadow-lg rounded-lg overflow-hidden mb-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0.5">
                {TOKEN_PACKAGES.filter(pkg => pkg.id !== 'custom').map((pkg) => (
                  <div 
                    key={pkg.id}
                    className={`relative p-6 bg-midnight-lighter flex flex-col ${
                      selectedPackage === pkg.id 
                        ? 'ring-2 ring-primary z-10' 
                        : 'hover:bg-secondary hover:bg-opacity-20'
                    } cursor-pointer`}
                    onClick={() => setSelectedPackage(pkg.id)}
                  >
                    {pkg.mostPopular && (
                      <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl">
                        MOST POPULAR
                      </div>
                    )}
                    
                    <div className="flex items-start">
                      <input
                        id={`package-${pkg.id}`}
                        name="package_selection"
                        type="radio"
                        checked={selectedPackage === pkg.id}
                        onChange={() => setSelectedPackage(pkg.id)}
                        className="mt-1 h-4 w-4 text-primary border-primary focus:ring-primary"
                      />
                      <label htmlFor={`package-${pkg.id}`} className="ml-3 flex flex-col cursor-pointer flex-1">
                        <span className="block text-lg font-medium text-white">
                          {pkg.name}
                        </span>
                        <span className="block text-sm text-white opacity-70 mt-1">
                          {pkg.description}
                        </span>
                      </label>
                    </div>
                    
                    <div className="mt-4 text-center">
                      <div className="flex justify-center items-baseline">
                        <span className="text-3xl font-bold text-primary">{formatPrice(pkg.price)}</span>
                        {pkg.savePercentage > 0 && (
                          <span className="ml-2 text-sm text-white opacity-70">
                            Save {pkg.savePercentage}%
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-6 text-center">
                      <div className="flex justify-center items-center">
                        <span className="text-2xl font-bold text-white">{formatTokenCount(pkg.tokens)}</span>
                        <span className="ml-2 text-sm text-white opacity-70">tokens</span>
                      </div>
                      
                      {pkg.bonus > 0 && (
                        <div className="mt-1 text-sm text-primary font-medium">
                          +{formatTokenCount(pkg.bonus)} bonus tokens
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 text-center text-sm text-white opacity-70">
                      {formatTokenCount(pkg.tokens + (pkg.bonus || 0))} tokens total
                    </div>
                  </div>
                ))}
                
                {/* Custom Token Package */}
                <div 
                  className={`relative p-6 bg-midnight-lighter flex flex-col ${
                    selectedPackage === 'custom' 
                      ? 'ring-2 ring-primary z-10' 
                      : 'hover:bg-secondary hover:bg-opacity-20'
                  } cursor-pointer`}
                  onClick={() => setSelectedPackage('custom')}
                >
                  <div className="flex items-start">
                    <input
                      id="package-custom"
                      name="package_selection"
                      type="radio"
                      checked={selectedPackage === 'custom'}
                      onChange={() => setSelectedPackage('custom')}
                      className="mt-1 h-4 w-4 text-primary border-primary focus:ring-primary"
                    />
                    <label htmlFor="package-custom" className="ml-3 flex flex-col cursor-pointer flex-1">
                      <span className="block text-lg font-medium text-white">
                        Custom Amount
                      </span>
                      <span className="block text-sm text-white opacity-70 mt-1">
                        Choose how many tokens you need
                      </span>
                    </label>
                  </div>
                  
                  {selectedPackage === 'custom' && (
                    <div className="mt-4">
                      <input
                        type="number"
                        min="10"
                        max="10000"
                        step="10"
                        value={customTokenAmount}
                        onChange={(e) => setCustomTokenAmount(parseInt(e.target.value) || 100)}
                        className="w-full py-2 px-3 bg-secondary-dark text-white rounded-md border border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        {[100, 250, 1000].map((amount) => (
                          <button
                            key={amount}
                            onClick={(e) => {
                              e.stopPropagation();
                              setCustomTokenAmount(amount);
                            }}
                            className="py-1 px-2 bg-secondary text-sm text-white rounded-md hover:bg-primary/20"
                          >
                            {amount}
                          </button>
                        ))}
                      </div>
                      
                      <div className="mt-6">
                        <div className="flex justify-between items-center text-sm mb-1">
                          <span className="text-white">Price:</span>
                          <span className="text-primary font-bold">
                            {formatPrice(currentTier ? (customTokenAmount * currentTier.pricePerToken) : 0)}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm mb-1">
                          <span className="text-white">Bonus Tokens:</span>
                          <span className="text-primary font-bold">
                            +{formatTokenCount(currentTier ? Math.floor(customTokenAmount * (currentTier.bonusPercentage / 100)) : 0)}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm mt-3 pt-3 border-t border-white/10">
                          <span className="text-white font-medium">Total Tokens:</span>
                          <span className="text-white font-bold">
                            {formatTokenCount(currentTier ? 
                              customTokenAmount + Math.floor(customTokenAmount * (currentTier.bonusPercentage / 100)) : 
                              customTokenAmount)}
                          </span>
                        </div>
                      </div>
                      
                      {nextTier && (
                        <div className="mt-4 text-xs text-white opacity-70 p-2 bg-secondary-dark rounded">
                          Purchase {formatTokenCount(nextTier.minTokens - customTokenAmount)} more tokens to reach {nextTier.bonusPercentage}% bonus tier!
                        </div>
                      )}
                    </div>
                  )}
                  
                  {selectedPackage !== 'custom' && (
                    <>
                      <div className="mt-4 text-center">
                        <div className="flex justify-center items-baseline">
                          <span className="text-lg text-white opacity-70">Custom amount</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 text-center">
                        <span className="text-sm text-white opacity-70">
                          Larger purchases get <span className="text-primary">bonus tokens</span>
                        </span>
                      </div>

                      <div className="mt-6 text-center text-sm text-white opacity-70">
                        Up to 40% bonus tokens
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Price Tiers for Custom Tokens */}
            {selectedPackage === 'custom' && CUSTOM_TOKEN_TIERS && currentTier && (
              <div className="bg-secondary-dark bg-opacity-30 p-6 rounded-lg mb-8">
                <h3 className="text-lg font-medium text-white mb-4">Token Price Tiers</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {CUSTOM_TOKEN_TIERS.map((tier, index) => (
                    <div 
                      key={index}
                      className={`p-3 rounded-md border ${
                        currentTier === tier ? 'border-primary bg-secondary-dark' : 'border-white/10 bg-secondary-dark/50'
                      }`}
                    >
                      <div className="text-xs text-white opacity-70 mb-1">
                        {tier.minTokens === 1 ? '1+' : `${tier.minTokens}+`} tokens
                      </div>
                      <div className="text-lg font-bold text-white">
                        {formatPrice(tier.pricePerToken || 0, 'USD', false)} / token
                      </div>
                      <div className="text-xs text-primary mt-1">
                        {tier.bonusPercentage > 0 ? `+${tier.bonusPercentage}% bonus` : 'No bonus'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Purchase Button */}
            <div className="text-center">
              <button
                onClick={handlePurchase}
                disabled={isSubmitting}
                className="px-8 py-3 bg-primary text-white text-lg font-medium rounded-md hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="small" />
                    <span className="ml-2">Processing...</span>
                  </>
                ) : (
                  'Continue to Payment'
                )}
              </button>
              <p className="mt-4 text-sm text-white opacity-60">
                Tokens are non-refundable and have no cash value
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="bg-midnight-lighter shadow-xl rounded-lg overflow-hidden p-6 mb-8">
              <h2 className="text-xl font-medium text-white mb-4">
                Complete Your Purchase
              </h2>
              
              <div className="bg-secondary-dark bg-opacity-50 p-4 rounded-md mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-white opacity-70">Package:</span>
                    <span className="text-white ml-2">{paymentData?.packageInfo?.name || '-'}</span>
                  </div>
                  <div>
                    <span className="text-white opacity-70">Price:</span>
                    <span className="text-primary font-medium ml-2">
                      {formatPrice(paymentData?.packageInfo?.finalPrice || 0)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div>
                    <span className="text-white opacity-70">Tokens:</span>
                    <span className="text-white ml-2">{formatTokenCount(paymentData?.packageInfo?.baseTokens || 0)}</span>
                  </div>
                  <div>
                    <span className="text-white opacity-70">Bonus:</span>
                    <span className="text-primary ml-2">+{formatTokenCount(paymentData?.packageInfo?.bonusTokens || 0)}</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">Total tokens:</span>
                    <span className="text-white font-bold">{formatTokenCount(paymentData?.packageInfo?.totalTokens || 0)}</span>
                  </div>
                </div>
              </div>
              
              <CryptoPayment 
                amount={paymentData?.packageInfo?.finalPrice || 0} 
                onPaymentSuccess={handlePaymentSuccess}
                onCancel={() => setPaymentData(null)}
              />
            </div>
            
            <div className="text-center">
              <button
                onClick={() => setPaymentData(null)}
                className="text-white opacity-70 hover:opacity-100 hover:text-primary transition-colors"
              >
                ← Back to packages
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
