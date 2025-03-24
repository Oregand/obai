'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  homeIcon?: boolean;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ 
  items = [], 
  homeIcon = true 
}) => {
  const pathname = usePathname() || '';
  
  // If no items provided, generate from pathname
  const breadcrumbs = items.length > 0 
    ? items 
    : generateFromPath(pathname);
  
  return (
    <nav className="flex mb-6" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm font-medium text-white opacity-70 hover:opacity-100 hover:text-primary"
          >
            {homeIcon ? (
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            ) : null}
            Home
          </Link>
        </li>
        
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          
          return (
            <li key={index} aria-current={isLast ? "page" : undefined}>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-white opacity-30" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                {!isLast && item.href ? (
                  <Link 
                    href={item.href} 
                    className="ml-1 text-sm font-medium text-white opacity-70 hover:opacity-100 hover:text-primary md:ml-2"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="ml-1 text-sm font-medium text-primary md:ml-2">
                    {item.label}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

// Helper function to generate breadcrumbs from pathname
const generateFromPath = (pathname: string): BreadcrumbItem[] => {
  if (pathname === '/') return [];
  
  const paths = pathname.split('/').filter(Boolean);
  
  return paths.map((path, index) => {
    // Create the href for this breadcrumb
    const href = index === paths.length - 1 
      ? undefined 
      : `/${paths.slice(0, index + 1).join('/')}`;
    
    // Format the label (capitalize first letter and replace hyphens with spaces)
    const label = path.charAt(0).toUpperCase() + 
                  path.slice(1).replace(/-/g, ' ');
    
    return { label, href };
  });
};

export default Breadcrumbs;
