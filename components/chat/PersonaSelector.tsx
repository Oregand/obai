'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import LoadingSpinner from '../ui/LoadingSpinner';

interface Persona {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  isPublic: boolean;
}

interface PersonaSelectorProps {
  onSelect: (personaId: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function PersonaSelector({ onSelect, onCancel, isLoading = false }: PersonaSelectorProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [isLoadingPersonas, setIsLoadingPersonas] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'public' | 'custom'>('public');
  const [subscriptionTier, setSubscriptionTier] = useState<string>('free'); // Default to free

  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        const response = await fetch('/api/persona');
        if (!response.ok) throw new Error('Failed to fetch personas');
        
        const data = await response.json();
        setPersonas(data);
      } catch (error) {
        console.error('Error fetching personas:', error);
        setError('Failed to load personas. Please try again.');
      } finally {
        setIsLoadingPersonas(false);
      }
    };

    // Fetch subscription tier
    const fetchSubscription = async () => {
      try {
        const response = await fetch('/api/user/subscription');
        if (response.ok) {
          const data = await response.json();
          if (data && data.subscription && data.subscription.tier) {
            setSubscriptionTier(data.subscription.tier);
          }
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
        // Continue with default 'free' tier if subscription can't be fetched
      }
    };

    fetchPersonas();
    if (session?.user) {
      fetchSubscription();
    }
  }, [session?.user]);

  const filteredPersonas = personas.filter(persona => 
    (selectedTab === 'public' ? persona.isPublic : !persona.isPublic) &&
    (searchQuery === '' || 
     persona.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     persona.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreateCustomPersona = () => {
    // Redirect based on subscription tier
    if (subscriptionTier === 'premium') {
      router.push('/persona/create/guided');
    } else if (subscriptionTier === 'vip') {
      router.push('/persona/create/advanced');
    } else {
      // Show upgrade prompt for free/basic tiers
      router.push('/subscriptions?from=create_persona');
    }
  };

  if (isLoadingPersonas) {
    return (
      <div className="flex justify-center items-center h-full w-full">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-light transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Choose a Persona
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            disabled={isLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex mb-4">
          <button
            onClick={() => setSelectedTab('public')}
            className={`flex-1 py-2 text-center border-b-2 ${
              selectedTab === 'public'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            disabled={isLoading}
          >
            Public Personas
          </button>
          <button
            onClick={() => setSelectedTab('custom')}
            className={`flex-1 py-2 text-center border-b-2 ${
              selectedTab === 'custom'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            disabled={isLoading}
          >
            My Custom Personas
          </button>
        </div>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Search personas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2 px-4 pr-10 bg-gray-100 dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
            disabled={isLoading}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 absolute right-3 top-2.5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <LoadingSpinner size="medium" />
          </div>
        ) : filteredPersonas.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 my-8">
            {selectedTab === 'public'
              ? 'No public personas found.'
              : 'You haven\'t created any custom personas yet.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPersonas.map((persona) => (
              <button
                key={persona.id}
                onClick={() => onSelect(persona.id)}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow text-left flex flex-col h-full border border-gray-200 dark:border-gray-700"
                disabled={isLoading}
              >
                <div className="flex items-center mb-3">
                  {persona.imageUrl ? (
                    <Image
                      src={persona.imageUrl}
                      alt={persona.name}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-white font-medium text-lg">
                        {persona.name[0]}
                      </span>
                    </div>
                  )}
                  <h3 className="ml-3 text-lg font-semibold text-gray-900 dark:text-white">
                    {persona.name}
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm flex-1">
                  {persona.description}
                </p>
              </button>
            ))}
          </div>
        )}
        
        {selectedTab === 'custom' && !isLoading && (
          <div className="mt-4 text-center">
            <button
              onClick={handleCreateCustomPersona}
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded hover:bg-primary-light transition-colors"
              disabled={isLoading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {subscriptionTier === 'premium' || subscriptionTier === 'vip' ? 
                'Create New Persona' : 
                'Upgrade to Create Personas'}
            </button>
            {subscriptionTier !== 'premium' && subscriptionTier !== 'vip' && (
              <p className="mt-2 text-xs text-gray-400">
                Custom persona creation is available on Premium and VIP plans
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
