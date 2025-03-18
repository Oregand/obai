'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface Subscription {
  id: string;
  tier: string;
  price: number;
  status: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  payment?: {
    amount: number;
    currency: string;
    status: string;
    completedAt: string | null;
  };
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  completedAt: string | null;
}

interface SubscriptionHistoryProps {
  userId: string;
}

export default function SubscriptionHistory({ userId }: SubscriptionHistoryProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeSubscription, setActiveSubscription] = useState<Subscription | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  
  useEffect(() => {
    fetchSubscriptionHistory();
  }, []);
  
  const fetchSubscriptionHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/subscriptions/history');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch subscription history');
      }
      
      setSubscriptions(data.subscriptions || []);
      setPayments(data.payments || []);
      
      // Find active subscription
      const active = data.subscriptions?.find((sub: Subscription) => 
        sub.status === 'active' && new Date(sub.endDate) > new Date()
      );
      
      setActiveSubscription(active || null);
    } catch (error: any) {
      console.error('Error fetching subscription history:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCancelSubscription = async () => {
    if (!activeSubscription) return;
    
    if (!confirm('Are you sure you want to cancel your subscription? You will still have access until the end of your billing period.')) {
      return;
    }
    
    try {
      setIsCancelling(true);
      
      const response = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: activeSubscription.id
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription');
      }
      
      toast.success('Subscription cancelled successfully');
      
      // Update subscription in state
      setSubscriptions(subscriptions.map(sub => 
        sub.id === activeSubscription.id 
          ? { ...sub, status: 'cancelled', autoRenew: false } 
          : sub
      ));
      
      // Update active subscription
      setActiveSubscription({
        ...activeSubscription,
        status: 'cancelled',
        autoRenew: false
      });
    } catch (error: any) {
      console.error('Error cancelling subscription:', error);
      toast.error(error.message || 'Failed to cancel subscription');
    } finally {
      setIsCancelling(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="medium" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-secondary-light border border-primary text-primary px-4 py-3 rounded mb-4">
        {error}
      </div>
    );
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  return (
    <div className="space-y-6">
      {/* Active Subscription */}
      {activeSubscription ? (
        <div className="bg-secondary-dark p-4 rounded-lg border border-primary/30">
          <h3 className="text-lg font-semibold text-white mb-3">Active Subscription</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-white opacity-70">Plan:</span>
              <span className="text-white font-medium capitalize">{activeSubscription.tier}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-white opacity-70">Price:</span>
              <span className="text-white font-medium">${activeSubscription.price.toFixed(2)}/month</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-white opacity-70">Status:</span>
              <span className={`font-medium ${
                activeSubscription.status === 'active' ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {activeSubscription.status === 'cancelled' ? 'Cancelled (No Renewal)' : 'Active'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-white opacity-70">Current Period:</span>
              <span className="text-white font-medium">
                {formatDate(activeSubscription.startDate)} - {formatDate(activeSubscription.endDate)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-white opacity-70">Auto-Renewal:</span>
              <span className={`font-medium ${
                activeSubscription.autoRenew ? 'text-green-400' : 'text-red-400'
              }`}>
                {activeSubscription.autoRenew ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
            {activeSubscription.status === 'active' && activeSubscription.autoRenew ? (
              <button
                onClick={handleCancelSubscription}
                disabled={isCancelling}
                className="px-3 py-1 bg-red-700 text-white text-sm rounded hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {isCancelling ? 'Cancelling...' : 'Cancel Subscription'}
              </button>
            ) : (
              <div className="text-white opacity-70 text-sm">
                Your subscription will end on {formatDate(activeSubscription.endDate)}
              </div>
            )}
            
            <Link href="/subscriptions">
              <button className="px-3 py-1 bg-primary text-white text-sm rounded hover:bg-primary-light transition-colors">
                Manage Plans
              </button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-secondary-dark p-4 rounded-lg border border-primary/30 text-center">
          <h3 className="text-lg font-semibold text-white mb-3">No Active Subscription</h3>
          
          <p className="text-white opacity-70 mb-4">
            You currently don't have an active subscription. Upgrade to a premium plan to access more features.
          </p>
          
          <Link href="/subscriptions">
            <button className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-light transition-colors">
              View Subscription Plans
            </button>
          </Link>
        </div>
      )}
      
      {/* Subscription History */}
      {subscriptions.length > 1 && (
        <div className="bg-secondary-dark p-4 rounded-lg border border-primary/30">
          <h3 className="text-lg font-semibold text-white mb-3">Subscription History</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full text-white">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-2 px-3 text-left text-sm opacity-70">Plan</th>
                  <th className="py-2 px-3 text-left text-sm opacity-70">Price</th>
                  <th className="py-2 px-3 text-left text-sm opacity-70">Status</th>
                  <th className="py-2 px-3 text-left text-sm opacity-70">Period</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.slice(0, 5).map((subscription) => (
                  <tr key={subscription.id} className="border-b border-white/5">
                    <td className="py-3 px-3 capitalize">{subscription.tier}</td>
                    <td className="py-3 px-3">${subscription.price.toFixed(2)}/month</td>
                    <td className="py-3 px-3">
                      <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                        subscription.status === 'active' ? 'bg-green-900/30 text-green-400' :
                        subscription.status === 'cancelled' ? 'bg-yellow-900/30 text-yellow-400' :
                        subscription.status === 'expired' ? 'bg-gray-800 text-gray-400' : ''
                      }`}>
                        {subscription.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-sm">
                      {formatDate(subscription.startDate)} - {formatDate(subscription.endDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Payment History */}
      {payments.length > 0 && (
        <div className="bg-secondary-dark p-4 rounded-lg border border-primary/30">
          <h3 className="text-lg font-semibold text-white mb-3">Payment History</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full text-white">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-2 px-3 text-left text-sm opacity-70">Date</th>
                  <th className="py-2 px-3 text-left text-sm opacity-70">Amount</th>
                  <th className="py-2 px-3 text-left text-sm opacity-70">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.slice(0, 5).map((payment) => (
                  <tr key={payment.id} className="border-b border-white/5">
                    <td className="py-3 px-3">{formatDate(payment.createdAt)}</td>
                    <td className="py-3 px-3">${payment.amount.toFixed(2)} {payment.currency}</td>
                    <td className="py-3 px-3">
                      <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                        payment.status === 'completed' ? 'bg-green-900/30 text-green-400' :
                        payment.status === 'pending' ? 'bg-yellow-900/30 text-yellow-400' :
                        payment.status === 'failed' ? 'bg-red-900/30 text-red-400' : ''
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
