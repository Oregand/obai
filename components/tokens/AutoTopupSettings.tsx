'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { TOKEN_PACKAGES } from '@/lib/services/token-service';
import LoadingSpinner from '../ui/LoadingSpinner';

interface AutoTopupSettingsProps {
  userId: string;
}

interface AutoTopupSettings {
  enabled: boolean;
  thresholdAmount: number;
  packageId: string;
  paymentMethodId: string | null;
}

interface PaymentMethod {
  id: string;
  type: string;
  name: string;
  address: string;
  isDefault: boolean;
}

const AutoTopupSettings: React.FC<AutoTopupSettingsProps> = ({ userId }) => {
  const [settings, setSettings] = useState<AutoTopupSettings>({
    enabled: false,
    thresholdAmount: 10,
    packageId: 'basic',
    paymentMethodId: null
  });

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch user's auto top-up settings and payment methods
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch auto top-up settings
        const settingsResponse = await fetch('/api/user/auto-topup');
        
        if (!settingsResponse.ok) {
          throw new Error('Failed to fetch auto top-up settings');
        }
        
        const settingsData = await settingsResponse.json();
        if (settingsData.settings) {
          setSettings(settingsData.settings);
        }
        
        // Fetch payment methods
        const methodsResponse = await fetch('/api/user/payment-methods');
        
        if (!methodsResponse.ok) {
          throw new Error('Failed to fetch payment methods');
        }
        
        const methodsData = await methodsResponse.json();
        setPaymentMethods(methodsData.paymentMethods || []);
      } catch (err: any) {
        console.error('Error fetching auto top-up data:', err);
        setError(err.message || 'Failed to load auto top-up settings');
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/user/auto-topup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update auto top-up settings');
      }

      setSuccessMessage('Auto top-up settings saved successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err: any) {
      console.error('Error saving auto top-up settings:', err);
      setError(err.message || 'Failed to save auto top-up settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle toggle change
  const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({
      ...prev,
      enabled: e.target.checked
    }));
  };

  // Handle threshold amount change
  const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setSettings(prev => ({
        ...prev,
        thresholdAmount: value
      }));
    }
  };

  // Handle package selection change
  const handlePackageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings(prev => ({
      ...prev,
      packageId: e.target.value
    }));
  };

  // Handle payment method selection change
  const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings(prev => ({
      ...prev,
      paymentMethodId: e.target.value || null
    }));
  };

  // Get selected package details
  const selectedPackage = TOKEN_PACKAGES.find(pkg => pkg.id === settings.packageId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <LoadingSpinner size="medium" />
      </div>
    );
  }

  return (
    <div className="bg-secondary-dark bg-opacity-30 p-6 rounded-lg border border-primary/30">
      <h3 className="text-lg font-medium text-primary mb-4">Auto Top-up Settings</h3>
      
      {error && (
        <div className="p-3 mb-4 bg-primary/20 text-primary rounded-md">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="p-3 mb-4 bg-green-500/20 text-green-400 rounded-md">
          {successMessage}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Enable/Disable Auto Top-up */}
        <div className="flex items-center justify-between bg-midnight-lighter p-3 rounded-md">
          <div>
            <label htmlFor="auto-topup-toggle" className="font-medium text-white">
              Enable Auto Top-up
            </label>
            <p className="text-sm text-white/70">
              Automatically purchase tokens when your balance falls below a threshold
            </p>
          </div>
          <div className="relative inline-block w-12 align-middle select-none">
            <input
              type="checkbox"
              id="auto-topup-toggle"
              checked={settings.enabled}
              onChange={handleToggleChange}
              className="sr-only"
            />
            <div className={`block h-6 rounded-full w-12 transition-colors ${settings.enabled ? 'bg-primary' : 'bg-secondary'}`}>
            </div>
            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform transform ${settings.enabled ? 'translate-x-6' : 'translate-x-0'}`}>
            </div>
          </div>
        </div>
        
        {settings.enabled && (
          <>
            {/* Threshold Amount */}
            <div className="bg-midnight-lighter p-4 rounded-md">
              <label htmlFor="threshold" className="block text-sm font-medium text-white mb-1">
                Top-up when balance falls below
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white opacity-70">
                  $
                </span>
                <input
                  type="number"
                  id="threshold"
                  min="0"
                  value={settings.thresholdAmount}
                  onChange={handleThresholdChange}
                  className="pl-8 w-full py-2 px-3 border border-primary/30 rounded-md bg-secondary-dark text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/80"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-white/60">
                When your token balance falls below this amount, a new package will be automatically purchased
              </p>
            </div>
            
            {/* Package Selection */}
            <div className="bg-midnight-lighter p-4 rounded-md">
              <label htmlFor="package" className="block text-sm font-medium text-white mb-1">
                Token Package to Purchase
              </label>
              <select
                id="package"
                value={settings.packageId}
                onChange={handlePackageChange}
                className="w-full py-2 px-3 border border-primary/30 rounded-md bg-secondary-dark text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/80"
                required
              >
                {TOKEN_PACKAGES.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name} - ${pkg.price} ({pkg.tokens} tokens {pkg.bonus > 0 ? `+ ${pkg.bonus} bonus` : ''})
                  </option>
                ))}
              </select>
              
              {selectedPackage && (
                <div className="mt-2 p-2 border border-primary/20 rounded-md bg-secondary-dark">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Package:</span>
                    <span className="text-white">{selectedPackage.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Price:</span>
                    <span className="text-primary">${selectedPackage.price}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Tokens:</span>
                    <span className="text-white">{selectedPackage.tokens + selectedPackage.bonus}</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Payment Method Selection */}
            <div className="bg-midnight-lighter p-4 rounded-md">
              <label htmlFor="payment-method" className="block text-sm font-medium text-white mb-1">
                Payment Method
              </label>
              
              {paymentMethods.length === 0 ? (
                <div className="text-center py-3 bg-secondary-dark bg-opacity-50 rounded-md">
                  <p className="text-white/70 mb-2">No payment methods available</p>
                  <a href="/profile" className="text-primary hover:text-primary-light">
                    Add a payment method in your profile
                  </a>
                </div>
              ) : (
                <select
                  id="payment-method"
                  value={settings.paymentMethodId || ''}
                  onChange={handlePaymentMethodChange}
                  className="w-full py-2 px-3 border border-primary/30 rounded-md bg-secondary-dark text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/80"
                  required
                >
                  <option value="">-- Select Payment Method --</option>
                  {paymentMethods.map((method) => (
                    <option key={method.id} value={method.id}>
                      {method.name} ({method.type}) {method.isDefault ? '(Default)' : ''}
                    </option>
                  ))}
                </select>
              )}
              
              <p className="mt-1 text-xs text-white/60">
                This payment method will be charged when tokens are automatically purchased
              </p>
            </div>
          </>
        )}
        
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving || paymentMethods.length === 0}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSaving ? (
              <>
                <LoadingSpinner size="small" />
                <span className="ml-2">Saving...</span>
              </>
            ) : (
              'Save Settings'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AutoTopupSettings;
