'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalChats: 0,
    totalMessages: 0,
    totalCredits: 0,
    premiumPersonas: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const response = await fetch('/api/admin/dashboard');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Welcome, {session?.user?.name || 'Admin'}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Users" value={stats.totalUsers} />
        <StatCard title="Active Subscriptions" value={stats.activeSubscriptions} />
        <StatCard title="Total Chats" value={stats.totalChats} />
        <StatCard title="Total Messages" value={stats.totalMessages} />
        <StatCard title="Total Credits" value={stats.totalCredits} />
        <StatCard title="Premium Personas" value={stats.premiumPersonas} />
      </div>

      <div className="bg-white dark:bg-midnight-lighter rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickActionButton href="/admin/personas/create" label="Create New Persona" />
          <QuickActionButton href="/admin/users" label="Manage Users" />
          <QuickActionButton href="/admin/pricing" label="Update Pricing" />
          <QuickActionButton href="/admin/settings" label="System Settings" />
          <QuickActionButton href="/admin/analytics" label="View Analytics" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white dark:bg-midnight-lighter rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">{title}</h3>
      <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">{value.toLocaleString()}</p>
    </div>
  );
}

function QuickActionButton({ href, label }: { href: string; label: string }) {
  return (
    <a 
      href={href}
      className="block text-center py-3 px-4 bg-gray-50 dark:bg-midnight-darker border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
    >
      {label}
    </a>
  );
}
