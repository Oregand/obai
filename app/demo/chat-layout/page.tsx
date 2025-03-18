'use client';

import React, { useState } from 'react';
import ResponsiveChatLayout from '@/components/chat/ResponsiveChatLayout';
import ResponsiveContainer from '@/components/layout/ResponsiveContainer';
import ResponsiveMessage from '@/components/chat/ResponsiveMessage';
import ResponsiveMessageInput from '@/components/chat/ResponsiveMessageInput';

export default function ChatLayoutDemo() {
  const [messages, setMessages] = useState([
    {
      id: '1',
      content: 'Welcome to the chat interface demo! This showcases the responsive left menu and message layout.',
      role: 'assistant',
      timestamp: new Date(Date.now() - 60000 * 5),
    },
    {
      id: '2',
      content: 'How does the responsive menu work?',
      role: 'user',
      timestamp: new Date(Date.now() - 60000 * 4),
    },
    {
      id: '3',
      content: 'The left menu automatically adapts to different screen sizes. On mobile, it slides in from the left when you tap the menu button. On desktop, it can be toggled to save space.\n\nTry resizing your browser window to see how it behaves!',
      role: 'assistant',
      timestamp: new Date(Date.now() - 60000 * 3),
    },
    {
      id: '4',
      content: 'What improvements were made to fix it?',
      role: 'user',
      timestamp: new Date(Date.now() - 60000 * 2),
    },
    {
      id: '5',
      content: '1. Improved position and sizing logic that adapts to various device sizes\n2. Better transitions for smoother animations\n3. Proper handling of content layout when sidebar opens/closes\n4. Fixed overlay for mobile devices\n5. Improved accessibility for keyboard navigation\n6. Added orientation support for landscape mode on mobile',
      role: 'assistant',
      timestamp: new Date(Date.now() - 60000),
    },
  ]);

  const handleSendMessage = (content: string) => {
    // Add user message
    const newUserMessage = {
      id: `user-${Date.now()}`,
      content,
      role: 'user',
      timestamp: new Date(),
    };
    setMessages([...messages, newUserMessage]);

    // Simulate assistant response after a delay
    setTimeout(() => {
      const newAssistantMessage = {
        id: `assistant-${Date.now()}`,
        content: `I received your message: "${content}"\n\nThis is a demo of the responsive chat interface. The left menu should now properly handle different screen sizes and device orientations.`,
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, newAssistantMessage]);
    }, 1000);
  };

  // Chat header component
  const ChatHeader = () => (
    <div className="p-3 bg-midnight-darker border-b border-midnight-darker flex items-center">
      <h1 className="text-xl font-bold text-white">Responsive Chat Demo</h1>
    </div>
  );

  // Chat sidebar component
  const ChatSidebar = () => (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-midnight-darker">
        <h2 className="text-lg font-medium text-white mb-2">Chat History</h2>
        <p className="text-gray-400 text-sm">
          This sidebar now properly responds to different screen sizes and orientations.
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-2">
          {[...Array(10)].map((_, i) => (
            <div 
              key={i} 
              className="p-3 bg-midnight-lighter bg-opacity-30 rounded-md cursor-pointer hover:bg-opacity-50 transition-all"
            >
              <p className="font-medium text-white">Chat Session {i + 1}</p>
              <p className="text-sm text-gray-400 truncate">
                {i % 2 === 0 ? 'You: ' : 'Assistant: '}
                Sample message preview for chat {i + 1}...
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <ResponsiveChatLayout
      header={<ChatHeader />}
      sidebar={<ChatSidebar />}
    >
      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ResponsiveMessage 
            key={message.id}
            id={message.id}
            content={message.content}
            role={message.role as any}
            timestamp={message.timestamp}
            username={message.role === 'user' ? 'You' : 'Assistant'}
            avatarUrl={message.role === 'assistant' ? 'https://i.pravatar.cc/300?img=68' : undefined}
            onCopy={() => {
              navigator.clipboard.writeText(message.content);
              alert('Message copied to clipboard!');
            }}
          />
        ))}
      </div>
      
      {/* Message Input */}
      <div className="p-4 border-t border-midnight-darker">
        <ResponsiveMessageInput 
          onSendMessage={handleSendMessage}
          placeholder="Type a message..."
        />
      </div>
    </ResponsiveChatLayout>
  );
}
