'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

export default function DebugPage() {
  const { data: session, status } = useSession();
  const [selectedTier, setSelectedTier] = useState('premium');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [userStatus, setUserStatus] = useState<any>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  
  // Fetch user status
  const fetchUserStatus = async () => {
    setStatusLoading(true);
    try {
      const response = await fetch('/api/debug/user-status');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch user status');
      }
      
      setUserStatus(data);
    } catch (error: unknown) {
      console.error('Error fetching user status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user status';
      toast.error(errorMessage);
    } finally {
      setStatusLoading(false);
    }
  };
  
  // Fetch status on load
  useEffect(() => {
    if (status === 'authenticated') {
      fetchUserStatus();
    }
  }, [status]);
  
  // Direct update subscription
  const handleDirectUpdate = async (tier: string) => {
    if (!confirm(`Are you sure you want to set subscription directly to ${tier}?`)) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/debug/direct-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tier })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update subscription');
      }
      
      toast.success(`Successfully updated to ${tier}`);
      
      // Refresh status after update
      fetchUserStatus();
    } catch (error: unknown) {
      console.error('Error updating subscription:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update subscription';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpgradeSubscription = async () => {
    if (!confirm(`Are you sure you want to upgrade to ${selectedTier}?`)) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`/api/debug/upgrade-subscription?tier=${selectedTier}`, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upgrade subscription');
      }
      
      setResult(data);
      setUserStatus(null); // Clear status to force refetch
      toast.success(`Successfully upgraded to ${selectedTier}`);
      
      // Refresh status after upgrade
      fetchUserStatus();
    } catch (error: unknown) {
      console.error('Error upgrading subscription:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upgrade subscription';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  if (status === 'loading') {
    return <div>Loading...</div>;
  }
  
  if (status === 'unauthenticated') {
    return <div>Please login to use this debug page</div>;
  }
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Developer Debug Tools</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Detailed User Status</h2>
          <button 
            onClick={fetchUserStatus}
            className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700">
            Refresh
          </button>
        </div>
        
        {statusLoading ? (
          <div className="text-center p-4">Loading status...</div>
        ) : userStatus ? (
          <>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="font-medium mb-2">User DB Record:</h3>
                <div className="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-auto">
                  <div><strong>ID:</strong> {userStatus.user?.id}</div>
                  <div><strong>Name:</strong> {userStatus.user?.name}</div>
                  <div><strong>Email:</strong> {userStatus.user?.email}</div>
                  <div><strong>Subscription:</strong> {userStatus.user?.subscriptionStatus || 'none'}</div>
                  <div><strong>Expiry:</strong> {userStatus.user?.subscriptionExpiry ? new Date(userStatus.user.subscriptionExpiry).toLocaleString() : 'none'}</div>
                  <div><strong>Credits:</strong> {userStatus.user?.credits}</div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Service Subscription:</h3>
                <div className="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-auto">
                  <div><strong>Tier:</strong> {userStatus.serviceSubscription?.tier}</div>
                  <div><strong>Status:</strong> {userStatus.serviceSubscription?.status}</div>
                  <div><strong>Expires:</strong> {userStatus.serviceSubscription?.expiresAt ? new Date(userStatus.serviceSubscription.expiresAt).toLocaleString() : 'none'}</div>
                  <div><strong>Features:</strong></div>
                  <ul className="list-disc pl-5">
                    {userStatus.serviceSubscription?.features?.map((feature: string, index: number) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Active Subscriptions:</h3>
              {userStatus.dbSubscriptions?.length > 0 ? (
                <div className="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-auto">
                  {userStatus.dbSubscriptions.map((sub: any, index: number) => (
                    <div key={index} className="mb-2 pb-2 border-b border-gray-700">
                      <div><strong>ID:</strong> {sub.id}</div>
                      <div><strong>Tier:</strong> {sub.tier}</div>
                      <div><strong>Status:</strong> {sub.status}</div>
                      <div><strong>Start:</strong> {new Date(sub.startDate).toLocaleString()}</div>
                      <div><strong>End:</strong> {new Date(sub.endDate).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-800 text-yellow-400 p-3 rounded text-sm">No active subscriptions found</div>
              )}
            </div>
            
            <div className="mt-4">
              <h3 className="font-medium mb-2">Raw Data:</h3>
              <div className="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-auto h-64">
                <pre>{JSON.stringify(userStatus, null, 2)}</pre>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center p-4">No status data available</div>
        )}
      </div>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-8">
        <h2 className="text-lg font-medium mb-4">Direct Subscription Update</h2>
        <p className="text-sm text-gray-600 mb-4">
          This will directly update your subscription status in the database.<br/>
          <strong>Use this if the regular upgrade doesn't work properly.</strong>
        </p>
        
        <div className="flex space-x-2">
          <button
            onClick={() => handleDirectUpdate('free')}
            disabled={loading}
            className="bg-gray-500 text-white px-3 py-2 rounded hover:bg-gray-600 disabled:opacity-50"
          >
            Free
          </button>
          <button
            onClick={() => handleDirectUpdate('basic')}
            disabled={loading}
            className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            Basic
          </button>
          <button
            onClick={() => handleDirectUpdate('premium')}
            disabled={loading}
            className="bg-purple-600 text-white px-3 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
          >
            Premium
          </button>
          <button
            onClick={() => handleDirectUpdate('vip')}
            disabled={loading}
            className="bg-amber-600 text-white px-3 py-2 rounded hover:bg-amber-700 disabled:opacity-50"
          >
            VIP
          </button>
        </div>
      </div>
      
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-lg font-medium mb-4">Upgrade Subscription API</h2>
        <p className="text-sm text-gray-600 mb-4">
          This uses the standard API to upgrade your subscription.
        </p>
        
        <div className="mb-4">
          <label className="block mb-2">Select Tier:</label>
          <select 
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="p-2 border rounded w-full"
          >
            <option value="premium">Premium</option>
            <option value="vip">VIP</option>
          </select>
        </div>
        
        <button
          onClick={handleUpgradeSubscription}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Upgrading...' : 'Upgrade Subscription'}
        </button>
        
        {result && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">Result:</h3>
            <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
