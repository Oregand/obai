'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ImageUploader from '@/components/ui/ImageUploader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import CryptoPaymentMethods from '@/components/payment/methods/CryptoPaymentMethods';
import AutoTopupSettings from '@/components/tokens/AutoTopupSettings';
import DeleteAccountModal from '@/components/profile/DeleteAccountModal';
import TwoFactorSetup from '@/components/profile/TwoFactorSetup';
import SubscriptionHistory from '@/components/subscriptions/SubscriptionHistory';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session.user) {
      setUser({
        id: session.user.id || '',
        name: session.user.name || '',
        email: session.user.email || '',
        image: session.user.image || null
      });
      
      setName(session.user.name || '');
      setEmail(session.user.email || '');
      setIsLoading(false);
    }
  }, [status, session, router]);
  
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccessMessage('');
    
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }
      
      // Update the session with new user data
      await update({
        ...session,
        user: {
          ...session?.user,
          name,
          email,
        },
      });
      
      setSuccessMessage('Profile updated successfully');
    } catch (error: any) {
      setError(error.message || 'An error occurred');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    setIsSaving(true);
    setError('');
    setSuccessMessage('');
    
    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update password');
      }
      
      setSuccessMessage('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setError(error.message || 'An error occurred');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleImageUpload = async (file: File) => {
    setIsSaving(true);
    setError('');
    
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const response = await fetch('/api/user/image', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload image');
      }
      
      // Update the session with new user image
      await update({
        ...session,
        user: {
          ...session?.user,
          image: data.imageUrl,
        },
      });
      
      setSuccessMessage('Profile picture updated successfully');
    } catch (error: any) {
      setError(error.message || 'An error occurred');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleImageRemove = async () => {
    setIsSaving(true);
    setError('');
    
    try {
      const response = await fetch('/api/user/image', {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove image');
      }
      
      // Update the session with removed user image
      await update({
        ...session,
        user: {
          ...session?.user,
          image: null,
        },
      });
      
      setSuccessMessage('Profile picture removed successfully');
    } catch (error: any) {
      setError(error.message || 'An error occurred');
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-midnight-DEFAULT text-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Breadcrumbs items={[{ label: 'Profile' }]} />
          </div>
          <Link href="/">
            <button className="flex items-center text-white opacity-70 hover:opacity-100 hover:text-primary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Home
            </button>
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold text-primary neon-text mb-8">Your Profile</h1>
        
        {error && (
          <div className="bg-secondary-light border border-primary text-primary px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="bg-secondary-light border border-green-500 text-green-300 px-4 py-3 rounded mb-4">
            {successMessage}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Picture */}
          <div className="bg-secondary-dark p-6 rounded-lg border border-primary/30 flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-4 text-primary">Profile Picture</h2>
            <ImageUploader
              currentImage={user?.image || null}
              onImageUpload={handleImageUpload}
              onImageRemove={handleImageRemove}
              size={150}
            />
          </div>
          
          {/* Profile Information */}
          <div className="md:col-span-2 bg-secondary-dark p-6 rounded-lg border border-primary/30">
            <h2 className="text-xl font-semibold mb-4 text-primary">Account Information</h2>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary-light text-white border border-primary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary-light text-white border border-primary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
          
          {/* Password Change */}
          <div className="md:col-span-3 bg-secondary-dark p-6 rounded-lg border border-primary/30">
            <h2 className="text-xl font-semibold mb-4 text-primary">Change Password</h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-white mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-secondary-light text-white border border-primary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-white mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-secondary-light text-white border border-primary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-secondary-light text-white border border-primary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>
              
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
          
          {/* Two-Factor Authentication */}
          <div className="md:col-span-3 bg-secondary-dark p-6 rounded-lg border border-primary/30">
            <h2 className="text-xl font-semibold mb-4 text-primary">Two-Factor Authentication</h2>
            
            {user && <TwoFactorSetup userId={user.id} />}
          </div>
          
          {/* Subscription Management */}
          <div className="md:col-span-3 bg-secondary-dark p-6 rounded-lg border border-primary/30">
            <h2 className="text-xl font-semibold mb-4 text-primary">Subscription Management</h2>
            
            {user && <SubscriptionHistory userId={user.id} />}
          </div>
          
          {/* Auto Top-up Settings */}
          <div className="md:col-span-3 bg-secondary-dark p-6 rounded-lg border border-primary/30">
            <h2 className="text-xl font-semibold mb-4 text-primary">Auto Top-up Settings</h2>
            <p className="text-white opacity-70 mb-4">Set up automatic token purchases when your balance falls below a threshold.</p>
            
            {user && <AutoTopupSettings userId={user.id} />}
          </div>
          
          {/* Payment Methods */}
          <div className="md:col-span-3 bg-secondary-dark p-6 rounded-lg border border-primary/30">
            <h2 className="text-xl font-semibold mb-4 text-primary">Payment Methods</h2>
            <p className="text-white opacity-70 mb-4">Manage your crypto wallets for payments and receiving funds.</p>
            
            {user && <CryptoPaymentMethods userId={user.id} />}
          </div>
          
          {/* Account Deletion */}
          <div className="md:col-span-3 bg-secondary-dark p-6 rounded-lg border border-primary/30">
            <h2 className="text-xl font-semibold mb-4 text-primary">Delete Account</h2>
            <p className="text-white opacity-70 mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
      
      {/* Delete Account Modal */}
      <DeleteAccountModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} />
    </div>
  );
}
