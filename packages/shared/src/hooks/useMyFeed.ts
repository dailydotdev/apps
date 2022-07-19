import { useContext, useMemo } from 'react';
import { useQueryClient } from 'react-query';
import AnalyticsContext from '../contexts/AnalyticsContext';
import AuthContext from '../contexts/AuthContext';
import { BOOT_QUERY_KEY } from '../contexts/BootProvider';
import FeaturesContext from '../contexts/FeaturesContext';
import { storageWrapper as storage } from '../lib/storageWrapper';
import {
  getLocalFeedSettings,
  LOCAL_FEED_SETTINGS_KEY,
} from './useFeedSettings';
import useMutateFilters from './useMutateFilters';

interface UseMyFeed {
  registerLocalFilters: () => Promise<{ hasFilters: boolean }>;
  shouldShowMyFeed: boolean;
  checkHasLocalFilters: () => boolean;
}

export function useMyFeed(): UseMyFeed {
  const client = useQueryClient();
  const { updateFeedFilters } = useMutateFilters();
  const { trackEvent } = useContext(AnalyticsContext);
  const { user } = useContext(AuthContext);
  const { shouldShowMyFeed } = useContext(FeaturesContext);

  const registerLocalFilters = async () => {
    const feedSettings = getLocalFeedSettings(true);

    if (!feedSettings) {
      return { hasFilters: false };
    }

    trackEvent({
      event_name: 'create feed',
    });
    await updateFeedFilters(feedSettings);
    storage.removeItem(LOCAL_FEED_SETTINGS_KEY);
    await client.invalidateQueries(BOOT_QUERY_KEY);

    return { hasFilters: true };
  };

  const checkHasLocalFilters = () => {
    if (!shouldShowMyFeed || user) {
      return false;
    }

    return !!getLocalFeedSettings(true);
  };

  return useMemo(
    () => ({
      registerLocalFilters,
      shouldShowMyFeed,
      checkHasLocalFilters,
    }),
    [registerLocalFilters, shouldShowMyFeed, checkHasLocalFilters],
  );
}
