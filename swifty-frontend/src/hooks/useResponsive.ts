import { useState, useEffect } from 'react';

export const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getPadding = (desktop: string = '40px', mobile: string = '16px') => {
    return isMobile ? mobile : desktop;
  };

  const getFontSize = (desktop: string, mobile?: string) => {
    return isMobile && mobile ? mobile : desktop;
  };

  const getGridColumns = (desktop: number = 4, tablet: number = 2, mobile: number = 1) => {
    if (isMobile) return mobile;
    if (isTablet) return tablet;
    return desktop;
  };

  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    getPadding,
    getFontSize,
    getGridColumns,
  };
};
