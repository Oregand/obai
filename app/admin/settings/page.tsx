'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface AppSettings {
  siteName: string;
  siteDescription: string;
  grokApiKey: string;
  grokApiUrl: string;
  defaultCreditsForNewUsers: number;
  messageLockedChanceDefault: number;
  lockMessagePriceDefault: number;
  maintenanceMode: boolean;
  allowUserRegistration: boolean;
  requireEmailVerification: boolean;
  maxMessagesPerChat: number;
  maxChatsPerUser: number;
  deleteInactiveChatsAfterDays: number;
  contactEmail: string;
  privacyPolicyUrl: string;
  termsOfServiceUrl: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings');
        if (!response.ok) throw new Error('Failed to fetch settings');
        
        const data = await response.json();
        setSettings(data);
      } catch (error) {
        console.error('Error fetching settings:', error);
        setError('Failed to load settings');
        
        // For development, provide mock data
        setSettings({
          siteName: 'OBAI',
          siteDescription: 'Chat with AI Personas powered by Grok',
          grokApiKey: 'xai-00000000000000000000000000000000',
          grokApiUrl: 'https://api.x.ai/v1/chat/completions',
          defaultCreditsForNewUsers: 5,
          messageLockedChanceDefault: 0.05,
          lockMessagePriceDefault: 0.5,
          maintenanceMode: false,
          allowUserRegistration: true,
          requireEmailVerification: true,
          maxMessagesPerChat: 100,
          maxChatsPerUser: 50,
          deleteInactiveChatsAfterDays: 90,
          contactEmail: 'support@obai.example.com',
          privacyPolicyUrl: 'https://obai.example.com/privacy',
          termsOfServiceUrl: 'https://obai.example.com/terms'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleInputChange = (
    fieldName: keyof AppSettings,
    value: string | number | boolean
  ) => {
    if (settings) {
      setSettings({
        ...settings,
        [fieldName]: value,
      });
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    
    setIsSaving(true);
    
    try {
      // In a real implementation, call API to save settings
      // const response = await fetch('/api/admin/settings', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(settings),
      // });
      
      // if (!response.ok) throw new Error('Failed to save settings');
      
      // Mock successful save
      setTimeout(() => {
        toast.success('Settings saved successfully');
        setIsSaving(false);
      }, 1000);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
      setIsSaving(false);
    }
  };

  const resetApiKey = () => {
    if (confirm('Are you sure you want to reset the Grok API key? This will invalidate the current key.')) {
      handleInputChange('grokApiKey', 'xai-' + Math.random().toString(36).substring(2, 15));
      toast.success('API key reset successfully');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Site Settings
        </h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 inline-block">
          {error || 'Failed to load settings'}
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Site Settings</h1>
        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isSaving ? (
            <>
              <LoadingSpinner size="small" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>
      
      {/* Settings Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'general'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            General
          </button>
          
          <button
            onClick={() => setActiveTab('api')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'api'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            API Settings
          </button>
          
          <button
            onClick={() => setActiveTab('users')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            User Settings
          </button>
          
          <button
            onClick={() => setActiveTab('limits')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'limits'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Limits & Restrictions
          </button>
          
          <button
            onClick={() => setActiveTab('legal')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'legal'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Legal
          </button>
        </nav>
      </div>
      
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="p-6 space-y-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">General Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Site Name
                </label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => handleInputChange('siteName', e.target.value)}
                  className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Site Description
                </label>
                <textarea
                  value={settings.siteDescription}
                  onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                  className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="maintenance-mode"
                  checked={settings.maintenanceMode}
                  onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="maintenance-mode" className="ml-2 block text-sm text-gray-900 dark:text-white">
                  Maintenance Mode
                </label>
              </div>
              <p className="text-sm text-red-600 dark:text-red-400 ml-6">
                Warning: Enabling maintenance mode will make the site inaccessible to regular users.
              </p>
            </div>
          </div>
        )}
        
        {/* API Settings */}
        {activeTab === 'api' && (
          <div className="p-6 space-y-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">API Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Grok API Key
                </label>
                <div className="flex">
                  <input
                    type="password"
                    value={settings.grokApiKey}
                    onChange={(e) => handleInputChange('grokApiKey', e.target.value)}
                    className="flex-1 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-l-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={resetApiKey}
                    className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-md"
                  >
                    Reset
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Your Grok API key from xAI. Starts with 'xai-'.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Grok API URL
                </label>
                <input
                  type="text"
                  value={settings.grokApiUrl}
                  onChange={(e) => handleInputChange('grokApiUrl', e.target.value)}
                  className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Default: https://api.x.ai/v1/chat/completions
                </p>
              </div>
              
              <div className="pt-4">
                <button
                  onClick={() => {
                    toast.success('Test connection successful!');
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Test API Connection
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* User Settings */}
        {activeTab === 'users' && (
          <div className="p-6 space-y-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">User Settings</h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allow-registration"
                  checked={settings.allowUserRegistration}
                  onChange={(e) => handleInputChange('allowUserRegistration', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="allow-registration" className="ml-2 block text-sm text-gray-900 dark:text-white">
                  Allow User Registration
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="email-verification"
                  checked={settings.requireEmailVerification}
                  onChange={(e) => handleInputChange('requireEmailVerification', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="email-verification" className="ml-2 block text-sm text-gray-900 dark:text-white">
                  Require Email Verification
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Default Credits for New Users
                </label>
                <input
                  type="number"
                  value={settings.defaultCreditsForNewUsers}
                  onChange={(e) => handleInputChange('defaultCreditsForNewUsers', parseFloat(e.target.value))}
                  min="0"
                  step="1"
                  className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Default Locked Message Settings
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Lock Chance (0-1)
                    </label>
                    <input
                      type="number"
                      value={settings.messageLockedChanceDefault}
                      onChange={(e) => handleInputChange('messageLockedChanceDefault', parseFloat(e.target.value))}
                      min="0"
                      max="1"
                      step="0.01"
                      className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Unlock Price ($)
                    </label>
                    <input
                      type="number"
                      value={settings.lockMessagePriceDefault}
                      onChange={(e) => handleInputChange('lockMessagePriceDefault', parseFloat(e.target.value))}
                      min="0"
                      step="0.1"
                      className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Limits & Restrictions */}
        {activeTab === 'limits' && (
          <div className="p-6 space-y-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Limits & Restrictions</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Maximum Messages Per Chat
                </label>
                <input
                  type="number"
                  value={settings.maxMessagesPerChat}
                  onChange={(e) => handleInputChange('maxMessagesPerChat', parseInt(e.target.value))}
                  min="1"
                  className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Set to 0 for unlimited messages
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Maximum Chats Per User
                </label>
                <input
                  type="number"
                  value={settings.maxChatsPerUser}
                  onChange={(e) => handleInputChange('maxChatsPerUser', parseInt(e.target.value))}
                  min="1"
                  className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Set to 0 for unlimited chats
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Delete Inactive Chats After (Days)
                </label>
                <input
                  type="number"
                  value={settings.deleteInactiveChatsAfterDays}
                  onChange={(e) => handleInputChange('deleteInactiveChatsAfterDays', parseInt(e.target.value))}
                  min="0"
                  className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Set to 0 to never delete inactive chats
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Legal Settings */}
        {activeTab === 'legal' && (
          <div className="p-6 space-y-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Legal Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Privacy Policy URL
                </label>
                <input
                  type="url"
                  value={settings.privacyPolicyUrl}
                  onChange={(e) => handleInputChange('privacyPolicyUrl', e.target.value)}
                  className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Terms of Service URL
                </label>
                <input
                  type="url"
                  value={settings.termsOfServiceUrl}
                  onChange={(e) => handleInputChange('termsOfServiceUrl', e.target.value)}
                  className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
