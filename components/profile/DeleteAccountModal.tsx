import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { toast } from 'react-hot-toast';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  
  if (!isOpen) return null;
  
  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (confirmText !== 'DELETE') {
      setError('Please type DELETE to confirm');
      return;
    }
    
    setIsDeleting(true);
    setError('');
    
    try {
      const response = await fetch('/api/user/account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password,
          confirmDelete: true,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete account');
      }
      
      toast.success('Your account has been deleted successfully');
      
      // Sign out the user
      await signOut({ callbackUrl: '/' });
    } catch (error: any) {
      setError(error.message || 'An error occurred');
      setIsDeleting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-midnight-lighter rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h3 className="text-xl font-bold text-primary mb-4">Delete Account</h3>
          
          <p className="text-white mb-4">
            This action will permanently delete your account and all associated data. This cannot be undone.
          </p>
          
          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-primary text-primary rounded-md">
              {error}
            </div>
          )}
          
          <form onSubmit={handleDeleteAccount} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-1">
                Current Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-midnight-DEFAULT text-white border border-primary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            
            <div>
              <label htmlFor="confirmText" className="block text-sm font-medium text-white mb-1">
                Type DELETE to confirm
              </label>
              <input
                type="text"
                id="confirmText"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full px-3 py-2 bg-midnight-DEFAULT text-white border border-primary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-primary/30 text-white rounded-md hover:bg-secondary-dark transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isDeleting || confirmText !== 'DELETE'}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
