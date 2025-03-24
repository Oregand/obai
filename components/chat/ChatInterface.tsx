'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ChatSidebar from './ChatSidebar';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import PersonaSelector from './PersonaSelector';
import { Chat, Message, Persona } from '@prisma/client';

type ChatWithPersona = Chat & {
  persona: Persona;
};

interface ChatInterfaceProps {
  initialChat: ChatWithPersona | null;
  personas: Persona[];
  userChats: ChatWithPersona[];
  userId: string;
}

export default function ChatInterface({ initialChat, personas, userChats, userId }: ChatInterfaceProps) {
  const router = useRouter();
  const [currentChat, setCurrentChat] = useState<ChatWithPersona | null>(initialChat);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentChat) {
      fetchMessages(currentChat.id);
    }
  }, [currentChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chat/${chatId}/messages`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!currentChat || !content.trim()) return;

    setIsLoading(true);

    try {
      // First save the user message
      const userMessage = await fetch(`/api/chat/${currentChat.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          role: 'user',
        }),
      });

      const userMessageData = await userMessage.json();
      setMessages((prev) => [...prev, userMessageData]);

      // Then get the AI response
      const aiResponse = await fetch(`/api/chat/${currentChat.id}/ai-response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const aiMessageData = await aiResponse.json();
      setMessages((prev) => [...prev, aiMessageData]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewChat = async (personaId: string) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personaId,
        }),
      });

      const newChat = await response.json();
      setCurrentChat(newChat);
      setMessages([]);
      router.refresh();
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const handleSelectChat = (chatId: string) => {
    const selectedChat = userChats.find((chat) => chat.id === chatId) || null;
    setCurrentChat(selectedChat);
    setIsSidebarOpen(false);
  };

  const handleChangePersona = (personaId: string) => {
    handleCreateNewChat(personaId);
  };

  if (!initialChat) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <ChatSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        chats={userChats.map(({ updatedAt, ...rest }) => ({
          ...rest,
          updatedAt: updatedAt.toISOString(),
        }))}
        personas={personas}
        onSelectChat={handleSelectChat}
        onNewChat={() => handleCreateNewChat(personas[0]?.id || '')}
        currentChatId={currentChat?.id}
      />

      <div className="flex flex-col flex-1 h-full overflow-hidden">
        <ChatHeader
          chatTitle={currentChat?.title || 'New Chat'}
          persona={currentChat?.persona || { name: 'AI Assistant' }}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <div className="flex-1 overflow-hidden flex flex-col">
          <MessageList 
            messages={messages} 
            personaName={currentChat?.persona.name || 'AI Assistant'}
            personaImageUrl={currentChat?.persona.imageUrl}
            messagesEndRef={messagesEndRef}
          />

          <div className="px-4 pb-4 relative">
            <PersonaSelector
              personas={personas}
              currentPersonaId={currentChat?.personaId}
              onSelect={handleChangePersona}
            />
            
            <MessageInput 
              onSendMessage={handleSendMessage} 
              isLoading={isLoading} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
