import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useIsPhone } from './useViewSize';
import { useSettingsBooleanFlag } from './useSettingsBooleanFlag';
import { useSettingsContext } from '../contexts/SettingsContext';
import {
  isOutsideLink,
  openInSystemBrowser,
  postReading,
  queueReadingOpen,
  ReadingAction,
  ReadingEvent,
  setFeedReadingOpener,
  supportsReading,
} from '../components/shell/readingStore';
import { getPostPath } from '../lib/links';

// Links inside a wrapper that can show an article. On: Read on a feed card
// goes to the post page with the article behind it, not to a browser over
// the feed. Off: every link out of the app goes to the system browser,
// never the wrapper's own browser view.
export const useInAppLinks = (): void => {
  const router = useRouter();
  const isPhone = useIsPhone();
  const { value: isOptedOut, set: setOptedOut } = useSettingsBooleanFlag(
    'openLinksInAppOptOut',
  );
  const { loadedSettings } = useSettingsContext();
  const setOptedOutRef = useRef(setOptedOut);
  setOptedOutRef.current = setOptedOut;

  // The wrapper mirrors the choice into the system Settings and reports a
  // change made there when the app comes back; both sides say what they
  // know, and only a difference writes.
  useEffect(() => {
    if (!loadedSettings || !supportsReading()) {
      return undefined;
    }
    postReading(ReadingAction.Preference, { inApp: !isOptedOut });
    const onPreference = (event: Event) => {
      const { inApp } =
        (event as CustomEvent<{ inApp?: boolean }>).detail ?? {};
      if (typeof inApp === 'boolean' && inApp === isOptedOut) {
        setOptedOutRef.current(!inApp);
      }
    };
    window.addEventListener(ReadingEvent.Preference, onPreference);
    return () =>
      window.removeEventListener(ReadingEvent.Preference, onPreference);
  }, [isOptedOut, loadedSettings]);

  useEffect(() => {
    if (!isPhone || !supportsReading()) {
      return undefined;
    }
    if (isOptedOut) {
      const onClick = (event: MouseEvent) => {
        const anchor = (event.target as Element | null)?.closest?.('a[href]');
        if (!(anchor instanceof HTMLAnchorElement) || !isOutsideLink(anchor)) {
          return;
        }
        event.preventDefault();
        openInSystemBrowser(anchor.href);
      };
      document.addEventListener('click', onClick, true);
      return () => document.removeEventListener('click', onClick, true);
    }
    // The drawer puts the page where it belongs on arrival; the router's
    // own scroll to the top would land after it.
    setFeedReadingOpener((post, url) => {
      queueReadingOpen(post, url);
      router.push(getPostPath(post), undefined, { scroll: false });
    });
    return () => setFeedReadingOpener(null);
  }, [isPhone, isOptedOut, router]);
};
