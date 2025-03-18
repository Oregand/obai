'use client';

import { Message } from '@prisma/client';
import { RefObject } from 'react';
import ReactMarkdown from 'react-markdown';

interface MessageListProps {
  messages: Message[];
  personaName: string;
  personaImageUrl?: string | null;
  messagesEndRef: RefObject<HTMLDivElement>;
}

export default function MessageList({
  messages,
  personaName,
  personaImageUrl,
  messagesEndRef,
}: MessageListProps) {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-3xl mb-4">👋</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Start chatting with {personaName}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
            Send a message to begin your conversation. The AI will respond based on its persona.
          </p>
        </div>
      )}

      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={`max-w-[80%] rounded-lg p-4 ${
              message.role === 'user'
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
            }`}
          >
            <div className="flex items-center space-x-2 mb-1">
              {message.role !== 'user' && (
                <div className="flex-shrink-0 w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  {personaImageUrl ? (
                    <img
                      src={personaImageUrl}
                      alt={personaName}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <span className="text-xs text-gray-600 dark:text-gray-300">
                      {personaName.charAt(0)}
                    </span>
                  )}
                </div>
              )}
              <span className="font-medium">
                {message.role === 'user' ? 'You' : personaName}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatTime(message.createdAt)}
              </span>
            </div>

            <div className="prose dark:prose-invert prose-sm max-w-none break-words">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>

            {message.isLocked && (
              <div className="mt-2 flex items-center justify-end">
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                  <svg
                    className="w-3 h-3 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  Locked message - Upgrade to view
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
