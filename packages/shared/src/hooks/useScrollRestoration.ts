import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import {
  cancelScrollRestoration,
  getHistoryEntryKey,
  getScrollPosition,
  isScrollRestoring,
  restoreScrollPosition,
  saveHistoryEntryScrollPosition,
  takeViewSwitch,
} from '../lib/scrollRestoration';

export const useScrollRestoration = (): void => {
  const { asPath, events } = useRouter();
  const displayedEntry = useRef<string>();
  const isSwitchingView = useRef(false);

  useEffect(() => {
    if (typeof window.history?.scrollRestoration !== 'undefined') {
      window.history.scrollRestoration = 'manual';
    }

    // A view switched in place (a tab, announced with expectViewSwitch) is
    // not leaving the entry: nothing is saved and nothing is restored. On
    // back and forward the browser is already on the other entry when Next
    // speaks, which Next can flag shallow too.
    const onLeave = (_: string, { shallow }: { shallow?: boolean } = {}) => {
      isSwitchingView.current =
        takeViewSwitch() &&
        !!shallow &&
        displayedEntry.current === getHistoryEntryKey();
      if (isSwitchingView.current) {
        return;
      }
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
    if (isSwitchingView.current) {
      isSwitchingView.current = false;
      return undefined;
    }
    const target = getScrollPosition(window.location.href);
    return target ? restoreScrollPosition(target) : undefined;
  }, [asPath]);
};
