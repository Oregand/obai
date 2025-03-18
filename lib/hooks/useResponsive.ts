'use client';

import { useState, useEffect } from 'react';
import { breakpoints } from '@/lib/responsive/utilities';

type BreakpointKey = keyof typeof breakpoints;
type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'large-desktop';

export default function useResponsive() {
  const [windowWidth, setWindowWidth] = useState<number>(0);
  const [deviceType, setDeviceType] = useState<DeviceType>('mobile');

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        const width = window.innerWidth;
        setWindowWidth(width);
        
        // Update device type based on width
        if (width < breakpoints.sm) {
          setDeviceType('mobile');
        } else if (width < breakpoints.lg) {
          setDeviceType('tablet');
        } else if (width < breakpoints.xl) {
          setDeviceType('desktop');
        } else {
          setDeviceType('large-desktop');
        }
      };

      // Set initial values
      handleResize();
      
      // Add event listener for window resize
      window.addEventListener('resize', handleResize);
      
      // Clean up event listener on component unmount
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Create helper functions to check against breakpoints
  const isGreaterThan = (breakpoint: BreakpointKey): boolean => {
    return windowWidth >= breakpoints[breakpoint];
  };

  const isLessThan = (breakpoint: BreakpointKey): boolean => {
    return windowWidth < breakpoints[breakpoint];
  };

  const isBetween = (min: BreakpointKey, max: BreakpointKey): boolean => {
    return windowWidth >= breakpoints[min] && windowWidth < breakpoints[max];
  };

  return {
    width: windowWidth,
    deviceType,
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop' || deviceType === 'large-desktop',
    isLargeDesktop: deviceType === 'large-desktop',
    isGreaterThan,
    isLessThan,
    isBetween,
    breakpoints,
  };
}
