'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import CryptoTokenPayment from '@/components/payment/CryptoTokenPayment';

export default function TokensPurchasePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedPackage, setSelectedPackage] = useState('basic');
  const [isPaymentStep, setIsPaymentStep] = useState(false);
  const [packageTotal, setPackageTotal] = useState(4.99); // Default to basic package price
  const [tokensAmount, setTokensAmount] = useState(100); // Default to basic package tokens
  const [customAmount, setCustomAmount] = useState(100);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  
  // Redirect if not logged in
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/tokens/purchase');
    }
  }, [status, router]);

  // Calculate price for custom amount
  useEffect(() => {
    if (selectedPackage === 'custom' && customAmount) {
      // Simple calculation, this could be more complex based on your business rules
      const baseRate = 0.05; // 5 cents per token
      const discountRate = 0.001; // 0.1% discount per token
      
      // Calculate discount based on volume (max 30%)
      const discount = Math.min(customAmount * discountRate, 0.3);
      const adjustedRate = baseRate * (1 - discount);
      
      // Calculate final price
      const price = customAmount * adjustedRate;
      setPackageTotal(Math.round(price * 100) / 100);
      
      // Calculate bonus tokens
      let bonusTokens = 0;
      if (customAmount >= 100) bonusTokens += Math.floor(customAmount * 0.05);
      if (customAmount >= 500) bonusTokens += Math.floor(customAmount * 0.05);
      if (customAmount >= 1000) bonusTokens += Math.floor(customAmount * 0.10);
      if (customAmount >= 2500) bonusTokens += Math.floor(customAmount * 0.20);
      
      setTokensAmount(customAmount + bonusTokens);
    }
  }, [selectedPackage, customAmount]);

  if (status === 'loading') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <LoadingSpinner />
      </div>
    );
  }

  const packages = [
    {
      id: 'basic',
      name: 'Basic',
      description: 'Good for occasional chats',
      price: '$4.99',
      tokens: 100,
      bonus: 0,
      popular: false
    },
    {
      id: 'standard',
      name: 'Standard',
      description: 'Popular choice for regular users',
      price: '$9.99',
      tokens: 300,
      bonus: 30,
      popular: true
    },
    {
      id: 'premium',
      name: 'Premium',
      description: 'Best value for power users',
      price: '$19.99',
      tokens: 1000,
      bonus: 200,
      popular: false
    }
  ];

  // Handle package selection
  const handleSelectPackage = (packageId: string) => {
    setSelectedPackage(packageId);
    
    // Set package price and tokens
    const pkg = packages.find(p => p.id === packageId);
    if (pkg) {
      // Convert string price to number
      const priceNumber = parseFloat(pkg.price.replace('$', ''));
      setPackageTotal(priceNumber);
      setTokensAmount(pkg.tokens + pkg.bonus);
    }
  };
  
  // Handle custom amount change
  const handleCustomAmountChange = (amount: number) => {
    setCustomAmount(amount);
  };
  
  // Handle continue to payment
  const handleContinueToPayment = () => {
    setIsPaymentStep(true);
  };
  
  // Handle payment success
  const handlePaymentSuccess = (txnId: string) => {
    setTransactionId(txnId);
    setPurchaseComplete(true);
  };
  
  // Handle payment cancellation
  const handlePaymentCancel = () => {
    setIsPaymentStep(false);
  };
  
  // Handle payment error
  const handlePaymentError = (error: string) => {
    // You could handle errors differently if needed
    console.error('Payment error:', error);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#121212', 
      padding: '3rem 1rem'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto'
      }}>
        {/* Header and navigation */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <div>
            <Link href="/tokens" style={{ color: 'white', opacity: 0.7, textDecoration: 'none' }}>
              Tokens
            </Link>
            <span style={{ color: 'white', opacity: 0.7, margin: '0 0.5rem' }}>/</span>
            <span style={{ color: 'white' }}>Purchase</span>
          </div>
          <Link href="/chat" style={{ textDecoration: 'none' }}>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              background: 'none',
              border: 'none',
              color: 'white',
              opacity: 0.7,
              cursor: 'pointer'
            }}>
              ← Back to Chat
            </button>
          </Link>
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            color: '#FF0033', 
            marginBottom: '0.5rem' 
          }}>
            Purchase Tokens
          </h1>
          <p style={{ color: 'white', opacity: 0.7, maxWidth: '600px', margin: '0 auto' }}>
            Tokens are used for AI interactions, unlocking premium content, and tipping creators.
          </p>
        </div>

        {/* Balance */}
        <div style={{ 
          backgroundColor: '#1a1a1a',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          textAlign: 'center',
          maxWidth: '600px',
          margin: '0 auto 2.5rem'
        }}>
          <h2 style={{ fontSize: '1.25rem', color: 'white', marginBottom: '0.5rem' }}>
            Token Balance
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#FF0033' }}>
              1,500
            </span>
            <span style={{ marginLeft: '0.5rem', color: 'white', opacity: 0.7 }}>
              tokens
            </span>
          </div>
        </div>

        {/* Hide packages if showing payment */}
        {!isPaymentStep && !purchaseComplete && (
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '1rem',
            marginBottom: '2.5rem'
          }}>
            {packages.map((pkg) => (
              <div 
                key={pkg.id}
                style={{ 
                  backgroundColor: selectedPackage === pkg.id ? '#101010' : '#1a1a1a',
                  border: selectedPackage === pkg.id ? '2px solid #FF0033' : '2px solid transparent',
                  borderRadius: '0.5rem',
                  padding: '1.5rem',
                  position: 'relative',
                  cursor: 'pointer'
                }}
                onClick={() => handleSelectPackage(pkg.id)}
              >
                {pkg.popular && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    backgroundColor: '#FF0033',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    padding: '0.25rem 0.75rem',
                    borderBottomLeftRadius: '0.25rem'
                  }}>
                    MOST POPULAR
                  </div>
                )}
                
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <input
                    type="radio"
                    checked={selectedPackage === pkg.id}
                    onChange={() => handleSelectPackage(pkg.id)}
                    style={{ marginTop: '0.25rem' }}
                  />
                  <div style={{ marginLeft: '0.75rem' }}>
                    <div style={{ fontSize: '1.125rem', fontWeight: '500', color: 'white' }}>
                      {pkg.name}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'white', opacity: 0.7 }}>
                      {pkg.description}
                    </div>
                  </div>
                </div>
                
                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                  <div style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#FF0033' }}>
                    {pkg.price}
                  </div>
                </div>
                
                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>
                    {pkg.tokens}
                    <span style={{ fontSize: '0.875rem', marginLeft: '0.5rem', opacity: 0.7 }}>tokens</span>
                  </div>
                  
                  {pkg.bonus > 0 && (
                    <div style={{ color: '#FF0033', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                      +{pkg.bonus} bonus tokens
                    </div>
                  )}
                </div>
                
                <div style={{ 
                  textAlign: 'center', 
                  marginTop: '1rem', 
                  fontSize: '0.875rem', 
                  color: 'white', 
                  opacity: 0.7 
                }}>
                  {pkg.tokens + pkg.bonus} tokens total
                </div>
              </div>
            ))}
            
            {/* Custom amount */}
            <div 
              style={{ 
                backgroundColor: selectedPackage === 'custom' ? '#101010' : '#1a1a1a',
                border: selectedPackage === 'custom' ? '2px solid #FF0033' : '2px solid transparent',
                borderRadius: '0.5rem',
                padding: '1.5rem',
                cursor: 'pointer'
              }}
              onClick={() => handleSelectPackage('custom')}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <input
                  type="radio"
                  checked={selectedPackage === 'custom'}
                  onChange={() => handleSelectPackage('custom')}
                  style={{ marginTop: '0.25rem' }}
                />
                <div style={{ marginLeft: '0.75rem' }}>
                  <div style={{ fontSize: '1.125rem', fontWeight: '500', color: 'white' }}>
                    Custom Amount
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'white', opacity: 0.7 }}>
                    Choose how many tokens you need
                  </div>
                </div>
              </div>
              
              {selectedPackage === 'custom' ? (
                <div style={{ marginTop: '1.5rem' }}>
                  <input
                    type="number"
                    min="10"
                    value={customAmount}
                    onChange={(e) => handleCustomAmountChange(parseInt(e.target.value, 10) || 0)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      backgroundColor: '#101010',
                      color: 'white',
                      border: '1px solid rgba(255, 0, 51, 0.3)',
                      borderRadius: '0.25rem'
                    }}
                  />
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(3, 1fr)', 
                    gap: '0.5rem',
                    marginTop: '1rem'
                  }}>
                    {[100, 250, 1000].map(amount => (
                      <button
                        key={amount}
                        onClick={() => handleCustomAmountChange(amount)}
                        style={{
                          padding: '0.25rem',
                          backgroundColor: '#101010',
                          color: 'white',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '0.25rem',
                          fontSize: '0.875rem'
                        }}
                      >
                        {amount}
                      </button>
                    ))}
                  </div>
                  
                  <div style={{ marginTop: '1.5rem' }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      fontSize: '0.875rem',
                      color: 'white',
                      marginBottom: '0.25rem'
                    }}>
                      <span>Price:</span>
                      <span style={{ color: '#FF0033', fontWeight: '500' }}>${packageTotal.toFixed(2)}</span>
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      fontSize: '0.875rem',
                      color: 'white',
                      marginBottom: '0.25rem'
                    }}>
                      <span>Bonus Tokens:</span>
                      <span style={{ color: '#FF0033' }}>+{tokensAmount - customAmount}</span>
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      fontSize: '0.875rem',
                      color: 'white',
                      fontWeight: '500',
                      marginTop: '0.75rem',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      <span>Total Tokens:</span>
                      <span>{tokensAmount}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                  <div style={{ fontSize: '1.125rem', color: 'white', opacity: 0.7 }}>
                    Custom amount
                  </div>
                  
                  <div style={{ fontSize: '0.875rem', color: 'white', opacity: 0.7, marginTop: '1.5rem' }}>
                    Larger purchases get <span style={{ color: '#FF0033' }}>bonus tokens</span>
                  </div>
                  
                  <div style={{ fontSize: '0.875rem', color: 'white', opacity: 0.7, marginTop: '1rem' }}>
                    Up to 40% bonus tokens
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Payment step */}
        {isPaymentStep && !purchaseComplete ? (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <CryptoTokenPayment
              amount={packageTotal}
              paymentType="credit_purchase"
              onSuccess={handlePaymentSuccess}
              onCancel={handlePaymentCancel}
              onError={handlePaymentError}
            />
          </div>
        ) : purchaseComplete ? (
          <div style={{ 
            backgroundColor: '#1a1a1a',
            border: '2px solid #00AA00',
            borderRadius: '0.5rem',
            padding: '2rem',
            maxWidth: '600px',
            margin: '0 auto',
            textAlign: 'center'
          }}>
            <div style={{
              backgroundColor: '#00AA00',
              color: 'white',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem' }}>
              Purchase Complete!
            </h2>
            
            <p style={{ color: 'white', opacity: 0.8, marginBottom: '1.5rem' }}>
              You've successfully purchased {tokensAmount} tokens.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link href="/tokens" style={{ textDecoration: 'none' }}>
                <button style={{
                  backgroundColor: '#FF0033',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  padding: '0.75rem 1rem',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  width: '100%'
                }}>
                  View My Tokens
                </button>
              </Link>
              
              <Link href="/chat" style={{ textDecoration: 'none' }}>
                <button style={{
                  backgroundColor: 'transparent',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '0.25rem',
                  padding: '0.75rem 1rem',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  width: '100%'
                }}>
                  Go to Chat
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={handleContinueToPayment}
              style={{
                backgroundColor: '#FF0033',
                color: 'white',
                border: 'none',
                borderRadius: '0.25rem',
                padding: '0.75rem 2rem',
                fontSize: '1.125rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Continue to Payment
            </button>
            
            <p style={{ 
              marginTop: '1rem', 
              fontSize: '0.875rem', 
              color: 'white', 
              opacity: 0.6 
            }}>
              Tokens are non-refundable and have no cash value
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
