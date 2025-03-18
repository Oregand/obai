'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import LoadingSpinner from '../ui/LoadingSpinner';

export default function CreditsDisplay() {
  const { data: session } = useSession();
  const [credits, setCredits] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close tooltip when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        tooltipRef.current && 
        !tooltipRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsTooltipOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [tooltipRef, buttonRef]);

  // Fetch user credits when component mounts
  useEffect(() => {
    const fetchCredits = async () => {
      if (!session?.user) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/credits');
        
        if (!response.ok) {
          throw new Error('Failed to fetch credits');
        }
        
        const data = await response.json();
        setCredits(data.credits);
      } catch (err) {
        setError('Error fetching credits');
        console.error('Error fetching credits:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCredits();
  }, [session]);

  // If user is not authenticated
  if (!session?.user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center px-3 py-1 text-sm text-white bg-secondary-light rounded-full">
        <LoadingSpinner size="small" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center px-3 py-1 text-sm text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900 bg-opacity-50 rounded-full">
        Error
      </div>
    );
  }

  return (
    <div className="relative">
      <button 
        ref={buttonRef}
        onClick={() => setIsTooltipOpen(!isTooltipOpen)}
        className="flex items-center gap-1.5 px-3 py-1 text-sm font-medium text-white bg-secondary-light hover:bg-secondary dark:bg-secondary hover:bg-secondary-light rounded-full transition-colors"
      >
        <span className="text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
          </svg>
        </span>
        {credits?.toFixed(2) || '0.00'}
      </button>
      
      {isTooltipOpen && (
        <div 
          ref={tooltipRef}
          className="absolute right-0 mt-2 w-64 p-4 bg-midnight-lighter dark:bg-midnight-DEFAULT rounded-lg shadow-lg border border-primary/30 z-50"
        >
          <div className="absolute right-2 top-2">
            <button 
              onClick={() => setIsTooltipOpen(false)}
              className="text-white/50 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <h3 className="text-sm font-semibold text-white mb-2">OBAI Credits</h3>
          <p className="text-xs text-white opacity-70 mb-3">
            Credits are used for special features like tipping personas and unlocking premium content.
          </p>
          <button
            onClick={() => window.location.href = '/credits/purchase'}
            className="w-full py-2 px-3 text-xs font-medium text-white bg-primary hover:bg-primary-light rounded-md"
          >
            Add Credits
          </button>
        </div>
      )}
    </div>
  );
}
