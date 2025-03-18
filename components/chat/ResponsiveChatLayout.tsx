'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import useResponsive from '@/lib/hooks/useResponsive';

type ResponsiveChatLayoutProps = {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  header: React.ReactNode;
  isSidebarOpen?: boolean;
  onSidebarToggle?: (isOpen: boolean) => void;
};

export default function ResponsiveChatLayout({
  children,
  sidebar,
  header,
  isSidebarOpen: externalIsSidebarOpen,
  onSidebarToggle,
}: ResponsiveChatLayoutProps) {
  // Use external control if provided, otherwise manage state internally
  const [internalIsSidebarOpen, setInternalIsSidebarOpen] = useState(true);
  
  const isSidebarOpen = externalIsSidebarOpen !== undefined 
    ? externalIsSidebarOpen 
    : internalIsSidebarOpen;
  
  const toggleSidebar = (isOpen: boolean) => {
    if (onSidebarToggle) {
      onSidebarToggle(isOpen);
    } else {
      setInternalIsSidebarOpen(isOpen);
    }
  };

  const sidebarRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const { isMobile, isTablet } = useResponsive();
  const pathname = usePathname();

  // Automatically close sidebar on mobile when navigating
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      toggleSidebar(false);
    }
  }, [pathname, isMobile, isSidebarOpen]);

  // Automatically close sidebar on mobile/tablet and open on desktop
  useEffect(() => {
    if (isMobile || isTablet) {
      toggleSidebar(false);
    } else {
      toggleSidebar(true);
    }
  }, [isMobile, isTablet]);
  
  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        (isMobile || isTablet) &&
        isSidebarOpen &&
        sidebarRef.current &&
        toggleButtonRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        !toggleButtonRef.current.contains(event.target as Node)
      ) {
        toggleSidebar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarOpen, isMobile, isTablet]);

  // Handle escape key to close sidebar on mobile
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && (isMobile || isTablet) && isSidebarOpen) {
        toggleSidebar(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isSidebarOpen, isMobile, isTablet]);

  // Handle body overflow
  useEffect(() => {
    if ((isMobile || isTablet) && isSidebarOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isSidebarOpen, isMobile, isTablet]);

  // Calculate sidebar width based on screen size
  const sidebarWidthClass = isMobile || isTablet
    ? 'w-3/4 max-w-xs' // 75% width on mobile, with a maximum width
    : isSidebarOpen
      ? 'w-72 lg:w-80 xl:w-96' // Fixed width on desktop when open
      : 'w-0'; // No width when closed on desktop

  return (
    <div className="flex flex-col h-screen bg-midnight-darker overflow-hidden">
      {/* Mobile Header - Only visible on mobile */}
      <div className="md:hidden">
        {header}
      </div>
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar Overlay - Only on mobile/tablet */}
        {isSidebarOpen && (isMobile || isTablet) && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300"
            onClick={() => toggleSidebar(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <aside 
          ref={sidebarRef}
          className={`
            ${(isMobile || isTablet) ? 'fixed inset-y-0 left-0' : 'relative'}
            ${sidebarWidthClass}
            z-40
            transform transition-all duration-300 ease-in-out
            ${(isMobile || isTablet) ? (isSidebarOpen ? 'translate-x-0' : '-translate-x-full') : ''}
            bg-midnight-darker border-r border-midnight-darker
            overflow-y-auto flex-shrink-0
          `}
          aria-hidden={!isSidebarOpen}
        >
          {/* Desktop Header - Only visible inside sidebar on desktop */}
          <div className="hidden md:block sticky top-0 z-10 bg-midnight-darker">
            {header}
          </div>
          
          {/* Sidebar Content */}
          <div className="h-full w-full">
            {sidebar}
          </div>
        </aside>

        {/* Main Chat Area */}
        <main 
          className={`
            flex-1 flex flex-col h-full overflow-hidden bg-midnight
            transition-all duration-300 ease-in-out
            ${(isMobile || isTablet) ? 'w-full' : isSidebarOpen ? 'ml-0' : 'ml-0'}
          `}
        >
          {/* Chat Content with Menu Toggle Button */}
          <div className="flex-1 overflow-hidden relative">
            {/* Menu Toggle Button */}
            <button
              ref={toggleButtonRef}
              onClick={() => toggleSidebar(!isSidebarOpen)}
              className="absolute top-4 left-4 z-20 p-2 bg-midnight-lighter text-white rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
              style={{
                // On desktop, move the button based on sidebar open/close state
                left: (!isMobile && !isTablet && isSidebarOpen) ? '1rem' : '1rem',
              }}
            >
              <div className="w-5 h-5 relative">
                <span 
                  className={`absolute h-0.5 w-full bg-current transform transition-all duration-300 ease-in-out ${
                    isSidebarOpen ? 'rotate-45 top-2.5' : 'rotate-0 top-1'
                  }`}
                />
                <span 
                  className={`absolute h-0.5 w-full bg-current transform transition-all duration-300 ease-in-out ${
                    isSidebarOpen ? 'opacity-0' : 'opacity-100'
                  } top-2.5`}
                />
                <span 
                  className={`absolute h-0.5 w-full bg-current transform transition-all duration-300 ease-in-out ${
                    isSidebarOpen ? '-rotate-45 top-2.5' : 'rotate-0 top-4'
                  }`}
                />
              </div>
            </button>
            
            {/* Main Content */}
            <div className="h-full w-full pt-16 px-4">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
