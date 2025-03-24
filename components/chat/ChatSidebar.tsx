'use client';

import { useState, useEffect, useCallback } from 'react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import LoadingSpinner from '../ui/LoadingSpinner';

interface Chat {
  id: string;
  title: string;
  persona: {
    name: string;
    imageUrl?: string | null;
  };
  updatedAt: string;
}

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  balance: number;
  subscription: {
    plan: string;
    status: string;
    expiresAt: string | null;
    features: string[];
  };
}

interface ChatSidebarProps {
  activeChat?: string | null;
  currentChatId?: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  chats?: Chat[];
  personas?: any[];
}

export default function ChatSidebar({ 
  activeChat, 
  currentChatId, 
  onSelectChat, 
  onNewChat, 
  isOpen = false,
  onClose = () => {},
  chats: providedChats,
  personas = []
}: ChatSidebarProps) {
  // Use the active chat or current chat ID if provided
  const activeChatId = activeChat || currentChatId;
  const { data: session } = useSession();
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Function to fetch user profile info
  const fetchUserProfile = useCallback(async () => {
    try {
      setIsLoadingProfile(true);
      
      const response = await fetch('/api/user/profile/info');
      if (!response.ok) throw new Error('Failed to fetch user profile');
      
      const data = await response.json();
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // We don't set an error state here to avoid disrupting the UI
    } finally {
      setIsLoadingProfile(false);
    }
  }, []);

  // Function to fetch chats
  const fetchChats = useCallback(async () => {
    // If chats are provided as props, use those instead of fetching
    if (providedChats) {
      setChats(providedChats);
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/chat');
      if (!response.ok) throw new Error('Failed to fetch chats');
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setChats(data);
      } else {
        console.error('Unexpected data format:', data);
        setError('Invalid data format received');
        setChats([]);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      setError('Failed to load chats');
      setChats([]);
    } finally {
      setIsLoading(false);
    }
  }, [providedChats]);

  // Initial data loading
  useEffect(() => {
    if (session?.user?.id) {
      fetchChats();
      fetchUserProfile();
    }
  }, [session?.user?.id, fetchChats, fetchUserProfile]);

  // Refresh data when active chat changes
  useEffect(() => {
    if (session?.user?.id && activeChatId) {
      fetchChats();
    }
  }, [session?.user?.id, activeChatId, fetchChats]);

  // Periodically refresh user profile data (every 5 minutes)
  useEffect(() => {
    if (!session?.user?.id) return;
    
    const intervalId = setInterval(() => {
      fetchUserProfile();
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(intervalId);
  }, [session?.user?.id, fetchUserProfile]);

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!confirm('Are you sure you want to delete this chat?')) return;
    
    try {
      const response = await fetch(`/api/chat/${chatId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete chat');
      
      setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
      
      if (activeChatId === chatId) {
        onSelectChat('');
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      alert('Failed to delete chat. Please try again.');
    }
  };

  // Simple function to safely get the first letter of a string
  const getFirstLetter = (str: string | undefined | null): string => {
    if (!str) return '?';
    return str.charAt(0).toUpperCase();
  };

  // Simple function to safely get chat title
  const getChatTitle = (chat: Chat): string => {
    if (chat.title) return chat.title;
    if (chat.persona && chat.persona.name) return `Chat with ${chat.persona.name}`;
    return 'Untitled Chat';
  };

  // Simple function to safely get persona name
  const getPersonaName = (chat: Chat): string => {
    if (chat.persona && chat.persona.name) return chat.persona.name;
    return 'Assistant';
  };

  // Format the user's subscription plan for display
  const formatPlan = (plan: string): string => {
    if (!plan) return 'Free';
    return plan.charAt(0).toUpperCase() + plan.slice(1).toLowerCase();
  };

  // Format balance with commas for thousands
  const formatBalance = (balance: number): string => {
    return balance.toLocaleString();
  };

  return (
    <div className={`h-full flex flex-col bg-midnight text-white md:relative fixed inset-y-0 left-0 z-30 md:z-auto transition-transform transform ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      {/* Close button for mobile */}
      {isOpen && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 md:hidden text-white p-1 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Close sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
      
      {/* Header */}
      <div className="p-4 border-b border-primary/30 flex justify-between items-center">
        <h1 className="m-0 text-2xl font-bold text-primary neon-text">OBAI</h1>
        <button 
          onClick={onNewChat}
          className="bg-primary text-white border-none rounded px-4 py-2 cursor-pointer font-bold hover:bg-primary-light transition-colors focus:outline-none focus:ring-2 focus:ring-primary-dark"
          aria-label="Start new chat"
        >
          New Chat
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="flex justify-center items-center h-24">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="p-4 text-center text-white/70">
            {error}
            <button 
              onClick={fetchChats}
              className="block mx-auto mt-2 text-primary bg-transparent border-none underline cursor-pointer hover:text-primary-light focus:outline-none focus:ring-2 focus:ring-primary-dark rounded"
              aria-label="Retry loading chats"
            >
              Try Again
            </button>
          </div>
        ) : chats.length === 0 ? (
          <div className="p-4 text-center text-white/70">
            No chats yet. Start a new conversation!
          </div>
        ) : (
          <ul className="list-none p-0 m-0 flex flex-col gap-2">
            {chats.map((chat) => (
              <li key={chat.id} className="m-0 p-0">
                <div
                  onClick={() => onSelectChat(chat.id)}
                  className={`w-full text-left p-3 rounded flex items-center justify-between ${
                    activeChatId === chat.id 
                      ? 'bg-primary/10 border border-primary/30' 
                      : 'bg-transparent border border-transparent'
                  } cursor-pointer hover:bg-primary/5 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-dark`}
                  role="button"
                  tabIndex={0}
                  aria-label={`Select chat with ${getPersonaName(chat)}`}
                  onKeyDown={(e) => e.key === 'Enter' && onSelectChat(chat.id)}
                >
                  <div className="flex items-center max-w-[80%] overflow-hidden">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center mr-2 flex-shrink-0">
                      <span className="text-white font-bold">
                        {getFirstLetter(getPersonaName(chat))}
                      </span>
                    </div>
                    <div className="overflow-hidden">
                      <p className="m-0 text-sm font-medium text-white whitespace-nowrap overflow-hidden text-ellipsis">
                        {getChatTitle(chat)}
                      </p>
                      <p className="m-0 text-xs text-white/60 whitespace-nowrap overflow-hidden text-ellipsis">
                        {getPersonaName(chat)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteChat(chat.id, e)}
                    className="bg-transparent border-none text-white/50 cursor-pointer p-1 hover:text-white/80 transition-colors rounded focus:outline-none focus:ring-2 focus:ring-primary-dark"
                    aria-label={`Delete chat with ${getPersonaName(chat)}`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer - using sidebar-footer class */}
      <div className="sidebar-footer p-4">
        {/* User Profile */}
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold">
              {userProfile?.name?.[0] || session?.user?.name?.[0] || userProfile?.email?.[0]?.toUpperCase() || session?.user?.email?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="ml-3 overflow-hidden flex-1">
            <p className="m-0 text-sm font-medium text-white whitespace-nowrap overflow-hidden text-ellipsis">
              {userProfile?.name || session?.user?.name || 'User'}
            </p>
            <p className="m-0 text-xs text-white/60 whitespace-nowrap overflow-hidden text-ellipsis">
              {userProfile?.email || session?.user?.email || 'user@example.com'}
            </p>
          </div>
          <button
            onClick={() => signOut()}
            className="bg-transparent border-none text-white/70 cursor-pointer hover:text-white transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-primary-dark"
            aria-label="Sign out"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 16L21 12M21 12L17 8M21 12H7M13 16V17C13 18.6569 11.6569 20 10 20H6C4.34315 20 3 18.6569 3 17V7C3 5.34315 4.34315 4 6 4H10C11.6569 4 13 5.34315 13 7V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <Link href="/profile" className="text-decoration-none">
            <div className="flex items-center justify-center py-2 px-3 rounded border border-primary/30 text-primary text-sm cursor-pointer hover:bg-primary/10 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-dark">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
                <path d="M12 15C15.3137 15 18 12.3137 18 9C18 5.68629 15.3137 3 12 3C8.68629 3 6 5.68629 6 9C6 12.3137 8.68629 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2.90625 20.2491C3.82834 18.6531 5.1542 17.3278 6.75064 16.4064C8.34708 15.485 10.1579 15 12.0011 15C13.8444 15 15.6552 15.4851 17.2516 16.4065C18.848 17.3279 20.1739 18.6533 21.0959 20.2493" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Settings
            </div>
          </Link>
          <Link href="/tokens/purchase" className="text-decoration-none">
            <div className="flex items-center justify-center py-2 px-3 rounded border border-primary/30 text-primary text-sm cursor-pointer hover:bg-primary/10 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-dark">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
                <path d="M12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Tokens
            </div>
          </Link>
        </div>

        {/* Account Info */}
        <div className="mb-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-white/70">Balance:</span>
            {isLoadingProfile ? (
              <div className="h-4 flex items-center">
                <LoadingSpinner size="small" />
              </div>
            ) : (
              <span className="text-xs text-primary font-bold">
                {formatBalance(userProfile?.balance || 0)} tokens
              </span>
            )}
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-white/70">Plan:</span>
            {isLoadingProfile ? (
              <div className="h-4 flex items-center">
                <LoadingSpinner size="small" />
              </div>
            ) : (
              <span className="text-xs bg-primary/20 text-primary py-0.5 px-2 rounded font-medium">
                {formatPlan(userProfile?.subscription?.plan || 'Free')}
              </span>
            )}
          </div>
        </div>

        {/* Upgrade Link */}
        <Link href="/subscriptions" className="text-decoration-none">
          <div className="text-center text-xs text-primary cursor-pointer p-1 hover:text-primary-light transition-colors">
            Upgrade to Premium
          </div>
        </Link>
      </div>
    </div>
  );
}
