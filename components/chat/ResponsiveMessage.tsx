'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import useResponsive from '@/lib/hooks/useResponsive';

type MessageRole = 'user' | 'assistant' | 'system';

type MessageProps = {
  id: string;
  content: string;
  role: MessageRole;
  timestamp: Date;
  avatarUrl?: string;
  username?: string;
  isTyping?: boolean;
  onRegenerate?: () => void;
  onCopy?: () => void;
  onDelete?: () => void;
  isLocked?: boolean;
  onUnlock?: () => void;
  tokenCost?: number;
};

export default function ResponsiveMessage({
  id,
  content,
  role,
  timestamp,
  avatarUrl,
  username = role === 'user' ? 'You' : 'Assistant',
  isTyping = false,
  onRegenerate,
  onCopy,
  onDelete,
  isLocked = false,
  onUnlock,
  tokenCost,
}: MessageProps) {
  const [showActions, setShowActions] = useState(false);
  const { isMobile } = useResponsive();

  // Format the message timestamp
  const formattedTime = formatDistanceToNow(timestamp, { addSuffix: true });

  // Define message background color based on role
  const bgColor = role === 'user' 
    ? 'bg-blue-600 bg-opacity-20' 
    : role === 'assistant' 
      ? 'bg-gray-800 bg-opacity-50' 
      : 'bg-yellow-500 bg-opacity-10';

  // Define message alignment based on role
  const alignment = role === 'user' ? 'justify-end' : 'justify-start';

  return (
    <div 
      className={`flex ${alignment} mb-4 px-4 sm:px-6 group`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onFocus={() => setShowActions(true)}
      onBlur={() => setShowActions(false)}
    >
      <div className={`max-w-full ${role === 'user' ? 'ml-12 sm:ml-24' : 'mr-12 sm:mr-24'}`}>
        {/* Message Container */}
        <div className={`rounded-lg p-3 sm:p-4 ${bgColor} relative`}>
          {/* Message Header */}
          <div className="flex items-center mb-2">
            {/* Avatar */}
            {avatarUrl && (
              <div className="h-8 w-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
                <Image 
                  src={avatarUrl} 
                  alt={username} 
                  width={32} 
                  height={32} 
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            
            {/* Username and Timestamp */}
            <div className="flex flex-col sm:flex-row sm:items-center">
              <span className="font-medium text-sm text-white mr-2">{username}</span>
              <span className="text-xs text-gray-400">{formattedTime}</span>
            </div>
          </div>

          {/* Message Content */}
          <div className="text-white whitespace-pre-wrap break-words">
            {isLocked ? (
              <div className="flex flex-col items-center text-center p-4">
                <p className="text-gray-400 mb-3">This message is locked.</p>
                <button
                  onClick={onUnlock}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded transition-colors"
                >
                  Unlock for {tokenCost} tokens
                </button>
              </div>
            ) : isTyping ? (
              <div className="flex space-x-2 items-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            ) : (
              content
            )}
          </div>
        </div>

        {/* Message Actions */}
        {role === 'assistant' && !isLocked && !isTyping && (
          <div className={`
            ${(showActions || isMobile) ? 'opacity-100' : 'opacity-0'} 
            transition-opacity duration-200 mt-2 flex justify-end space-x-2
          `}>
            {onCopy && (
              <button
                onClick={onCopy}
                className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 py-1 px-2 rounded"
                aria-label="Copy message"
              >
                Copy
              </button>
            )}
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 py-1 px-2 rounded"
                aria-label="Regenerate response"
              >
                Regenerate
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="text-xs bg-red-900 hover:bg-red-800 text-gray-300 py-1 px-2 rounded"
                aria-label="Delete message"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
