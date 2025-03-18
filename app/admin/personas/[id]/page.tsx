'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Persona {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  imageUrl: string | null;
  isPublic: boolean;
  tipEnabled: boolean;
  tipSuggestions: number[];
  lockMessageChance: number;
  lockMessagePrice: number;
  tokenRatePerMessage: number;
  tokenRatePerMinute: number;
  isPremium: boolean;
  dominanceLevel: number;
  exclusivityMultiplier: number;
}

export default function EditPersonaPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [persona, setPersona] = useState<Persona | null>(null);
  
  const [formData, setFormData] = useState<Partial<Persona>>({});

  useEffect(() => {
    async function fetchPersona() {
      try {
        const response = await fetch(`/api/admin/personas/${params.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch persona details');
        }
        
        const data = await response.json();
        setPersona(data.persona);
        setFormData(data.persona);
      } catch (error) {
        console.error('Error fetching persona:', error);
        setErrorMessage('Failed to load persona. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchPersona();
  }, [params.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
      return;
    }
    
    // Handle number input
    if (type === 'number' || name === 'lockMessageChance' || name === 'lockMessagePrice' || 
        name === 'tokenRatePerMessage' || name === 'tokenRatePerMinute' || name === 'exclusivityMultiplier' ||
        name === 'dominanceLevel') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) }));
      return;
    }
    
    // Handle regular inputs
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTipSuggestionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Parse comma-separated list of numbers
    const tips = value.split(',').map(item => {
      const num = parseFloat(item.trim());
      return isNaN(num) ? 0 : num;
    }).filter(num => num > 0);
    
    setFormData(prev => ({ ...prev, tipSuggestions: tips }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      const response = await fetch(`/api/admin/personas/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update persona');
      }
      
      // Navigate to the personas list page
      router.push('/admin/personas');
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('An unexpected error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!persona) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <p>{errorMessage || 'Persona not found'}</p>
        <div className="mt-4">
          <Link
            href="/admin/personas"
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
          >
            Back to Personas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Persona: {persona.name}</h1>
        <Link
          href="/admin/personas"
          className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
        >
          Cancel
        </Link>
      </header>

      {errorMessage && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-midnight-lighter rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 md:col-span-2">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Basic Information</h2>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-midnight-lighter text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-midnight-lighter text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <label htmlFor="systemPrompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                System Prompt <span className="text-red-500">*</span>
              </label>
              <textarea
                id="systemPrompt"
                name="systemPrompt"
                value={formData.systemPrompt || ''}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-midnight-lighter text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Image URL
              </label>
              <input
                type="text"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-midnight-lighter text-gray-900 dark:text-white"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Leave blank to use the default avatar based on the persona's name
              </p>
            </div>
          </div>
          
          <div className="space-y-4 md:col-span-2">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Settings & Pricing</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="isPublic"
                    checked={formData.isPublic || false}
                    onChange={handleChange}
                    className="h-5 w-5 rounded border-gray-300 dark:border-gray-700 text-primary focus:ring-primary"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Public Persona</span>
                </label>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Available to all users
                </p>
              </div>
              
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="isPremium"
                    checked={formData.isPremium || false}
                    onChange={handleChange}
                    className="h-5 w-5 rounded border-gray-300 dark:border-gray-700 text-primary focus:ring-primary"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Premium Persona</span>
                </label>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Only available to premium subscribers
                </p>
              </div>
              
              <div>
                <label htmlFor="tokenRatePerMessage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Token Rate (per message)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  id="tokenRatePerMessage"
                  name="tokenRatePerMessage"
                  value={formData.tokenRatePerMessage || 0}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-midnight-lighter text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label htmlFor="dominanceLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Dominance Level (1-5)
                </label>
                <select
                  id="dominanceLevel"
                  name="dominanceLevel"
                  value={formData.dominanceLevel || 1}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-midnight-lighter text-gray-900 dark:text-white"
                >
                  <option value={1}>1 - Basic</option>
                  <option value={2}>2 - Moderate</option>
                  <option value={3}>3 - Standard</option>
                  <option value={4}>4 - Advanced</option>
                  <option value={5}>5 - Elite</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="lockMessageChance" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Lock Message Chance (0-1)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  id="lockMessageChance"
                  name="lockMessageChance"
                  value={formData.lockMessageChance || 0}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-midnight-lighter text-gray-900 dark:text-white"
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Probability of locking a message (0.05 = 5% chance)
                </p>
              </div>
              
              <div>
                <label htmlFor="lockMessagePrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Lock Message Price (tokens)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  id="lockMessagePrice"
                  name="lockMessagePrice"
                  value={formData.lockMessagePrice || 0}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-midnight-lighter text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-4 md:col-span-2">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Tipping</h2>
            
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="tipEnabled"
                  checked={formData.tipEnabled || false}
                  onChange={handleChange}
                  className="h-5 w-5 rounded border-gray-300 dark:border-gray-700 text-primary focus:ring-primary"
                />
                <span className="text-gray-700 dark:text-gray-300">Enable Tipping</span>
              </label>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Allow users to tip for great answers
              </p>
            </div>
            
            <div>
              <label htmlFor="tipSuggestions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tip Suggestions (comma separated)
              </label>
              <input
                type="text"
                id="tipSuggestions"
                name="tipSuggestions"
                value={(formData.tipSuggestions || []).join(', ')}
                onChange={handleTipSuggestionsChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-midnight-lighter text-gray-900 dark:text-white"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Suggested tip amounts in tokens (e.g. 1, 3, 5)
              </p>
            </div>
            
            <div>
              <label htmlFor="exclusivityMultiplier" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Exclusivity Multiplier
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                id="exclusivityMultiplier"
                name="exclusivityMultiplier"
                value={formData.exclusivityMultiplier || 1}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-midnight-lighter text-gray-900 dark:text-white"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Price multiplier based on exclusivity (1.0 = standard pricing)
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end space-x-4">
          <Link
            href="/admin/personas"
            className="px-6 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Update Persona'}
          </button>
        </div>
      </form>
    </div>
  );
}
