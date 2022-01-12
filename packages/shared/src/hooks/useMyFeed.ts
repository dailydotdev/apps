import { useContext, useMemo } from 'react';
import { useQueryClient } from 'react-query';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { BOOT_QUERY_KEY } from '../contexts/BootProvider';
import FeaturesContext from '../contexts/FeaturesContext';
import { Features, isFeaturedEnabled } from '../lib/featureManagement';
import { storageWrapper as storage } from '../lib/storageWrapper';
import {
  getLocalFeedSettings,
  LOCAL_FEED_SETTINGS_KEY,
} from './useFeedSettings';
import useMutateFilters from './useMutateFilters';

interface UseMyFeed {
  registerLocalFilters: () => Promise<unknown>;
  shouldShowMyFeed: boolean;
}

export function useMyFeed(): UseMyFeed {
  const client = useQueryClient();
  const { updateFeedFilters } = useMutateFilters();
  const { trackEvent } = useContext(AnalyticsContext);
  const { flags } = useContext(FeaturesContext);
  const shouldShowMyFeed = isFeaturedEnabled(Features.MyFeedOn, flags);

  const registerLocalFilters = async () => {
    const feedSettings = getLocalFeedSettings(true);

    if (feedSettings) {
      trackEvent({
        event_name: 'create feed',
      });
      await updateFeedFilters(feedSettings);
      storage.removeItem(LOCAL_FEED_SETTINGS_KEY);
      await client.invalidateQueries(BOOT_QUERY_KEY);
    }
  };

  return useMemo(
    () => ({ registerLocalFilters, shouldShowMyFeed }),
    [registerLocalFilters, shouldShowMyFeed],
  );
}
