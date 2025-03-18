'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import CryptoPayment from '@/components/payment/CryptoPayment';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { SUBSCRIPTION_TIERS } from '@/lib/services/token-service';

export default function SubscriptionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState<string>('basic');
  const [currentTier, setCurrentTier] = useState<string | null>(null);
  const [currentTierExpiry, setCurrentTierExpiry] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch user's current subscription
  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/user/subscription')
        .then(res => res.json())
        .then(data => {
          setCurrentTier(data.tier);
          setCurrentTierExpiry(data.expiresAt ? new Date(data.expiresAt) : null);
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Error fetching subscription:', error);
          setIsLoading(false);
        });
    }
  }, [status]);
  
  // Initialize selected tier based on current subscription
  useEffect(() => {
    if (currentTier) {
      // If they have a paid tier, suggest the same tier for renewal
      if (currentTier !== 'free') {
        setSelectedTier(currentTier);
      }
    }
  }, [currentTier]);
  
  // Handle subscription purchase
  const handlePurchase = async () => {
    if (!session?.user) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/subscriptions/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tierId: selectedTier
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate subscription purchase');
      }
      
      setPaymentData(data);
    } catch (error) {
      console.error('Error purchasing subscription:', error);
      toast.error('Failed to initiate subscription purchase. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle successful crypto payment
  const handlePaymentSuccess = async () => {
    if (!paymentData?.subscription?.id) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/subscriptions/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: paymentData.subscription.id
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to activate subscription');
      }
      
      toast.success(`Successfully activated ${selectedTier} subscription!`);
      
      // Update current subscription info
      setCurrentTier(selectedTier);
      setCurrentTierExpiry(new Date(data.subscription.endDate));
      
      // Reset payment data
      setPaymentData(null);
    } catch (error) {
      console.error('Error activating subscription:', error);
      toast.error('Failed to activate subscription. Please contact support.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // If not authenticated, redirect to login
  if (status === 'unauthenticated') {
    router.push('/login?callbackUrl=/subscriptions');
    return null;
  }
  
  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  const selectedTierInfo = SUBSCRIPTION_TIERS.find(tier => tier.id === selectedTier);
  
  // Get date when subscription expires in readable format
  const expiryDateFormatted = currentTierExpiry 
    ? currentTierExpiry.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : null;
  
  return (
    <div className="min-h-screen bg-midnight-DEFAULT py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Breadcrumbs 
            items={[
              { label: 'Subscriptions' }
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
            Subscription Plans
          </h1>
          <p className="text-white opacity-70 max-w-2xl mx-auto">
            Unlock more features and capabilities with a premium subscription
          </p>
          
          {currentTier && (
            <div className="mt-4 p-3 bg-midnight-lighter rounded-lg inline-block">
              <p className="text-white">
                <span className="opacity-70">Current plan:</span>{' '}
                <span className="font-bold text-primary capitalize">{currentTier}</span>
                
                {currentTierExpiry && currentTier !== 'free' && (
                  <span className="ml-2 opacity-70 text-sm">
                    (Expires on {expiryDateFormatted})
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
        
        {!paymentData ? (
          <>
            {/* Subscription Tiers */}
            <div className="bg-secondary-dark bg-opacity-60 shadow-lg rounded-lg overflow-hidden mb-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-0.5">
                {SUBSCRIPTION_TIERS.filter(tier => tier.id !== 'free').map((tier) => (
                  <div 
                    key={tier.id}
                    className={`relative p-6 bg-midnight-lighter flex flex-col ${
                      selectedTier === tier.id 
                        ? 'ring-2 ring-primary z-10' 
                        : 'hover:bg-secondary hover:bg-opacity-20'
                    } cursor-pointer`}
                    onClick={() => setSelectedTier(tier.id)}
                  >
                    {tier.id === 'premium' && (
                      <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl">
                        MOST POPULAR
                      </div>
                    )}
                    
                    <div className="flex items-start">
                      <input
                        id={`tier-${tier.id}`}
                        name="tier_selection"
                        type="radio"
                        checked={selectedTier === tier.id}
                        onChange={() => setSelectedTier(tier.id)}
                        className="mt-1 h-4 w-4 text-primary border-primary focus:ring-primary"
                      />
                      <label htmlFor={`tier-${tier.id}`} className="ml-3 flex flex-col cursor-pointer flex-1">
                        <span className="block text-lg font-medium text-white capitalize">
                          {tier.name}
                        </span>
                        <span className="block text-sm text-white opacity-70 mt-1">
                          {tier.description}
                        </span>
                      </label>
                    </div>
                    
                    <div className="mt-4 text-center">
                      <div className="flex justify-center items-baseline">
                        <span className="text-3xl font-bold text-primary">${tier.price.toFixed(2)}</span>
                        <span className="ml-2 text-sm text-white opacity-70">
                          /month
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-6 space-y-3">
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="ml-2 text-white">
                          {tier.chatLimit === Infinity ? 'Unlimited' : tier.chatLimit} chats at a time
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="ml-2 text-white">
                          {tier.tokenDiscount * 100}% off token usage
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="ml-2 text-white">
                          {tier.bonusTokens} free tokens monthly
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="ml-2 text-white">
                          {Math.round((1 - tier.discountMultiplier) * 100)}% discount on token purchases
                        </span>
                      </div>
                      
                      {tier.exclusivePersonas && (
                        <div className="flex items-center">
                          <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="ml-2 text-white">
                            Access to premium personas
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Purchase Button */}
            <div className="text-center">
              <button
                onClick={handlePurchase}
                disabled={isSubmitting || (currentTier === selectedTier && currentTierExpiry && currentTierExpiry > new Date())}
                className="px-8 py-3 bg-primary text-white text-lg font-medium rounded-md hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="small" />
                    <span className="ml-2">Processing...</span>
                  </>
                ) : currentTier === selectedTier && currentTierExpiry && currentTierExpiry > new Date() ? (
                  'Current Plan'
                ) : (
                  'Continue to Payment'
                )}
              </button>
              
              {currentTier === selectedTier && currentTierExpiry && currentTierExpiry > new Date() && (
                <p className="mt-2 text-sm text-white opacity-60">
                  You're already subscribed to this plan until {expiryDateFormatted}
                </p>
              )}
              
              <p className="mt-4 text-sm text-white opacity-60">
                Subscriptions automatically renew monthly and can be canceled at any time
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="bg-midnight-lighter shadow-xl rounded-lg overflow-hidden p-6 mb-8">
              <h2 className="text-xl font-medium text-white mb-4">
                Complete Your Subscription
              </h2>
              
              <div className="bg-secondary-dark bg-opacity-50 p-4 rounded-md mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-white opacity-70">Plan:</span>
                    <span className="text-white ml-2 capitalize">{selectedTierInfo?.name}</span>
                  </div>
                  <div>
                    <span className="text-white opacity-70">Price:</span>
                    <span className="text-primary font-medium ml-2">${selectedTierInfo?.price.toFixed(2)}/month</span>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">Chat limit:</span>
                    <span className="text-white font-bold">
                      {selectedTierInfo?.chatLimit === Infinity ? 'Unlimited' : selectedTierInfo?.chatLimit}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-white font-medium">Bonus tokens:</span>
                    <span className="text-white font-bold">
                      {selectedTierInfo?.bonusTokens}
                    </span>
                  </div>
                </div>
              </div>
              
              <CryptoPayment 
                amount={selectedTierInfo?.price || 0} 
                onPaymentSuccess={handlePaymentSuccess}
                onCancel={() => setPaymentData(null)}
              />
            </div>
            
            <div className="text-center">
              <button
                onClick={() => setPaymentData(null)}
                className="text-white opacity-70 hover:opacity-100 hover:text-primary transition-colors"
              >
                ← Back to plans
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
