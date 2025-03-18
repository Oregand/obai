'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ResponsiveContainer from './ResponsiveContainer';
import useResponsive from '@/lib/hooks/useResponsive';

type SideNavItem = {
  href: string;
  label: string;
  icon?: React.ReactNode;
};

type ResponsivePageLayoutProps = {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
  sideNav?: SideNavItem[];
  actions?: React.ReactNode;
};

export default function ResponsivePageLayout({
  children,
  title,
  subtitle,
  breadcrumbs,
  sideNav,
  actions,
}: ResponsivePageLayoutProps) {
  const pathname = usePathname();
  const { isMobile, isTablet } = useResponsive();

  return (
    <div className="min-h-screen bg-midnight">
      <ResponsiveContainer className="py-6 md:py-8">
        {/* Breadcrumbs - Hidden on mobile */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="hidden sm:flex items-center text-sm text-gray-400 mb-6">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {index > 0 && (
                  <svg className="mx-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-blue-400 transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-medium text-gray-300">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{title}</h1>
            {subtitle && <p className="mt-1 text-gray-400">{subtitle}</p>}
          </div>
          
          {actions && (
            <div className="mt-4 sm:mt-0">{actions}</div>
          )}
        </div>

        {/* Main Content Area with Optional Side Navigation */}
        <div className={`flex flex-col ${sideNav ? 'lg:flex-row' : ''} gap-8`}>
          {/* Side Navigation - Horizontal on mobile, vertical sidebar on desktop */}
          {sideNav && (
            <div className={`${isMobile || isTablet ? 'w-full' : 'w-full lg:w-64 flex-shrink-0'}`}>
              {/* Mobile/Tablet: Horizontal Scrolling Tabs */}
              {(isMobile || isTablet) && (
                <div className="overflow-x-auto pb-2 mb-2 border-b border-midnight-light">
                  <div className="flex whitespace-nowrap">
                    {sideNav.map((item, index) => (
                      <Link
                        key={index}
                        href={item.href}
                        className={`
                          inline-flex items-center px-4 py-2 mr-2 rounded-md text-sm font-medium
                          ${pathname === item.href
                            ? 'bg-midnight-light text-white'
                            : 'text-gray-400 hover:text-white hover:bg-midnight-light'}
                          transition-colors
                        `}
                      >
                        {item.icon && <span className="mr-2">{item.icon}</span>}
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Desktop: Vertical Sidebar */}
              {!isMobile && !isTablet && (
                <div className="bg-midnight-darker rounded-lg overflow-hidden sticky top-24">
                  <nav className="p-4">
                    <ul className="space-y-1">
                      {sideNav.map((item, index) => (
                        <li key={index}>
                          <Link
                            href={item.href}
                            className={`
                              flex items-center px-3 py-2 rounded-md text-sm font-medium
                              ${pathname === item.href
                                ? 'bg-midnight-light text-white'
                                : 'text-gray-400 hover:text-white hover:bg-midnight-light'}
                              transition-colors
                            `}
                          >
                            {item.icon && <span className="mr-3">{item.icon}</span>}
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              )}
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-midnight-darker rounded-lg p-4 sm:p-6">
              {children}
            </div>
          </div>
        </div>
      </ResponsiveContainer>
    </div>
  );
}
