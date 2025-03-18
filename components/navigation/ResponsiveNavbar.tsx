'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import useResponsive from '@/lib/hooks/useResponsive';
import ResponsiveContainer from '@/components/layout/ResponsiveContainer';

type NavLink = {
  href: string;
  label: string;
  icon?: React.ReactNode;
  mobileOnly?: boolean;
  desktopOnly?: boolean;
};

type ResponsiveNavbarProps = {
  links: NavLink[];
  logo?: React.ReactNode;
  actions?: React.ReactNode;
};

export default function ResponsiveNavbar({ links, logo, actions }: ResponsiveNavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const { data: session } = useSession();
  const { isMobile, isTablet } = useResponsive();
  
  // Close mobile menu when navigating or screen size changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname, isMobile, isTablet]);

  // Handle body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      // Prevent body scrolling when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore scrolling when menu is closed
      document.body.style.overflow = '';
    }
    
    return () => {
      // Cleanup
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle escape key to close menu
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  // Filter links based on device type and authentication status
  const filteredLinks = links.filter(link => {
    // Skip links that should only appear on desktop when on mobile
    if (isMobile && link.desktopOnly) return false;
    
    // Skip links that should only appear on mobile when on desktop
    if (!isMobile && link.mobileOnly) return false;

    return true;
  });

  return (
    <nav className="bg-midnight-darker text-white sticky top-0 z-50 shadow-md">
      <ResponsiveContainer>
        <div className="py-3 flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center">
            {logo ? (
              <Link href="/" className="flex items-center" aria-label="Home">
                {logo}
              </Link>
            ) : (
              <Link href="/" className="text-xl font-bold" aria-label="Home">
                OBAI
              </Link>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {filteredLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-midnight-lighter hover:text-white transition-colors ${
                  pathname === link.href
                    ? 'bg-midnight-lighter text-white'
                    : 'text-gray-300'
                }`}
                aria-current={pathname === link.href ? 'page' : undefined}
              >
                {link.icon && <span className="mr-2">{link.icon}</span>}
                {link.label}
              </Link>
            ))}
            {actions && <div className="ml-4">{actions}</div>}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            {actions && <div className="mr-4">{actions}</div>}
            <button
              ref={buttonRef}
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="relative z-50 inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-white hover:bg-midnight-lighter focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-expanded={isOpen}
              aria-label={isOpen ? 'Close main menu' : 'Open main menu'}
            >
              <span className="sr-only">{isOpen ? 'Close main menu' : 'Open main menu'}</span>
              
              {/* Animated hamburger icon */}
              <div className="w-6 h-6 relative">
                <span 
                  className={`absolute h-0.5 w-full bg-current transform transition-all duration-300 ease-in-out ${
                    isOpen ? 'rotate-45 top-3' : 'rotate-0 top-1'
                  }`}
                />
                <span 
                  className={`absolute h-0.5 w-full bg-current transform transition-all duration-300 ease-in-out ${
                    isOpen ? 'opacity-0' : 'opacity-100'
                  } top-3`}
                />
                <span 
                  className={`absolute h-0.5 w-full bg-current transform transition-all duration-300 ease-in-out ${
                    isOpen ? '-rotate-45 top-3' : 'rotate-0 top-5'
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </ResponsiveContainer>

      {/* Mobile Menu Overlay */}
      <div 
        className={`md:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Menu Panel */}
      <div
        ref={menuRef}
        className={`md:hidden fixed right-0 top-0 w-full max-w-xs h-full bg-midnight-darker z-40 shadow-xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!isOpen}
      >
        {/* Menu Header */}
        <div className="p-4 border-b border-midnight-darker flex justify-between items-center">
          <h2 className="text-xl font-bold">Menu</h2>
        </div>
        
        {/* Menu Links */}
        <div className="p-4 overflow-y-auto h-full">
          <div className="space-y-2">
            {filteredLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-2 rounded-md text-base font-medium hover:bg-midnight-lighter hover:text-white transition-colors ${
                  pathname === link.href
                    ? 'bg-midnight-lighter text-white'
                    : 'text-gray-300'
                }`}
                aria-current={pathname === link.href ? 'page' : undefined}
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center">
                  {link.icon && <span className="mr-3">{link.icon}</span>}
                  {link.label}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
