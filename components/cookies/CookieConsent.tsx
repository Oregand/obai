'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already given consent
    const hasConsent = localStorage.getItem('cookie-consent');
    if (!hasConsent) {
      setShowBanner(true);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem('cookie-consent', 'all');
    setShowBanner(false);
    // Enable analytics tracking
    window.location.reload();
  };

  const acceptEssential = () => {
    localStorage.setItem('cookie-consent', 'essential');
    setShowBanner(false);
    // Disable analytics tracking but allow essential cookies
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white z-50 shadow-lg" role="alert" aria-live="polite">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div className="mb-4 md:mb-0 md:mr-8">
            <h2 className="text-lg font-semibold mb-2">We value your privacy</h2>
            <p className="text-sm text-gray-300 mb-2">
              We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
            </p>
            <p className="text-sm text-gray-300">
              <Link href="/privacy" className="underline hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                Read our Privacy Policy
              </Link>
            </p>
          </div>
          <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:space-x-3">
            <button
              onClick={acceptEssential}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
              aria-label="Accept only essential cookies"
            >
              Essential Only
            </button>
            <button
              onClick={acceptAll}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Accept all cookies"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
