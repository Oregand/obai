'use client';

import React from 'react';

type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';
type FlexDirectionResponsive = {
  default: FlexDirection;
  sm?: FlexDirection;
  md?: FlexDirection;
  lg?: FlexDirection;
  xl?: FlexDirection;
};

type JustifyContent = 
  | 'start' 
  | 'end' 
  | 'center' 
  | 'between' 
  | 'around' 
  | 'evenly';

type AlignItems = 'start' | 'end' | 'center' | 'baseline' | 'stretch';

type ResponsiveFlexProps = {
  children: React.ReactNode;
  direction?: FlexDirection | FlexDirectionResponsive;
  justify?: JustifyContent;
  align?: AlignItems;
  wrap?: boolean;
  gap?: number;
  className?: string;
};

export default function ResponsiveFlex({
  children,
  direction = 'row',
  justify = 'start',
  align = 'start',
  wrap = false,
  gap = 0,
  className = '',
}: ResponsiveFlexProps) {
  // Process direction (handle both simple string and responsive object)
  let directionClasses = '';
  
  if (typeof direction === 'string') {
    directionClasses = `flex-${direction}`;
  } else {
    // Handle responsive direction
    directionClasses = [
      `flex-${direction.default}`,
      direction.sm ? `sm:flex-${direction.sm}` : '',
      direction.md ? `md:flex-${direction.md}` : '',
      direction.lg ? `lg:flex-${direction.lg}` : '',
      direction.xl ? `xl:flex-${direction.xl}` : '',
    ].filter(Boolean).join(' ');
  }

  // Justify content class
  const justifyClass = `justify-${justify}`;
  
  // Align items class
  const alignClass = `items-${align}`;
  
  // Wrap class
  const wrapClass = wrap ? 'flex-wrap' : 'flex-nowrap';
  
  // Gap class
  const gapClass = gap > 0 ? `gap-${gap}` : '';

  return (
    <div className={`flex ${directionClasses} ${justifyClass} ${alignClass} ${wrapClass} ${gapClass} ${className}`}>
      {children}
    </div>
  );
}
