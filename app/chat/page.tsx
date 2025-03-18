'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatWindow from '@/components/chat/ChatWindow';
import PersonaSelector from '@/components/chat/PersonaSelector';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ChatLimitReachedPrompt from '@/components/payment/ChatLimitReachedPrompt';

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [showPersonaSelector, setShowPersonaSelector] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showLimitPrompt, setShowLimitPrompt] = useState(false);
  const [chatLimitInfo, setChatLimitInfo] = useState({
    currentTier: 'free',
    currentCount: 0,
    limit: 1
  });
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Effect to prevent body scrolling when sidebar is open on mobile
  useEffect(() => {
    if (isMobileSidebarOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isMobileSidebarOpen]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!session) {
    return null; // This will be handled by the useEffect
  }

  const handleNewChat = () => {
    setActiveChat(null);
    setShowPersonaSelector(true);
    // Close mobile sidebar if open
    setIsMobileSidebarOpen(false);
  };

  const handleSelectChat = (chatId: string) => {
    setActiveChat(chatId);
    // Close mobile sidebar after selection
    setIsMobileSidebarOpen(false);
  };

  const handlePersonaSelect = async (personaId: string) => {
    try {
      setIsCreatingChat(true);
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ personaId }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        if (data.code === 'CHAT_LIMIT_REACHED') {
          setChatLimitInfo({
            currentTier: data.subscriptionTier || 'free',
            currentCount: data.currentCount || 0,
            limit: data.limit || 1
          });
          setShowLimitPrompt(true);
          setShowPersonaSelector(false);
          return;
        }
        
        throw new Error(data.error || 'Failed to create new chat');
      }

      setActiveChat(data.id);
      setShowPersonaSelector(false);
    } catch (error) {
      console.error('Error creating new chat:', error);
      toast.error('Failed to create new chat. Please try again.');
    } finally {
      setIsCreatingChat(false);
    }
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full overflow-hidden">
      {/* Mobile sidebar toggle button */}
      <button
        aria-label="Toggle chat sidebar"
        className="md:hidden fixed top-4 left-4 z-50 bg-midnight-lighter text-primary p-2 rounded-md border border-primary/50 hover:bg-primary hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-dark hamburger-button"
        onClick={toggleMobileSidebar}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Dark overlay for mobile when sidebar is open */}
      {isMobileSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - with proper positioning and visibility using proper Tailwind classes */}
      <aside 
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 md:w-64 h-full bg-midnight
                   transform transition-transform duration-300 ease-in-out
                   ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                   pt-safe pb-safe`}
      >
        <ChatSidebar 
          activeChat={activeChat} 
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
        />
      </aside>
      
      {/* Main content area - always takes remaining space using Tailwind's flex */}
      <main className="flex-1 h-full w-full overflow-hidden pt-safe pb-safe">
        {showPersonaSelector ? (
          <PersonaSelector 
            onSelect={handlePersonaSelect} 
            onCancel={() => setShowPersonaSelector(false)}
            isLoading={isCreatingChat}
          />
        ) : activeChat ? (
          <ChatWindow chatId={activeChat} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-midnight to-secondary-light p-4">
            <h2 className="text-3xl font-semibold text-primary neon-text mb-6">
              Welcome to OBAI
            </h2>
            <p className="text-gray-400 mb-8 max-w-md text-center">
              Start a new conversation by selecting a persona to chat with
            </p>
            <button
              onClick={handleNewChat}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors border border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-dark"
            >
              New Chat
            </button>
          </div>
        )}
        
        {showLimitPrompt && (
          <ChatLimitReachedPrompt
            currentTier={chatLimitInfo.currentTier}
            currentCount={chatLimitInfo.currentCount}
            limit={chatLimitInfo.limit}
            onClose={() => setShowLimitPrompt(false)}
          />
        )}
      </main>
    </div>
  );
}
