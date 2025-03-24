'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Link from 'next/link';
import Image from 'next/image';

export default function PersonaAnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  interface AnalyticsItem {
    personaId: string;
    name: string;
    description?: string;
    imageUrl?: string;
    usageCount: number;
    uniqueUsers?: number;
    messageCount?: number;
    avgSessionDuration?: number;
  }

  const [analytics, setAnalytics] = useState<AnalyticsItem[]>([]);
  const [userAnalytics, setUserAnalytics] = useState<AnalyticsItem[]>([]);
  const [view, setView] = useState('user'); // 'user' or 'global'
  const [subscriptionTier, setSubscriptionTier] = useState('free');

  // Fetch analytics data
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/persona/analytics');
      return;
    }

    if (status === 'authenticated') {
      // Fetch subscription info to check if user can see global stats
      fetch('/api/user/subscription')
        .then(res => res.json())
        .then(data => {
          setSubscriptionTier(data.tier);
          
          // Fetch user's persona usage data
          fetch('/api/persona/analytics?user=true')
            .then(res => res.json())
            .then(data => {
              setUserAnalytics(data);
              
              // If user is VIP, also fetch global analytics
              if (data.tier === 'vip') {
                fetch('/api/persona/analytics')
                  .then(res => res.json())
                  .then(globalData => {
                    setAnalytics(globalData);
                  })
                  .catch(error => {
                    console.error('Error fetching global analytics:', error);
                  });
              }
              
              setIsLoading(false);
            })
            .catch(error => {
              console.error('Error fetching user analytics:', error);
              setIsLoading(false);
              toast.error('Error loading analytics data');
            });
        })
        .catch(error => {
          console.error('Error fetching subscription:', error);
        });
    }
  }, [status, router]);

  // Format number with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Get displayed analytics based on current view
  const displayedAnalytics = view === 'user' ? userAnalytics : analytics;

  // Check if user can see global stats
  const canSeeGlobalStats = subscriptionTier === 'vip';

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight-DEFAULT py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Breadcrumbs 
            items={[
              { label: 'Personas', href: '/persona' },
              { label: 'Analytics' }
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
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary neon-text mb-2">Persona Analytics</h1>
          <p className="text-white opacity-70">
            Gain insights into persona usage and performance
          </p>
        </div>
        
        {/* View toggle */}
        {canSeeGlobalStats && (
          <div className="mb-6">
            <div className="flex space-x-2 bg-midnight-lighter inline-flex rounded-lg p-1">
              <button
                className={`px-4 py-2 rounded ${view === 'user' ? 'bg-primary text-white' : 'text-white opacity-70 hover:opacity-100'}`}
                onClick={() => setView('user')}
              >
                Your Usage
              </button>
              <button
                className={`px-4 py-2 rounded ${view === 'global' ? 'bg-primary text-white' : 'text-white opacity-70 hover:opacity-100'}`}
                onClick={() => setView('global')}
              >
                Global Stats
              </button>
            </div>
          </div>
        )}
        
        {/* Analytics content */}
        {displayedAnalytics.length > 0 ? (
          <>
            {/* Top Personas */}
            <div className="bg-midnight-lighter rounded-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-white mb-4">
                {view === 'user' ? 'Your Most Used Personas' : 'Most Popular Personas'}
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-4 py-3 text-left text-sm font-medium text-white opacity-70">Rank</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-white opacity-70">Persona</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-white opacity-70">Usage Count</th>
                      {view === 'global' && (
                        <th className="px-4 py-3 text-right text-sm font-medium text-white opacity-70">Unique Users</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {displayedAnalytics.map((item, index) => (
                      <tr key={item.personaId} className="border-b border-white/5 hover:bg-midnight">
                        <td className="px-4 py-4 text-white opacity-70 text-sm">{index + 1}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded bg-midnight-dark flex items-center justify-center mr-3">
                              {item.imageUrl ? (
                                <Image
                                  src={item.imageUrl}
                                  alt={item.name}
                                  width={40}
                                  height={40}
                                  className="rounded"
                                />
                              ) : (
                                <span className="text-white opacity-50 text-lg font-bold">
                                  {item.name?.charAt(0).toUpperCase() || 'P'}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="text-white font-medium">{item.name}</p>
                              <p className="text-white opacity-50 text-sm line-clamp-1">
                                {item.description}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-white font-medium">{formatNumber(item.usageCount)}</td>
                        {view === 'global' && (
                          <td className="px-4 py-4 text-right text-white font-medium">{formatNumber(item.uniqueUsers || 0)}</td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Usage Trends (VIP only) */}
            {view === 'global' && canSeeGlobalStats && (
              <div className="bg-midnight-lighter rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-6">Global Usage Trends</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-midnight-dark rounded-lg p-4">
                    <h3 className="text-white opacity-70 text-sm mb-1">Total Messages</h3>
                    <p className="text-3xl font-bold text-primary">
                      {formatNumber(displayedAnalytics.reduce((sum, item) => sum + (item.messageCount || 0), 0))}
                    </p>
                  </div>
                  
                  <div className="bg-midnight-dark rounded-lg p-4">
                    <h3 className="text-white opacity-70 text-sm mb-1">Total Unique Users</h3>
                    <p className="text-3xl font-bold text-primary">
                      {formatNumber(displayedAnalytics.reduce((sum, item) => sum + (item.uniqueUsers || 0), 0))}
                    </p>
                  </div>
                  
                  <div className="bg-midnight-dark rounded-lg p-4">
                    <h3 className="text-white opacity-70 text-sm mb-1">Average Session Duration</h3>
                    <p className="text-3xl font-bold text-primary">
                      {displayedAnalytics.length > 0 
                        ? (displayedAnalytics.reduce((sum, item) => sum + (item.avgSessionDuration || 0), 0) / displayedAnalytics.length).toFixed(1) + ' min'
                        : '0 min'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-midnight-lighter rounded-lg p-8 text-center">
            <div className="text-white opacity-50 text-lg mb-4">
              {view === 'user' 
                ? 'You haven\'t used any personas yet'
                : 'No analytics data available yet'
              }
            </div>
            
            <Link href="/chat">
              <button className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-light transition-colors">
                Start Chatting Now
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
