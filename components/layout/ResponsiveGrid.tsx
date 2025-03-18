'use client';

import React from 'react';

type ResponsiveGridProps = {
  children: React.ReactNode;
  columns?: {
    default: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: {
    default: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  className?: string;
};

export default function ResponsiveGrid({
  children,
  columns = { default: 1, sm: 2, lg: 3, xl: 4 },
  gap = { default: 4, md: 6, lg: 8 },
  className = '',
}: ResponsiveGridProps) {
  // Generate responsive grid column classes
  const gridColClasses = [
    `grid-cols-${columns.default}`,
    columns.sm ? `sm:grid-cols-${columns.sm}` : '',
    columns.md ? `md:grid-cols-${columns.md}` : '',
    columns.lg ? `lg:grid-cols-${columns.lg}` : '',
    columns.xl ? `xl:grid-cols-${columns.xl}` : '',
  ].filter(Boolean).join(' ');

  // Generate responsive gap classes
  const gapClasses = [
    `gap-${gap.default}`,
    gap.sm ? `sm:gap-${gap.sm}` : '',
    gap.md ? `md:gap-${gap.md}` : '',
    gap.lg ? `lg:gap-${gap.lg}` : '',
    gap.xl ? `xl:gap-${gap.xl}` : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={`grid ${gridColClasses} ${gapClasses} ${className}`}>
      {children}
    </div>
  );
}
