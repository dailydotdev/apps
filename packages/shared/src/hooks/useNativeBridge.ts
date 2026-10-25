import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../contexts/AuthContext';
import { WebKitMessageHandlers } from '../lib/ios';
import {
  HapticStyle,
  playHaptic,
  postNativeMessage,
  setNativeHandlers,
} from '../lib/nativeBridge';
import { refreshPage } from '../components/shell/shellRefresh';
import {
  hasOpenLayer,
  requestReadingClose,
} from '../components/shell/readingStore';
import {
  isRootView,
  owningRoot,
  ShellRoot,
} from '../components/shell/shellNav';
import { useReadingStreak } from './streaks/useReadingStreak';

// What a back press closes before history moves: the reading drawer, then
// the top-most sheet, menu or dialog.
export const closeTopLayer = (): boolean => {
  if (requestReadingClose()) {
    return true;
  }

  if (!hasOpenLayer()) {
    return false;
  }

  (document.activeElement ?? document.body).dispatchEvent(
    new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    }),
  );
  return true;
};

// The web side of the wrappers' contract: what they call on the page
// (refresh, back), and what the page tells them (where it is, and a light
// impact when the streak goes up). Silent until a wrapper takes the message.
export const useNativeBridge = (): void => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAndroidApp } = useAuthContext();
  const { streak } = useReadingStreak();
  const lastStreak = useRef<number>();

  useEffect(() => {
    setNativeHandlers({
      refresh: () => refreshPage(queryClient).then(() => true),
      back: closeTopLayer,
    });
    return () => setNativeHandlers(null);
  }, [queryClient]);

  useEffect(() => {
    const root = owningRoot(router.pathname);
    postNativeMessage(WebKitMessageHandlers.NavState, {
      path: router.asPath.split(/[?#]/)[0],
      isRoot: isRootView(root, router.pathname),
      isHome: root === ShellRoot.Home && isRootView(root, router.pathname),
    });
  }, [router.asPath, router.pathname]);

  const current = streak?.current;
  useEffect(() => {
    if (current === undefined) {
      return;
    }
    if (lastStreak.current !== undefined && current > lastStreak.current) {
      playHaptic(HapticStyle.Success, isAndroidApp);
    }
    lastStreak.current = current;
  }, [current, isAndroidApp]);
};
