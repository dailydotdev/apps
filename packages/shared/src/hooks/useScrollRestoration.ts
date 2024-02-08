import { useEffect } from 'react';

import { useRouter } from 'next/router';

const scrollPositions: Record<string, number> = {};

const restorablePaths = [
  '/',
  '/my-feed',
  '/popular',
  '/search',
  '/upvoted',
  '/discussed',
  '/squads',
  '/sources',
];

export const useScrollRestoration = (): void => {
  const { pathname } = useRouter();

  useEffect(() => {
    if (typeof window.history?.scrollRestoration !== 'undefined') {
      window.history.scrollRestoration = 'manual';
    }

    const handleScroll = () => {
      scrollPositions[pathname] = window.scrollY;
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      if (typeof window.history?.scrollRestoration !== 'undefined') {
        window.history.scrollRestoration = 'auto';
      }

      window.removeEventListener('scroll', handleScroll);
    };
  }, [pathname]);

  useEffect(() => {
    if (!restorablePaths.some((path) => pathname.startsWith(path))) {
      window.scrollTo(0, 0);

      return;
    }

    const scrollPosition = scrollPositions[pathname] || 0;

    window.scrollTo(0, scrollPosition);
  }, [pathname]);
};
