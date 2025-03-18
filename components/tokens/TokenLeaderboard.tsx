import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import LoadingSpinner from '../ui/LoadingSpinner';

interface LeaderboardUser {
  id: string;
  name: string;
  image: string | null;
  tokensSpent: number;
  rank: number;
}

interface TokenLeaderboardProps {
  period: 'weekly' | 'monthly' | 'allTime';
  limit?: number;
}

const TokenLeaderboard: React.FC<TokenLeaderboardProps> = ({ period = 'weekly', limit = 10 }) => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);

  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/leaderboard?period=${period}&limit=${limit}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard data');
        }
        
        const data = await response.json();
        setUsers(data.users);
        setCurrentUserRank(data.currentUserRank);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        setError('Failed to load leaderboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [period, limit]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <LoadingSpinner size="medium" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-primary text-center bg-primary/10 rounded">
        {error}
      </div>
    );
  }

  // Generate period label
  const periodLabel = period === 'weekly' ? 'This Week' : period === 'monthly' ? 'This Month' : 'All Time';

  return (
    <div className="bg-midnight-lighter rounded-lg border border-primary/20 overflow-hidden">
      <div className="p-4 border-b border-primary/20">
        <h3 className="text-lg font-medium text-white">Top Token Spenders</h3>
        <p className="text-sm text-white opacity-60">{periodLabel}</p>
      </div>
      
      <div className="divide-y divide-primary/10">
        {users.length === 0 ? (
          <div className="p-6 text-center text-white opacity-70">
            No leaderboard data available yet
          </div>
        ) : (
          users.map((user, index) => (
            <div 
              key={user.id} 
              className={`p-4 flex items-center ${index < 3 ? 'bg-primary bg-opacity-' + (10 - index * 3) : ''}`}
            >
              <div className="flex-shrink-0 w-8 text-center font-semibold text-primary">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
              </div>
              
              <div className="flex-shrink-0 ml-3">
                {user.image ? (
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <Image 
                      src={user.image} 
                      alt={user.name || 'User'} 
                      width={32} 
                      height={32} 
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.name?.[0] || 'U'}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.name}
                </p>
              </div>
              
              <div className="flex-shrink-0 text-sm text-white">
                <span className="font-medium">{user.tokensSpent.toLocaleString()}</span>
                <span className="text-white opacity-60 ml-1">tokens</span>
              </div>
            </div>
          ))
        )}
      </div>
      
      {currentUserRank !== null && currentUserRank > users.length && (
        <div className="p-4 border-t border-primary/20 bg-secondary-dark">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-8 text-center font-medium text-white opacity-70">
              #{currentUserRank}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-white">
                You
              </p>
            </div>
            <div className="text-sm text-white">
              <span>Spend more tokens to climb the leaderboard!</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenLeaderboard;
