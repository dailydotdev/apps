import { useRouter } from 'next/router';
import { useEffect } from 'react';

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

    window.scrollTo(0, scrollPosition);
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
