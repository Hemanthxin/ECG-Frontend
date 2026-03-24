// src/hooks/useResponsive.js
// Drop this in src/hooks/ and import it in every page component
import { useState, useEffect } from 'react';

export function useResponsive() {
  const [width, setWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return {
    width,
    isMobile:  width <= 480,   // phone
    isTablet:  width <= 768,   // tablet portrait
    isLaptop:  width <= 1024,  // tablet landscape / small laptop
    isDesktop: width > 1024,   // full desktop
  };
}