'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../ui/LoadingSpinner';

interface LockedMessageProps {
  messageId: string;
  chatId: string;
  unlockPrice: number;
  onUnlock: (content: string) => void;
}

export default function LockedMessage({ 
  messageId, 
  chatId, 
  unlockPrice, 
  onUnlock 
}: LockedMessageProps) {
  const [isUnlocking, setIsUnlocking] = useState(false);

  const handleUnlock = async () => {
    if (isUnlocking) return;
    
    if (!confirm(`Do you want to unlock this message for $${unlockPrice.toFixed(2)}?`)) {
      return;
    }
    
    setIsUnlocking(true);
    
    try {
      const response = await fetch(`/api/chat/${chatId}/messages/${messageId}/unlock`, {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (data.error === 'Insufficient credits') {
          toast.error(`Insufficient credits. You need $${data.required} but have $${data.credits}.`);
        } else {
          toast.error(data.error || 'Failed to unlock message');
        }
        return;
      }
      
      toast.success('Message unlocked successfully!');
      onUnlock(data.content);
    } catch (error) {
      console.error('Error unlocking message:', error);
      toast.error('Failed to unlock message. Please try again.');
    } finally {
      setIsUnlocking(false);
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center py-6 px-4 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="mb-3 text-amber-600 dark:text-amber-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Premium Content
      </h3>
      
      <p className="text-gray-600 dark:text-gray-300 text-center mb-4 max-w-md">
        This message contains premium content. Unlock it to view the full message.
      </p>
      
      <button
        onClick={handleUnlock}
        disabled={isUnlocking}
        className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUnlocking ? (
          <LoadingSpinner size="small" />
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
            Unlock for ${unlockPrice.toFixed(2)}
          </>
        )}
      </button>
    </div>
  );
}
