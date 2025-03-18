'use client';

import React from 'react';
import Link from 'next/link';
import ResponsiveNavbar from '@/components/navigation/ResponsiveNavbar';
import ResponsiveContainer from '@/components/layout/ResponsiveContainer';
import { responsiveText } from '@/lib/responsive/utilities';

// Sample navigation links for demo
const navLinks = [
  { href: '/demo', label: 'Home' },
  { href: '/demo/about', label: 'About' },
  { href: '/demo/features', label: 'Features' },
  { href: '/demo/pricing', label: 'Pricing' },
  { href: '/demo/contact', label: 'Contact' },
];

export default function ResponsiveDemoPage() {
  return (
    <div className="min-h-screen bg-midnight flex flex-col">
      {/* Navigation Bar with Fixed Hamburger Menu */}
      <ResponsiveNavbar 
        links={navLinks}
        logo={
          <div className="text-2xl font-bold text-blue-500">OBAI</div>
        }
        actions={
          <button className="px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-700 transition-colors">
            Login
          </button>
        }
      />
      
      {/* Main Content */}
      <main className="flex-1 py-12">
        <ResponsiveContainer>
          <div className="text-center mb-12">
            <h1 className={`${responsiveText.heading1} text-white mb-6`}>
              Responsive Navigation Demo
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              This demo shows the fixed hamburger menu implementation. Try resizing your browser or viewing on different devices to see how the navigation adapts.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-midnight-darker p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-white mb-4">
                Mobile-First Design
              </h2>
              <p className="text-gray-300">
                The navigation is built mobile-first, with a hamburger menu that transforms into a full navigation bar on larger screens.
              </p>
            </div>
            
            <div className="bg-midnight-darker p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-white mb-4">
                Animated Transitions
              </h2>
              <p className="text-gray-300">
                The hamburger menu uses smooth animations for opening and closing, with proper handling of focus and accessibility.
              </p>
            </div>
            
            <div className="bg-midnight-darker p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-white mb-4">
                Keyboard Navigation
              </h2>
              <p className="text-gray-300">
                Try using the tab key to navigate the menu. The focus is properly trapped within the menu when it's open.
              </p>
            </div>
            
            <div className="bg-midnight-darker p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-white mb-4">
                Touch-Friendly
              </h2>
              <p className="text-gray-300">
                All interactive elements have appropriate touch targets for mobile devices, following accessibility best practices.
              </p>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-gray-400">
              This implementation fixes common hamburger menu issues like:
            </p>
            <ul className="text-gray-300 mt-4 space-y-2">
              <li>• Broken animations on state changes</li>
              <li>• Menu staying open when it should close</li>
              <li>• Proper focus management for accessibility</li>
              <li>• Smooth transitions between states</li>
              <li>• Appropriately sized touch targets</li>
            </ul>
            
            <div className="mt-8">
              <Link href="/demo/chat-layout" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                View Chat Layout Demo
              </Link>
              <p className="mt-2 text-sm text-gray-400">Check out the fixed responsive left menu implementation</p>
            </div>
          </div>
        </ResponsiveContainer>
      </main>
    </div>
  );
}
