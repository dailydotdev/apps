import { useCallback } from 'react';
import { useRouter } from 'next/router';
import { useLogContext } from '../../contexts/LogContext';
import type { Origin } from '../../lib/log';
import { LogEvent } from '../../lib/log';
import { QueryStateKeys, useQueryState } from '../../hooks/utils/useQueryState';
import useCustomDefaultFeed from '../../hooks/feed/useCustomDefaultFeed';
import { FeedTuneTab } from './types';
import { useFeedTuneState } from './useFeedTune';

interface OpenFeedTuneOptions {
  tab?: FeedTuneTab;
  /** From a page other than For You, which Tune sits beside. */
  goToFeed?: boolean;
}

/** Opens Tune beside For You, in Debug mode, and logs where from. */
export const useOpenFeedTune = (
  origin: Origin,
): ((options?: OpenFeedTuneOptions) => void) => {
  const router = useRouter();
  const { logEvent } = useLogContext();
  const { setTab } = useFeedTuneState();
  const [, setIsExplaining] = useQueryState({
    key: [QueryStateKeys.FeedExplain],
    defaultValue: false,
  });
  const { isCustomDefaultFeed } = useCustomDefaultFeed();

  return useCallback(
    ({ tab = FeedTuneTab.Topics, goToFeed }: OpenFeedTuneOptions = {}) => {
      logEvent({
        event_name: LogEvent.OpenFeedTune,
        extra: JSON.stringify({ origin }),
      });
      setIsExplaining(true);
      setTab(tab);
      if (goToFeed) {
        router.push(isCustomDefaultFeed ? '/my-feed' : '/');
      }
    },
    [logEvent, origin, setIsExplaining, setTab, router, isCustomDefaultFeed],
  );
};
