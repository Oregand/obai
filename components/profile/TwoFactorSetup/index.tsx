'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface TwoFactorSetupProps {
  userId: string;
}

export default function TwoFactorSetup({ userId }: TwoFactorSetupProps) {
  // 2FA status
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // 2FA setup state
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  
  // Token verification
  const [token, setToken] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Disable 2FA state
  const [showDisableForm, setShowDisableForm] = useState(false);
  const [password, setPassword] = useState('');
  const [isDisabling, setIsDisabling] = useState(false);
  
  // Fetch 2FA status when component mounts
  useEffect(() => {
    fetchStatus();
  }, []);
  
  // Fetch 2FA status
  const fetchStatus = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch('/api/user/2fa/status');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch 2FA status');
      }
      
      setIsEnabled(data.enabled);
    } catch (error: any) {
      setError(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initialize 2FA setup
  const startSetup = async () => {
    try {
      setIsSettingUp(true);
      setError('');
      
      const response = await fetch('/api/user/2fa/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to set up 2FA');
      }
      
      setQrCodeUrl(data.qrCodeUrl);
      setSecret(data.secret);
    } catch (error: any) {
      setError(error.message || 'An error occurred');
      setIsSettingUp(false);
    }
  };
  
  // Verify and enable 2FA
  const verifyAndEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsVerifying(true);
      setError('');
      
      const response = await fetch('/api/user/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          enable: true,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify token');
      }
      
      setSuccess('Two-factor authentication enabled successfully');
      setIsEnabled(true);
      setIsSettingUp(false);
      setQrCodeUrl(null);
      setSecret(null);
      setToken('');
    } catch (error: any) {
      setError(error.message || 'An error occurred');
    } finally {
      setIsVerifying(false);
    }
  };
  
  // Disable 2FA
  const disableTwoFactor = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsDisabling(true);
      setError('');
      
      const response = await fetch('/api/user/2fa/disable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to disable 2FA');
      }
      
      setSuccess('Two-factor authentication disabled successfully');
      setIsEnabled(false);
      setShowDisableForm(false);
      setPassword('');
    } catch (error: any) {
      setError(error.message || 'An error occurred');
    } finally {
      setIsDisabling(false);
    }
  };
  
  // Helper to cancel setup
  const cancelSetup = () => {
    setIsSettingUp(false);
    setQrCodeUrl(null);
    setSecret(null);
    setToken('');
    setError('');
  };
  
  // Helper to toggle disable form
  const toggleDisableForm = () => {
    setShowDisableForm(!showDisableForm);
    setPassword('');
    setError('');
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center my-4">
        <LoadingSpinner />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-secondary-light border border-primary text-primary px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-secondary-light border border-green-500 text-green-300 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      {isEnabled ? (
        <div>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-lg">Two-factor authentication is enabled for your account.</p>
          </div>
          
          <div className="mt-4">
            {showDisableForm ? (
              <form onSubmit={disableTwoFactor} className="bg-secondary-dark p-4 rounded-lg border border-primary/30 mt-4">
                <h3 className="text-lg font-semibold mb-3">Disable Two-Factor Authentication</h3>
                <p className="text-white opacity-70 mb-4">Please enter your password to confirm disabling two-factor authentication.</p>
                
                <div className="mb-4">
                  <label htmlFor="password" className="block text-sm font-medium text-white mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-secondary-light text-white border border-primary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={toggleDisableForm}
                    className="px-4 py-2 border border-primary/30 text-white rounded-md hover:bg-secondary-dark transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isDisabling || !password}
                    className="px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {isDisabling ? 'Disabling...' : 'Disable 2FA'}
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={toggleDisableForm}
                className="px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Disable Two-Factor Authentication
              </button>
            )}
          </div>
        </div>
      ) : isSettingUp ? (
        <div className="bg-secondary-dark p-4 rounded-lg border border-primary/30">
          <h3 className="text-lg font-semibold mb-3">Set Up Two-Factor Authentication</h3>
          
          <div className="space-y-4">
            <p className="text-white opacity-70">
              1. Scan the QR code below with your authenticator app (Google Authenticator, Authy, etc.).
            </p>
            
            {qrCodeUrl && (
              <div className="flex justify-center bg-white p-4 rounded-lg">
                <Image
                  src={qrCodeUrl}
                  alt="QR Code for 2FA setup"
                  width={200}
                  height={200}
                />
              </div>
            )}
            
            {secret && (
              <div>
                <p className="text-white opacity-70">
                  Or manually enter this code in your authenticator app:
                </p>
                <div className="flex items-center justify-center mt-2">
                  <code className="bg-secondary-light p-2 rounded text-primary font-mono text-center">
                    {secret}
                  </code>
                </div>
              </div>
            )}
            
            <p className="text-white opacity-70">
              2. Enter the verification code from your authenticator app below:
            </p>
            
            <form onSubmit={verifyAndEnable} className="space-y-4">
              <div>
                <label htmlFor="token" className="block text-sm font-medium text-white mb-1">
                  Verification Code
                </label>
                <input
                  type="text"
                  id="token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="e.g. 123456"
                  className="w-full px-3 py-2 bg-secondary-light text-white border border-primary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  pattern="[0-9]{6}"
                  maxLength={6}
                />
                <p className="text-xs text-white opacity-50 mt-1">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={cancelSetup}
                  className="px-4 py-2 border border-primary/30 text-white rounded-md hover:bg-secondary-dark transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifying || token.length !== 6}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-light transition-colors disabled:opacity-50"
                >
                  {isVerifying ? 'Verifying...' : 'Enable 2FA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-lg mb-4">
            Two-factor authentication adds an extra layer of security to your account by requiring a verification code from your mobile device in addition to your password.
          </p>
          
          <div className="flex items-start space-x-6">
            <div className="bg-secondary-dark p-4 rounded-lg border border-primary/30 flex-1">
              <h4 className="font-medium mb-2">Why use two-factor authentication?</h4>
              <ul className="list-disc list-inside text-white opacity-70 space-y-2">
                <li>Protect your account even if your password is compromised</li>
                <li>Prevent unauthorized access from unknown devices</li>
                <li>Get alerted when someone tries to log in to your account</li>
              </ul>
            </div>
            
            <div className="bg-secondary-dark p-4 rounded-lg border border-primary/30 flex-1">
              <h4 className="font-medium mb-2">Supported authenticator apps</h4>
              <ul className="list-disc list-inside text-white opacity-70 space-y-2">
                <li>Google Authenticator</li>
                <li>Microsoft Authenticator</li>
                <li>Authy</li>
                <li>1Password</li>
                <li>LastPass Authenticator</li>
              </ul>
            </div>
          </div>
          
          <button
            onClick={startSetup}
            className="mt-6 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-light transition-colors"
          >
            Set Up Two-Factor Authentication
          </button>
        </div>
      )}
    </div>
  );
}
