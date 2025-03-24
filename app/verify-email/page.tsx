'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') || '';
  
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  
  useEffect(() => {
    if (!token) {
      setIsVerifying(false);
      setVerificationResult({
        success: false,
        message: 'No verification token provided'
      });
      return;
    }
    
    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/user/verify-email?token=${token}`);
        const data = await response.json();
        
        setIsVerifying(false);
        
        if (response.ok) {
          setVerificationResult({
            success: true,
            message: data.message || 'Email verified successfully'
          });
          
          // Redirect after a delay
          setTimeout(() => {
            router.push('/profile');
          }, 3000);
        } else {
          setVerificationResult({
            success: false,
            message: data.error || 'Failed to verify email'
          });
        }
      } catch (error) {
        setIsVerifying(false);
        setVerificationResult({
          success: false,
          message: 'An error occurred while verifying your email'
        });
      }
    };
    
    verifyEmail();
  }, [token, router]);
  
  return (
    <div className="min-h-screen bg-midnight-DEFAULT text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-secondary-dark rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-primary mb-6">Email Verification</h1>
        
        {isVerifying ? (
          <div className="flex flex-col items-center">
            <LoadingSpinner size="large" />
            <p className="mt-4">Verifying your email address...</p>
          </div>
        ) : (
          <div>
            {verificationResult?.success ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-xl font-semibold">{verificationResult.message}</p>
                <p className="text-white opacity-70">You will be redirected to your profile shortly.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-xl font-semibold">{verificationResult?.message}</p>
                <p className="text-white opacity-70">Please try again or contact support if the problem persists.</p>
              </div>
            )}
            
            <div className="mt-8">
              <Link href="/profile">
                <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-light transition-colors">
                  Go to Profile
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
