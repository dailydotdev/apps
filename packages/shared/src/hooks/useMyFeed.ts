import { useContext, useMemo } from 'react';
import { useQueryClient } from 'react-query';
import AnalyticsContext from '../contexts/AnalyticsContext';
import AuthContext from '../contexts/AuthContext';
import { BOOT_QUERY_KEY } from '../contexts/BootProvider';
import { FeedSettings } from '../graphql/feedSettings';
import { storageWrapper as storage } from '../lib/storageWrapper';
import {
  getLocalFeedSettings,
  LOCAL_FEED_SETTINGS_KEY,
} from './useFeedSettings';
import useMutateFilters from './useMutateFilters';

interface RegisterLocalFilters {
  hasFilters: boolean;
}

interface UseMyFeed {
  registerLocalFilters: (
    settings?: FeedSettings,
  ) => Promise<RegisterLocalFilters>;
  checkHasLocalFilters: () => boolean;
}

export function useMyFeed(): UseMyFeed {
  const client = useQueryClient();
  const { updateFeedFilters } = useMutateFilters();
  const { trackEvent } = useContext(AnalyticsContext);
  const { user } = useContext(AuthContext);

  const registerLocalFilters = async (settings?: FeedSettings) => {
    const feedSettings = settings || getLocalFeedSettings(true);

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
    if (user) {
      return false;
    }

    return !!getLocalFeedSettings(true);
  };

  return useMemo(
    () => ({
      registerLocalFilters,
      checkHasLocalFilters,
    }),
    [registerLocalFilters, checkHasLocalFilters],
  );
}
