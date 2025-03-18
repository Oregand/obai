// Responsive breakpoints that match Tailwind's default breakpoints
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

// Hook to check if we're on a mobile device (useful for conditional rendering)
export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < breakpoints.md;
};

// Hook to get the current viewport size
export const getViewportSize = (): { width: number; height: number } => {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0 };
  }
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
};

// CSS utility for hiding content visually but keeping it accessible to screen readers
export const srOnly = `
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
`;

// Common responsive padding patterns
export const responsivePadding = {
  // Consistent horizontal padding that increases with screen size
  x: 'px-4 sm:px-6 md:px-8 lg:px-12',
  // Vertical padding that increases with screen size
  y: 'py-4 sm:py-6 md:py-8 lg:py-12',
  // Combined horizontal and vertical padding
  all: 'p-4 sm:p-6 md:p-8 lg:p-12',
};

// Common responsive margin patterns
export const responsiveMargin = {
  // Consistent horizontal margin that increases with screen size
  x: 'mx-4 sm:mx-6 md:mx-8 lg:mx-12',
  // Vertical margin that increases with screen size
  y: 'my-4 sm:my-6 md:my-8 lg:my-12',
  // Combined horizontal and vertical margin
  all: 'm-4 sm:m-6 md:m-8 lg:m-12',
};

// Common responsive typography patterns
export const responsiveText = {
  heading1: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold',
  heading2: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold',
  heading3: 'text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold',
  paragraph: 'text-sm sm:text-base md:text-lg',
  small: 'text-xs sm:text-sm',
};

// Responsive container for consistent content width
export const containerClasses = 'w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';

// Responsive grid layouts
export const responsiveGrid = {
  // Grid that shows 1 column on mobile, 2 on tablet, 3 on desktop, 4 on large desktop
  adaptive: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6',
  // Grid that maintains consistent column count but adjusts gap
  consistent: 'grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8',
};

// Responsive flex layouts
export const responsiveFlex = {
  // Stack on mobile, row on larger screens
  stackToRow: 'flex flex-col md:flex-row',
  // Row on mobile, stack on larger screens
  rowToStack: 'flex flex-row md:flex-col',
  // Centered column on mobile, row with space-between on larger screens
  centeredToSpaceBetween: 'flex flex-col items-center md:flex-row md:justify-between',
};
