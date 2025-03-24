'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import LoadingSpinner from '../ui/LoadingSpinner';
import MessageInput from './MessageInput';
import MessageBox from './MessageBox';
import MessageTypingIndicator from './MessageTypingIndicator';
import ChatHeader from './ChatHeader';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

interface ChatWindowProps {
  chatId: string;
}

export default function ChatWindow({ chatId }: ChatWindowProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatInfo, setChatInfo] = useState<{ title: string; persona: { name: string; imageUrl?: string } } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Function to fetch chat information separately if needed
  const fetchChatInfo = async () => {
    try {
      const response = await fetch(`/api/chat/${chatId}`);
      if (!response.ok) throw new Error('Failed to fetch chat info');
      
      const data = await response.json();
      setChatInfo({
        title: data.title || 'Chat',
        persona: {
          name: data.persona?.name || 'Assistant',
          imageUrl: data.persona?.imageUrl
        }
      });
    } catch (error) {
      console.error('Error fetching chat info:', error);
      // Don't set error state here, as we can still show messages
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Ensure proper loading of chat and messages
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Clear any previous messages when changing chats
        setMessages([]);
        setChatInfo(null);
        
        // Fetch messages and chat info
        const response = await fetch(`/api/chat/${chatId}/messages`);
        if (!response.ok) throw new Error('Failed to fetch messages');
        
        const data = await response.json();
        
        // Handle the response format
        if (data.messages && Array.isArray(data.messages)) {
          setMessages(data.messages);
          
          // Extract and set chat info if available
          if (data.chat) {
            setChatInfo({
              title: data.chat.title || 'Chat',
              persona: {
                name: data.chat.persona?.name || 'Assistant',
                imageUrl: data.chat.persona?.imageUrl
              }
            });
          }
        } else if (Array.isArray(data)) {
          // Legacy format - just an array of messages
          setMessages(data);
          // Try to get chat info separately
          fetchChatInfo();
        } else {
          console.error('Unexpected API response format', data);
          setError('Unexpected API response format');
        }
      } catch (error) {
        console.error('Error fetching chat data:', error);
        setError('Failed to load chat. Please try refreshing.');
      } finally {
        setIsLoading(false);
      }
    };

    if (chatId) {
      fetchData();
    }
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !chatId || !session?.user) return;
    
    try {
      setIsSending(true);
      
      // Optimistically update the UI
      const tempId = `temp-${Date.now()}`;
      const tempMessage: Message = {
        id: tempId,
        role: 'user',
        content,
        createdAt: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, tempMessage]);
      
      // Send the message to the server
      const response = await fetch(`/api/chat/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      
      if (!response.ok) throw new Error('Failed to send message');
      
      const data = await response.json();
      
      // Replace the temp message with the real one
      setMessages(prev => {
        const updatedMessages = prev.filter(msg => msg.id !== tempId);
        return [...updatedMessages, data.userMessage, data.assistantMessage];
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
      
      // Remove the temp message
      setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp-')));
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-light transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden chat-container">
      {chatInfo && <ChatHeader chatTitle={chatInfo.title} persona={chatInfo.persona} onMenuClick={() => {}} />}
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBox
            key={message.id}
            role={message.role}
            content={message.content}
            timestamp={message.createdAt}
          />
        ))}
        
        {isSending && <MessageTypingIndicator />}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <MessageInput onSendMessage={handleSendMessage} disabled={isSending} />
      </div>
    </div>
  );
}
