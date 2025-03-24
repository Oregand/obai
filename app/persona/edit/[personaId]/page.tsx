'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Link from 'next/link';
import Image from 'next/image';

export default function EditPersonaPage({ params }: { params: { personaId: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  
  // Persona form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    systemPrompt: '',
    imageUrl: '',
    isPublic: false
  });

  // Fetch persona data
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=' + encodeURIComponent('/persona/edit/' + params.personaId));
      return;
    }

    if (status === 'authenticated') {
      fetch(`/api/persona/${params.personaId}`)
        .then(res => {
          if (!res.ok) {
            if (res.status === 404) {
              toast.error('Persona not found');
              router.push('/persona');
              return null;
            }
            if (res.status === 403) {
              toast.error('You do not have permission to edit this persona');
              router.push('/persona');
              return null;
            }
            throw new Error('Failed to fetch persona');
          }
          return res.json();
        })
        .then(data => {
          if (data) {
            setFormData({
              name: data.name,
              description: data.description,
              systemPrompt: data.systemPrompt,
              imageUrl: data.imageUrl || '',
              isPublic: data.isPublic
            });
            setIsLoading(false);
          }
        })
        .catch(error => {
          console.error('Error fetching persona:', error);
          setIsLoading(false);
          toast.error('Error loading persona data');
        });
    }
  }, [status, router, params.personaId]);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsImageUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      
      setFormData(prev => ({
        ...prev,
        imageUrl: data.url
      }));

      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsImageUploading(false);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim() || !formData.systemPrompt.trim()) {
      toast.error('All fields are required');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/persona/${params.personaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update persona');
      }
      
      toast.success('Persona updated successfully!');
      router.push('/persona');
    } catch (error) {
      console.error('Error updating persona:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update persona');
    } finally {
      setIsSubmitting(false);
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
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Breadcrumbs 
            items={[
              { label: 'Personas', href: '/persona' },
              { label: 'Edit' }
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
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary neon-text mb-2">
            Edit Persona
          </h1>
          <p className="text-white opacity-70 max-w-2xl mx-auto">
            Update your custom persona's details and behavior
          </p>
        </div>
        
        <div className="bg-midnight-lighter rounded-lg shadow-lg p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Persona Image */}
              <div>
                <label className="block text-white mb-2 font-medium">Persona Image</label>
                <div className="flex items-center space-x-5">
                  <div className="relative h-24 w-24 bg-midnight-dark rounded-lg overflow-hidden flex items-center justify-center">
                    {formData.imageUrl ? (
                      <Image
                        src={formData.imageUrl}
                        alt="Persona"
                        layout="fill"
                        objectFit="cover"
                      />
                    ) : (
                      <span className="text-4xl text-white opacity-30">
                        {formData.name.charAt(0).toUpperCase() || 'P'}
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="imageUpload" className="px-4 py-2 bg-secondary text-white rounded hover:bg-secondary-light transition-colors cursor-pointer inline-block">
                      {isImageUploading ? 'Uploading...' : 'Upload Image'}
                    </label>
                    <input 
                      id="imageUpload" 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      className="hidden"
                      disabled={isImageUploading}
                    />
                    <p className="text-sm text-white opacity-60 mt-1">
                      JPEG, PNG, GIF or WebP. Max 5MB.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Basic Information */}
              <div>
                <label htmlFor="name" className="block text-white mb-1 font-medium">
                  Persona Name <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="E.g., Sophie, Business Coach, Tech Guru"
                  className="w-full p-3 rounded bg-midnight-dark border border-secondary text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-white mb-1 font-medium">
                  Short Description <span className="text-primary">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="A brief description of your persona's purpose or identity"
                  rows={2}
                  className="w-full p-3 rounded bg-midnight-dark border border-secondary text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="systemPrompt" className="block text-white mb-1 font-medium">
                  System Prompt <span className="text-primary">*</span>
                </label>
                <div className="mb-2">
                  <p className="text-sm text-white opacity-70">
                    This is the instruction set that defines how your persona behaves.
                  </p>
                </div>
                <textarea
                  id="systemPrompt"
                  name="systemPrompt"
                  value={formData.systemPrompt}
                  onChange={handleInputChange}
                  rows={15}
                  className="w-full p-3 rounded bg-midnight-dark border border-secondary text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary focus:ring-primary rounded"
                />
                <label htmlFor="isPublic" className="ml-2 text-white">
                  Make this persona public (share with other users)
                </label>
              </div>
              
              <div className="flex justify-end mt-8">
                <Link href="/persona">
                  <button 
                    type="button"
                    className="px-4 py-2 border border-white text-white rounded hover:bg-white hover:bg-opacity-10 transition-colors mr-3"
                  >
                    Cancel
                  </button>
                </Link>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-primary text-white rounded hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner size="small" />
                      <span className="ml-2">Saving...</span>
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
