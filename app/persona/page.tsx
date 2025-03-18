'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Image from 'next/image';

export default function PersonaManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [personas, setPersonas] = useState([]);
  const [userPersonas, setUserPersonas] = useState([]);
  const [publicPersonas, setPublicPersonas] = useState([]);
  const [filter, setFilter] = useState('all'); // all, mine, public
  const [subscriptionTier, setSubscriptionTier] = useState('free');

  // Fetch personas
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/persona');
      return;
    }

    if (status === 'authenticated') {
      // Fetch subscription info
      fetch('/api/user/subscription')
        .then(res => res.json())
        .then(data => {
          console.log('Fetched subscription tier:', data.tier);
          setSubscriptionTier(data.tier);
        })
        .catch(error => {
          console.error('Error fetching subscription:', error);
        });

      // Fetch personas
      fetch('/api/persona')
        .then(res => res.json())
        .then(data => {
          setPersonas(data);
          
          // Separate user's custom personas from public ones
          const userCustom = data.filter(persona => persona.createdBy === session.user.id);
          const publicOnes = data.filter(persona => persona.isPublic && persona.createdBy !== session.user.id);
          
          setUserPersonas(userCustom);
          setPublicPersonas(publicOnes);
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Error fetching personas:', error);
          setIsLoading(false);
          toast.error('Error loading personas');
        });
    }
  }, [status, router, session?.user?.id]);

  // Delete a persona
  const handleDelete = async (personaId) => {
    if (!confirm('Are you sure you want to delete this persona? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/persona/${personaId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete persona');
      }

      // Remove deleted persona from state
      setUserPersonas(prev => prev.filter(p => p.id !== personaId));
      setPersonas(prev => prev.filter(p => p.id !== personaId));
      toast.success('Persona deleted successfully');
    } catch (error) {
      console.error('Error deleting persona:', error);
      toast.error('Failed to delete persona');
    }
  };

  // Filter personas based on selected filter
  const filteredPersonas = () => {
    switch (filter) {
      case 'mine':
        return userPersonas;
      case 'public':
        return publicPersonas;
      default:
        return [...userPersonas, ...publicPersonas];
    }
  };

  // Check if user can create personas
  const canCreatePersona = () => {
    console.log('Checking if user can create personas with tier:', subscriptionTier);
    return ['premium', 'vip'].includes(subscriptionTier);
  };

  // Format relative time
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

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
              { label: 'Personas' }
            ]}
          />
          <Link href="/chat">
            <button className="flex items-center text-white opacity-70 hover:opacity-100 hover:text-primary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Chat
            </button>
          </Link>
        </div>
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary neon-text">Personas</h1>
            <p className="text-white opacity-70 mt-1">
              Browse, create, and manage personas for your conversations
            </p>
          </div>
          
          {canCreatePersona() ? (
            <Link href="/persona/create">
              <button className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-light transition-colors">
                Create Persona
              </button>
            </Link>
          ) : (
            <Link href="/subscriptions">
              <button className="px-4 py-2 bg-secondary text-white rounded hover:bg-secondary-light transition-colors">
                Upgrade to Create Personas
              </button>
            </Link>
          )}
        </div>
        
        {/* Filter options */}
        <div className="mb-6">
          <div className="flex space-x-2 bg-midnight-lighter inline-flex rounded-lg p-1">
            <button
              className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-primary text-white' : 'text-white opacity-70 hover:opacity-100'}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`px-4 py-2 rounded ${filter === 'mine' ? 'bg-primary text-white' : 'text-white opacity-70 hover:opacity-100'}`}
              onClick={() => setFilter('mine')}
            >
              My Personas
            </button>
            <button
              className={`px-4 py-2 rounded ${filter === 'public' ? 'bg-primary text-white' : 'text-white opacity-70 hover:opacity-100'}`}
              onClick={() => setFilter('public')}
            >
              Public
            </button>
          </div>
        </div>
        
        {/* Personas grid */}
        {filteredPersonas().length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPersonas().map(persona => (
              <div key={persona.id} className="bg-midnight-lighter rounded-lg overflow-hidden shadow-lg">
                <div className="relative h-40 bg-gradient-to-r from-primary/20 to-secondary/20">
                  {persona.imageUrl ? (
                    <Image
                      src={persona.imageUrl}
                      alt={persona.name}
                      layout="fill"
                      objectFit="cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-6xl text-white opacity-30">
                        {persona.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  
                  {persona.isPremium && (
                    <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded">
                      Premium
                    </div>
                  )}
                </div>
                
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-white">{persona.name}</h3>
                    <div className="text-xs text-white opacity-50">
                      {formatRelativeTime(persona.createdAt)}
                    </div>
                  </div>
                  
                  <p className="text-white opacity-70 text-sm mb-4 line-clamp-2">
                    {persona.description}
                  </p>
                  
                  <div className="flex space-x-3 mb-5">
                    <span className="text-xs bg-primary bg-opacity-20 text-primary px-2 py-1 rounded">
                      Level {persona.dominanceLevel}
                    </span>
                    {persona.isPublic ? (
                      <span className="text-xs bg-green-500 bg-opacity-20 text-green-400 px-2 py-1 rounded">
                        Public
                      </span>
                    ) : (
                      <span className="text-xs bg-blue-500 bg-opacity-20 text-blue-400 px-2 py-1 rounded">
                        Private
                      </span>
                    )}
                    {persona.createdBy === session.user.id && (
                      <span className="text-xs bg-purple-500 bg-opacity-20 text-purple-400 px-2 py-1 rounded">
                        Custom
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-between">
                    <Link href={`/chat?persona=${persona.id}`}>
                      <button className="px-3 py-1.5 bg-primary text-white text-sm rounded hover:bg-primary-light transition-colors">
                        Chat Now
                      </button>
                    </Link>
                    
                    {persona.createdBy === session.user.id && (
                      <div className="flex space-x-2">
                        <Link href={`/persona/edit/${persona.id}`}>
                          <button className="px-3 py-1.5 border border-white/20 text-white text-sm rounded hover:bg-white/10 transition-colors">
                            Edit
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(persona.id)}
                          className="px-3 py-1.5 border border-red-500/30 text-red-400 text-sm rounded hover:bg-red-500/10 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-white opacity-50 text-lg mb-4">
              {filter === 'mine' ? 'You haven\'t created any personas yet' : 'No personas found'}
            </div>
            {filter === 'mine' && canCreatePersona() ? (
              <Link href="/persona/create">
                <button className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-light transition-colors">
                  Create Your First Persona
                </button>
              </Link>
            ) : filter === 'mine' ? (
              <Link href="/subscriptions">
                <button className="px-4 py-2 bg-secondary text-white rounded hover:bg-secondary-light transition-colors">
                  Upgrade to Create Personas
                </button>
              </Link>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
