'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Link from 'next/link';

export default function PersonaCreateRouter() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subscriptionTier, setSubscriptionTier] = useState<string>('free');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/persona/create');
      return;
    }

    if (status === 'authenticated') {
      // Fetch user subscription info
      fetch('/api/user/subscription')
        .then(res => res.json())
        .then(data => {
          setSubscriptionTier(data.tier);
          setLoading(false);

          // Redirect based on subscription tier
          if (data.tier === 'free') {
            toast.error('Persona creation requires a premium subscription');
            router.push('/subscriptions');
          } else if (data.tier === 'basic') {
            toast.error('Persona creation requires at least a premium subscription');
            router.push('/subscriptions');
          } else if (data.tier === 'premium' || data.tier === 'vip') {
            // Premium users are redirected to guided creation
            // VIP users see the options page below
            if (data.tier === 'premium') {
              router.push('/persona/create/guided');
            } else if (data.tier === 'vip') {
              // Show options for VIP users
              setLoading(false);
            }
          }
        })
        .catch(error => {
          console.error('Error fetching subscription:', error);
          setLoading(false);
          toast.error('Error checking subscription status');
        });
    }
  }, [status, router]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Only VIP users see this page, others are redirected
  if (subscriptionTier === 'vip') {
    return (
      <div className="min-h-screen bg-midnight-DEFAULT py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Breadcrumbs 
              items={[
                { label: 'Personas', href: '/persona' },
                { label: 'Create' }
              ]}
            />
            <Link href="/persona">
              <button className="flex items-center text-white opacity-70 hover:opacity-100 hover:text-primary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Personas
              </button>
            </Link>
          </div>
          
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-primary neon-text mb-2">
              Create Your Persona
            </h1>
            <p className="text-white opacity-70 max-w-2xl mx-auto">
              Choose your preferred method for creating a custom persona
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Guided Creation Option */}
            <div 
              className="bg-midnight-lighter rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
              onClick={() => router.push('/persona/create/guided')}
            >
              <div className="p-6">
                <h2 className="text-2xl font-bold text-primary mb-3">Guided Creation</h2>
                <p className="text-white opacity-80 mb-4">
                  Create your persona using an intuitive step-by-step interface with predefined options
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-2 text-white">Simple user interface</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-2 text-white">Predefined personality traits</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-2 text-white">Optimized prompt generation</span>
                  </li>
                </ul>
                <button className="w-full py-2 px-4 bg-primary text-white rounded hover:bg-primary-light transition-colors">
                  Start Guided Creation
                </button>
              </div>
            </div>
            
            {/* Advanced Creation Option */}
            <div 
              className="bg-midnight-lighter rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
              onClick={() => router.push('/persona/create/advanced')}
            >
              <div className="p-6">
                <h2 className="text-2xl font-bold text-primary mb-3">Advanced Creation</h2>
                <p className="text-white opacity-80 mb-4">
                  Full creative control with direct access to system prompt editing
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-2 text-white">Complete customization</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-2 text-white">Direct system prompt editing</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-2 text-white">Advanced control over behavior</span>
                  </li>
                </ul>
                <button className="w-full py-2 px-4 bg-primary text-white rounded hover:bg-primary-light transition-colors">
                  Start Advanced Creation
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
