'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    const checkAdminStatus = async () => {
      try {
        const response = await fetch('/api/admin/check-status');
        const data = await response.json();
        
        if (!data.isAdmin) {
          router.push('/');
          return;
        }
        
        setIsAdmin(true);
      } catch (error) {
        console.error('Error checking admin status:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      checkAdminStatus();
    }
  }, [router, status]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-midnight">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-white dark:bg-midnight-darker shadow-md">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <h1 className="text-xl font-bold text-primary">OBAI Admin</h1>
          </div>
          
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/admin"
                  className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800"
                >
                  <span className="ml-3">Dashboard</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/admin/personas"
                  className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800"
                >
                  <span className="ml-3">Personas</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/admin/users"
                  className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800"
                >
                  <span className="ml-3">Users</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/admin/pricing"
                  className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800"
                >
                  <span className="ml-3">Pricing</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/admin/analytics"
                  className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800"
                >
                  <span className="ml-3">Analytics</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/admin/settings"
                  className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800"
                >
                  <span className="ml-3">Settings</span>
                </Link>
              </li>
            </ul>
          </nav>
          
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <Link 
              href="/"
              className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800"
            >
              <span className="ml-3">Back to App</span>
            </Link>
          </div>
        </div>
      </aside>
      
      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  );
}
