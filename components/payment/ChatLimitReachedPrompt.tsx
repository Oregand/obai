'use client';

import Link from 'next/link';

interface ChatLimitReachedPromptProps {
  currentTier: string;
  currentCount: number;
  limit: number;
  onClose: () => void;
}

export default function ChatLimitReachedPrompt({
  currentTier,
  currentCount,
  limit,
  onClose,
}: ChatLimitReachedPromptProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-midnight-darker max-w-lg w-full rounded-lg p-5 shadow-xl">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-medium text-primary">Chat Limit Reached</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-5">
          <p className="text-gray-200 mb-3">
            You've reached your chat limit for your current {currentTier} subscription tier.
          </p>
          <div className="bg-midnight rounded-lg p-3 border border-primary/30 mb-3">
            <div className="flex justify-between mb-1">
              <span className="text-gray-300">Current Chats:</span>
              <span className="text-white font-medium">{currentCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Maximum Allowed:</span>
              <span className="text-white font-medium">{limit}</span>
            </div>
          </div>
          <p className="text-gray-300 text-sm">
            To continue creating new chats, you can either upgrade your subscription for more capacity or delete some existing chats.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-md transition-colors"
          >
            Manage Existing Chats
          </button>
          <Link href="/subscriptions" className="px-4 py-2 bg-primary hover:bg-primary-light text-white rounded-md transition-colors text-center">
            Upgrade Subscription
          </Link>
        </div>
      </div>
    </div>
  );
}
