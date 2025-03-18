'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import TokenService, { FREE_MESSAGE_LIMIT } from '@/lib/services/token-service';

export default function FreeMessageTracker() {
  const { data: session } = useSession();
  const [freeMessagesUsed, setFreeMessagesUsed] = useState(0);
  const [freeMessagesRemaining, setFreeMessagesRemaining] = useState(FREE_MESSAGE_LIMIT);
  const [isLoading, setIsLoading] = useState(true);
  const [usedFreeMessages, setUsedFreeMessages] = useState(false);

  // Fetch free message usage
  useEffect(() => {
    const fetchFreeMessageUsage = async () => {
      if (!session?.user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/user/free-messages');
        
        if (response.ok) {
          const data = await response.json();
          setFreeMessagesUsed(data.freeMessagesUsed);
          setFreeMessagesRemaining(data.freeMessagesRemaining);
          setUsedFreeMessages(data.freeMessagesUsed > 0);
        }
      } catch (error) {
        console.error('Error fetching free message usage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFreeMessageUsage();
  }, [session?.user?.id]);

  // Don't display if loading or user hasn't used any free messages yet
  if (isLoading || !usedFreeMessages) {
    return null;
  }

  // Don't display if user has used all free messages
  if (freeMessagesRemaining <= 0) {
    return null;
  }

  return (
    <div className="bg-secondary-dark rounded-md p-2 border border-primary/20 flex items-center justify-between">
      <div className="text-xs text-white">
        <span className="opacity-70">Free messages:</span> 
        <span className="ml-1 font-medium">
          {freeMessagesRemaining} / {FREE_MESSAGE_LIMIT} remaining
        </span>
      </div>
      <div className="flex space-x-1">
        {Array.from({ length: FREE_MESSAGE_LIMIT }).map((_, i) => (
          <div 
            key={i} 
            className={`w-2 h-2 rounded-full ${
              i < freeMessagesUsed ? 'bg-primary' : 'bg-primary/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
