import { useContext, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import LogContext from '../contexts/LogContext';
import { AllTagCategoriesData, FeedSettings } from '../graphql/feedSettings';
import { getFeedSettingsQueryKey, getHasAnyFilter } from './useFeedSettings';
import useMutateFilters from './useMutateFilters';
import { BOOT_QUERY_KEY } from '../contexts/common';
import { AuthEventNames } from '../lib/auth';
import { LogsEvent } from '../lib/logs';

interface RegisterLocalFilters {
  hasFilters: boolean;
}

interface UseMyFeed {
  registerLocalFilters: (
    settings?: FeedSettings,
  ) => Promise<RegisterLocalFilters>;
}

export function useMyFeed(): UseMyFeed {
  const client = useQueryClient();
  const { updateFeedFilters } = useMutateFilters();
  const { trackEvent } = useContext(LogContext);

  // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const registerLocalFilters = async (settings?: FeedSettings) => {
    const key = getFeedSettingsQueryKey();
    const feedSettings =
      settings || client.getQueryData<AllTagCategoriesData>(key)?.feedSettings;

    if (!feedSettings || !getHasAnyFilter(feedSettings)) {
      return { hasFilters: false };
    }

    trackEvent({
      event_name: LogsEvent.CreateFeed,
    });

    try {
      await updateFeedFilters(feedSettings);
      await client.invalidateQueries(BOOT_QUERY_KEY);
    } catch (err) {
      trackEvent({
        event_name: AuthEventNames.RegistrationError,
        extra: JSON.stringify({
          error: JSON.stringify(err),
          origin: 'create my feed mutation error',
        }),
      });
    }

    return { hasFilters: true };
  };

  return useMemo(() => ({ registerLocalFilters }), [registerLocalFilters]);
}
