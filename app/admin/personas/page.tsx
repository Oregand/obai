'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Persona {
  id: string;
  name: string;
  description: string;
  isPremium: boolean;
  isPublic: boolean;
  tokenRatePerMessage: number;
  lockMessageChance: number;
  lockMessagePrice: number;
}

export default function PersonasPage() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, premium, public

  useEffect(() => {
    async function fetchPersonas() {
      try {
        const response = await fetch('/api/admin/personas');
        const data = await response.json();
        
        if (data.personas) {
          setPersonas(data.personas);
        }
      } catch (error) {
        console.error('Error fetching personas:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPersonas();
  }, []);

  // Filter personas based on search term and filter
  const filteredPersonas = personas.filter(persona => {
    const matchesSearch = 
      persona.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      persona.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'premium') return matchesSearch && persona.isPremium;
    if (filter === 'public') return matchesSearch && persona.isPublic;
    
    return matchesSearch;
  });

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this persona? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/admin/personas/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setPersonas(prev => prev.filter(persona => persona.id !== id));
        } else {
          alert('Failed to delete persona. It may be in use by chats.');
        }
      } catch (error) {
        console.error('Error deleting persona:', error);
        alert('An error occurred while deleting the persona.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Personas</h1>
        <Link
          href="/admin/personas/create"
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
        >
          Create New Persona
        </Link>
      </header>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search personas..."
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-midnight-lighter text-gray-900 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <select
            className="w-full sm:w-auto px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-midnight-lighter text-gray-900 dark:text-white"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Personas</option>
            <option value="premium">Premium Only</option>
            <option value="public">Public Only</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-midnight-lighter rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-midnight-darker border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price (Tokens)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lock Chance</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredPersonas.length > 0 ? (
                filteredPersonas.map((persona) => (
                  <tr key={persona.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900 dark:text-white">{persona.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{persona.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${persona.isPremium ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>
                          {persona.isPremium ? 'Premium' : 'Standard'}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${persona.isPublic ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                          {persona.isPublic ? 'Public' : 'Private'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                      {persona.tokenRatePerMessage} tokens/msg
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                      {(persona.lockMessageChance * 100).toFixed(0)}%
                      {persona.lockMessageChance > 0 && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {persona.lockMessagePrice} tokens to unlock
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/personas/${persona.id}`}
                          className="text-primary hover:text-primary-light transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(persona.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No personas found. 
                    {searchTerm && ' Try changing your search criteria.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
