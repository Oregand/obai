'use client';

import React, { useState, useRef, useEffect } from 'react';
import useResponsive from '@/lib/hooks/useResponsive';

type ResponsiveMessageInputProps = {
  onSendMessage: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
};

export default function ResponsiveMessageInput({
  onSendMessage,
  placeholder = 'Type a message...',
  disabled = false,
  isLoading = false,
}: ResponsiveMessageInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isMobile } = useResponsive();

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  // Handle message submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim() && !disabled && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit with Enter (but not with Shift+Enter)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="p-3 sm:p-4 bg-midnight-darker border-t border-midnight-light">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="flex items-end">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || isLoading}
              className="w-full bg-midnight-light text-white rounded-lg py-3 px-4 pr-12 resize-none overflow-auto focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={1}
              style={{ maxHeight: '200px' }}
              aria-label="Message input"
            />
            
            {/* Character count - shown when nearing limit */}
            {message.length > 1800 && (
              <div className={`absolute bottom-2 left-4 text-xs ${message.length > 2000 ? 'text-red-400' : 'text-gray-400'}`}>
                {message.length}/2000
              </div>
            )}
          </div>
          
          <button
            type="submit"
            disabled={!message.trim() || disabled || isLoading}
            className={`
              ml-2 p-3 rounded-lg
              ${message.trim() && !disabled && !isLoading
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'}
              focus:outline-none focus:ring-2 focus:ring-blue-500
              transition-colors
            `}
            aria-label="Send message"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            )}
          </button>
        </form>
        
        {/* Mobile guidance text */}
        {isMobile && (
          <p className="text-xs text-gray-400 mt-2 text-center">
            Press enter to send, shift+enter for a new line
          </p>
        )}
      </div>
    </div>
  );
}
