import { useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  cancelScrollRestoration,
  getScrollPosition,
  isScrollRestoring,
  restoreScrollPosition,
  saveScrollPosition,
} from '../lib/scrollRestoration';

export const useScrollRestoration = (): void => {
  const { asPath, events } = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      if (!isScrollRestoring()) {
        saveScrollPosition(asPath, window.scrollY);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    events?.on('routeChangeStart', cancelScrollRestoration);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      events?.off('routeChangeStart', cancelScrollRestoration);
    };
  }, [asPath, events]);

  useEffect(() => {
    const target = getScrollPosition(asPath);
    return target ? restoreScrollPosition(target) : undefined;
  }, [asPath]);
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
