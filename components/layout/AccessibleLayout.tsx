import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

type AccessibleLayoutProps = {
  children: React.ReactNode;
  title?: string;
  showSkipLink?: boolean;
};

export default function AccessibleLayout({ 
  children, 
  title = 'OBAI',
  showSkipLink = true 
}: AccessibleLayoutProps) {
  const router = useRouter();
  
  // Determine if we're on a page that should show the skip link
  const shouldShowSkipLink = showSkipLink && router.pathname !== '/';
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Skip to content link - only visible when focused */}
      {shouldShowSkipLink && (
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-blue-600 focus:text-white focus:top-0 focus:left-0"
          aria-label="Skip to main content"
        >
          Skip to main content
        </a>
      )}
      
      {/* Main content area with proper ID for skip link */}
      <main id="main-content" className="flex-grow">
        {/* Use the title if provided */}
        {title && (
          <h1 className="sr-only">{title}</h1>
        )}
        {children}
      </main>
      
      {/* Accessibility statement link in footer */}
      <footer className="py-6 bg-gray-800 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p>© {new Date().getFullYear()} OBAI. All rights reserved.</p>
            </div>
            <div className="flex space-x-6">
              <Link 
                href="/accessibility" 
                className="hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 rounded"
              >
                Accessibility
              </Link>
              <Link 
                href="/privacy" 
                className="hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 rounded"
              >
                Privacy Policy
              </Link>
              <Link 
                href="/terms" 
                className="hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 rounded"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
