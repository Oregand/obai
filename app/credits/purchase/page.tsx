'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This is a redirect page to consolidate credits and tokens into a single system
export default function CreditsRedirectPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the tokens purchase page
    router.replace('/tokens/purchase');
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-midnight-DEFAULT">
      <div className="text-center">
        <h1 className="text-2xl font-medium text-white mb-4">Redirecting...</h1>
        <p className="text-white opacity-70">
          Taking you to our token purchase page.
        </p>
      </div>
    </div>
  );
}
