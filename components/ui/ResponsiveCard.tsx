'use client';

import React from 'react';

type ResponsiveCardProps = {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
};

export default function ResponsiveCard({
  children,
  title,
  subtitle,
  icon,
  footer,
  actions,
  className = '',
  onClick,
  hoverable = false,
}: ResponsiveCardProps) {
  const cardClasses = [
    'bg-midnight-darker rounded-lg overflow-hidden border border-midnight-light',
    hoverable ? 'hover:border-blue-500 hover:shadow-lg transition-all duration-200 cursor-pointer' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={cardClasses}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Card Header */}
      {(title || subtitle || icon || actions) && (
        <div className="p-4 sm:p-6 border-b border-midnight-light flex justify-between items-start">
          <div className="flex items-start">
            {icon && (
              <div className="mr-4 text-blue-500 flex-shrink-0">
                {icon}
              </div>
            )}
            <div>
              {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
              {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
            </div>
          </div>
          {actions && (
            <div className="ml-4 flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Card Content */}
      <div className="p-4 sm:p-6">
        {children}
      </div>

      {/* Card Footer */}
      {footer && (
        <div className="px-4 sm:px-6 py-3 bg-midnight border-t border-midnight-light">
          {footer}
        </div>
      )}
    </div>
  );
}
