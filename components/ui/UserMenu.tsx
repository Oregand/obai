'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export default function UserMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef, buttonRef]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="rounded-full p-1 hover:bg-primary/10 transition-colors focus:outline-none"
        aria-label="User menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isMenuOpen && (
        <div 
          ref={menuRef}
          className="absolute right-0 mt-2 w-48 bg-secondary-dark border border-primary/30 rounded-md shadow-lg p-2 z-50"
        >
          <Link 
            href="/profile" 
            className="block px-4 py-2 text-gray-200 hover:bg-secondary-light hover:text-primary rounded-md transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Profile Settings
          </Link>
          <Link 
            href="/credits/purchase" 
            className="block px-4 py-2 text-gray-200 hover:bg-secondary-light hover:text-primary rounded-md transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Buy Credits
          </Link>
        </div>
      )}
    </div>
  );
}
