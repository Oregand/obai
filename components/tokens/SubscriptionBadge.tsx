import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const SubscriptionBadge: React.FC = () => {
  const { data: session } = useSession();
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user subscription when component mounts
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!session?.user) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/user/subscription');
        
        if (!response.ok) {
          throw new Error('Failed to fetch subscription');
        }
        
        const data = await response.json();
        setSubscription(data.subscription);
      } catch (err) {
        console.error('Error fetching subscription:', err);
        // If there's an error, we'll just show "Free Tier"
        setSubscription(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, [session]);

  // If user is not authenticated
  if (!session?.user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="inline-flex items-center px-1.5 py-0.5 text-xs text-white bg-secondary-light rounded">
        <LoadingSpinner size="small" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <Link href="/subscriptions">
        <span className="inline-flex items-center px-2 py-0.5 text-xs text-white bg-secondary-light hover:bg-secondary rounded cursor-pointer transition-colors">
          Free
        </span>
      </Link>
    );
  }

  const tierColors = {
    basic: 'bg-primary/30 text-primary',
    premium: 'bg-primary/50 text-white',
    vip: 'bg-primary text-white'
  };
  
  const tierColor = tierColors[subscription.tier as keyof typeof tierColors] || tierColors.basic;

  return (
    <Link href="/subscriptions">
      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium ${tierColor} rounded cursor-pointer hover:opacity-90 transition-opacity`}>
        {subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1)}
      </span>
    </Link>
  );
};

export default SubscriptionBadge;
