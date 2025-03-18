'use client';

import React from 'react';
import { containerClasses } from '@/lib/responsive/utilities';

type ResponsiveContainerProps = {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
  as?: React.ElementType;
};

export default function ResponsiveContainer({
  children,
  className = '',
  fullWidth = false,
  as: Component = 'div',
}: ResponsiveContainerProps) {
  // If fullWidth is true, don't apply max-width constraint
  const containerClassName = fullWidth
    ? 'w-full px-4 sm:px-6 lg:px-8'
    : containerClasses;

  return (
    <Component className={`${containerClassName} ${className}`}>
      {children}
    </Component>
  );
}
