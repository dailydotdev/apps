import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import {
  cancelScrollRestoration,
  getHistoryEntryKey,
  getScrollPosition,
  isScrollRestoring,
  restoreScrollPosition,
  saveHistoryEntryScrollPosition,
} from '../lib/scrollRestoration';

export const useScrollRestoration = (): void => {
  const { asPath, events } = useRouter();
  const displayedEntry = useRef<string>();

  useEffect(() => {
    if (typeof window.history?.scrollRestoration !== 'undefined') {
      window.history.scrollRestoration = 'manual';
    }

    const onLeave = () => {
      if (isScrollRestoring()) {
        cancelScrollRestoration();
        return;
      }
      if (displayedEntry.current) {
        saveHistoryEntryScrollPosition(displayedEntry.current, window.scrollY);
      }
    };

    events?.on('routeChangeStart', onLeave);
    events?.on('hashChangeStart', onLeave);

    return () => {
      events?.off('routeChangeStart', onLeave);
      events?.off('hashChangeStart', onLeave);
      if (typeof window.history?.scrollRestoration !== 'undefined') {
        window.history.scrollRestoration = 'auto';
      }
    };
  }, [events]);

  useEffect(() => {
    displayedEntry.current = getHistoryEntryKey();
    const target = getScrollPosition(window.location.href);
    return target ? restoreScrollPosition(target) : undefined;
  }, [asPath]);
};
