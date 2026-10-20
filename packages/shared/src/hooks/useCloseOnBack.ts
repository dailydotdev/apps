import { useCallback, useEffect, useRef } from 'react';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import { isExtension } from '../lib/func';

const entryFlag = '__closeOnBack';

type HistoryState = { key?: string; [entryFlag]?: boolean } | null;

const historyState = (): HistoryState =>
  globalThis.history?.state as HistoryState;

interface UseCloseOnBackProps {
  enabled: boolean;
  onBack: () => void;
}

interface UseCloseOnBack {
  // Puts the entry back after a back the overlay chose not to close on.
  restore: () => void;
  // Takes the overlay's entry off history; navigate only once it resolves,
  // or the browser's back lands after the new page's push.
  release: () => Promise<void>;
}

// An overlay that closes on the browser's back (Android's back gesture and
// button included) instead of the page under it leaving. It adds one history
// entry for the same URL, a copy of the page's own state so Next, the route
// stack and scroll restoration still see the page's entry, and treats a
// back onto the page's entry as a close.
export const useCloseOnBack = ({
  enabled,
  onBack,
}: UseCloseOnBackProps): UseCloseOnBack => {
  const router = useRouter() as NextRouter | null;
  const onBackRef = useRef(onBack);
  onBackRef.current = onBack;
  const key = useRef<string | undefined>(undefined);
  const isPushed = useRef(false);
  const releasing = useRef<Promise<void> | null>(null);
  // The extension's router is not Next's, and its companion runs on other
  // sites' history.
  const canUse =
    enabled && !isExtension && typeof router?.beforePopState === 'function';

  const push = useCallback(() => {
    const state = historyState();
    key.current = state?.key;
    globalThis.history.pushState({ ...state, [entryFlag]: true }, '');
    isPushed.current = true;
  }, []);

  const release = useCallback((): Promise<void> => {
    if (releasing.current) {
      return releasing.current;
    }
    if (!isPushed.current || !historyState()?.[entryFlag] || !router) {
      isPushed.current = false;
      return Promise.resolve();
    }

    isPushed.current = false;
    const pageKey = key.current;
    releasing.current = new Promise<void>((resolve) => {
      const onPopState = () => {
        globalThis.removeEventListener('popstate', onPopState);
        router.beforePopState(() => true);
        releasing.current = null;
        resolve();
      };
      // The page is already showing: Next must not route to it again.
      router.beforePopState(
        (state) => (state as HistoryState)?.key !== pageKey,
      );
      globalThis.addEventListener('popstate', onPopState);
      globalThis.history.back();
    });

    return releasing.current;
  }, [router]);

  useEffect(() => {
    if (!canUse || !router) {
      return undefined;
    }

    push();

    const onPopState = () => {
      if (!isPushed.current || releasing.current) {
        return;
      }
      isPushed.current = false;
      // Back onto the page's own entry closes the overlay; a jump further
      // back is a real navigation, which closes it through the route change.
      if (historyState()?.key === key.current) {
        onBackRef.current();
      }
    };
    // A navigation the overlay did not start (a link inside it) leaves its
    // entry where it is: going back over it then shows the same page.
    const onRouteChangeStart = () => {
      if (!releasing.current) {
        isPushed.current = false;
      }
    };

    router.beforePopState(
      (state) =>
        !isPushed.current || (state as HistoryState)?.key !== key.current,
    );
    globalThis.addEventListener('popstate', onPopState);
    router.events.on('routeChangeStart', onRouteChangeStart);

    return () => {
      globalThis.removeEventListener('popstate', onPopState);
      router.events.off('routeChangeStart', onRouteChangeStart);
      if (!releasing.current) {
        router.beforePopState(() => true);
      }
      release();
    };
    // The entry belongs to this mount; the router instance does not change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canUse]);

  const restore = useCallback(() => {
    if (canUse && !isPushed.current) {
      push();
    }
  }, [canUse, push]);

  return { restore, release };
};
