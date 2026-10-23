import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useIsPhone } from './useViewSize';
import { useSettingsBooleanFlag } from './useSettingsBooleanFlag';
import {
  queueReadingOpen,
  setFeedReadingOpener,
  supportsReading,
} from '../components/shell/readingStore';
import { getPostPath } from '../lib/links';

// Inside a wrapper that can show an article, Read on a feed card goes to
// the post page with the article behind it, not to a browser over the feed.
export const useReadingFromFeed = (): void => {
  const router = useRouter();
  const isPhone = useIsPhone();
  const { value: isOptedOut } = useSettingsBooleanFlag('openLinksInAppOptOut');

  useEffect(() => {
    if (!isPhone || isOptedOut || !supportsReading()) {
      return undefined;
    }
    setFeedReadingOpener((post) => {
      queueReadingOpen(post.id, post.url);
      router.push(getPostPath(post));
    });
    return () => setFeedReadingOpener(null);
  }, [isPhone, isOptedOut, router]);
};
