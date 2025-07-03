import { useEffect } from 'react';

import { useRouter } from 'next/router';

const scrollPositions: Record<string, number> = {};

export const useScrollRestoration = (): void => {
  const { pathname } = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      scrollPositions[pathname] = window.scrollY;
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [pathname]);

  useEffect(() => {
    const scrollPosition = scrollPositions[pathname] || 0;

    // Add a small delay to ensure content is loaded before restoring scroll
    // This is especially important for feed pages that load content dynamically
    const timeoutId = setTimeout(() => {
      window.scrollTo(0, scrollPosition);
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [pathname]);
};

export const useManualScrollRestoration = (): void => {
  useEffect(() => {
    if (typeof window.history?.scrollRestoration !== 'undefined') {
      window.history.scrollRestoration = 'manual';
    }

    return () => {
      if (typeof window.history?.scrollRestoration !== 'undefined') {
        window.history.scrollRestoration = 'auto';
      }
    };
  }, []);
};
