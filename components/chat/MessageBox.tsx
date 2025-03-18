'use client';

import ReactMarkdown from 'react-markdown';

interface MessageBoxProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function MessageBox({ role, content, timestamp }: MessageBoxProps) {
  // Add safety check for timestamp
  const formatTimestamp = (timestamp: string) => {
    try {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      // Check if date is valid
      if (isNaN(date.getTime())) return '';
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return '';
    }
  };

  return (
    <div
      className={`flex ${
        role === 'user' ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`max-w-[80%] rounded-lg p-3 ${
          role === 'user'
            ? 'bg-primary text-white'
            : 'bg-gray-100 dark:bg-gray-800 dark:text-white'
        }`}
      >
        <div className="prose dark:prose-invert max-w-none break-words overflow-x-hidden">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
        <div
          className={`text-xs mt-1 ${
            role === 'user'
              ? 'text-white/70'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          {formatTimestamp(timestamp)}
        </div>
      </div>
    </div>
  );
}
