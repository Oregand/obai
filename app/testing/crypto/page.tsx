'use client';

import { useState, useEffect } from 'react';
import CryptoPayment from '@/components/payment/CryptoPayment';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function CryptoTestingPage() {
  const { data: session, status } = useSession();
  const [testAmount, setTestAmount] = useState(5);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [userCredits, setUserCredits] = useState(0);

  // Fetch user credits
  useEffect(() => {
    const fetchCredits = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch('/api/credits');
          const data = await response.json();
          if (response.ok) {
            setUserCredits(data.credits);
          }
        } catch (error) {
          console.error('Error fetching credits:', error);
        }
      }
    };

    fetchCredits();
  }, [session, paymentSuccess]);

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true);
    // Re-fetch user credits after successful payment
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };
  
  // Function to manually advance payment status (for testing)
  const advancePaymentStatus = async (paymentIntentId: string) => {
    try {
      const response = await fetch('/api/testing/crypto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'advance',
          paymentIntentId
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert(`Payment status advanced to: ${data.status}`);
        window.location.reload();
      } else {
        alert(`Error: ${data.error || 'Failed to advance payment status'}`);
      }
    } catch (error) {
      console.error('Error advancing payment:', error);
      alert('Error advancing payment status');
    }
  };

  if (status === 'loading') {
    return <div className="p-8">Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Crypto Payment Testing</h1>
        <p className="mb-4">Please login to test crypto payments.</p>
        <Link href="/login?callbackUrl=/testing/crypto" className="text-blue-500 hover:underline">
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Crypto Payment Testing</h1>
      
      <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <h2 className="font-semibold text-yellow-800 mb-2">Test Environment Information</h2>
        <p className="text-yellow-700 mb-2">
          This is a testing environment for crypto payments. No real payments will be processed unless
          connected to a real CoinPayments account.
        </p>
        <p className="text-yellow-700">
          Current user credits: <span className="font-bold">{userCredits}</span>
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Test Amount (USD)</label>
        <div className="flex items-center space-x-4">
          {[1, 5, 10, 20].map((amount) => (
            <button
              key={amount}
              onClick={() => setTestAmount(amount)}
              className={`px-4 py-2 border rounded-md ${
                testAmount === amount 
                  ? 'bg-blue-100 border-blue-500 text-blue-800' 
                  : 'bg-white hover:bg-gray-50'
              }`}
            >
              ${amount}
            </button>
          ))}
          <input
            type="number"
            value={testAmount}
            onChange={(e) => setTestAmount(Number(e.target.value))}
            className="w-24 px-3 py-2 border rounded-md"
            min="1"
            step="0.01"
          />
        </div>
      </div>

      {paymentSuccess ? (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-md mb-6">
          Payment successful! Your credits should be updated shortly.
        </div>
      ) : (
        <div className="bg-white p-6 border rounded-lg shadow-sm">
          <CryptoPayment 
            amount={testAmount} 
            onPaymentSuccess={handlePaymentSuccess}
            onCancel={() => {}} 
          />
        </div>
      )}

      <div className="mt-6">
        <Link href="/credits/purchase" className="text-blue-500 hover:underline">
          ← Back to Credits Purchase Page
        </Link>
      </div>
    </div>
  );
}
