import { useContext, useMemo, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { requestIdleCallback } from 'next/dist/client/request-idle-callback';
import { request } from 'graphql-request';
import {
  AdvancedSettings,
  AllTagCategoriesData,
  FeedSettings,
  FEED_SETTINGS_QUERY,
  TagCategory,
} from '../graphql/feedSettings';
import AuthContext from '../contexts/AuthContext';
import { getFeedSettingsQueryKey } from './useMutateFilters';
import { apiUrl } from '../lib/config';
import { generateQueryKey } from '../lib/query';

export type FeedSettingsReturnType = {
  tagsCategories: TagCategory[];
  feedSettings: FeedSettings;
  isLoading: boolean;
  advancedSettings: AdvancedSettings[];
};

export default function useFeedSettings(): FeedSettingsReturnType {
  const { user } = useContext(AuthContext);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const filtersKey = getFeedSettingsQueryKey(user);
  const queryClient = useQueryClient();

  const {
    data: { tagsCategories, feedSettings, advancedSettings } = {},
    isLoading,
  } = useQuery<AllTagCategoriesData>(filtersKey, () =>
    request(`${apiUrl}/graphql`, FEED_SETTINGS_QUERY, {
      loggedIn: !!user?.id,
    }),
  );

  useEffect(() => {
    if (isFirstLoad) {
      setIsFirstLoad(false);
      return;
    }

    requestIdleCallback(
      () => {
        queryClient.invalidateQueries(generateQueryKey('popular', user));
        queryClient.invalidateQueries(generateQueryKey('recent', user));
      },
      { timeout: 100 },
    );
  }, [tagsCategories, feedSettings]);

  return useMemo(() => {
    return {
      tagsCategories,
      feedSettings,
      isLoading,
      advancedSettings,
    };
  }, [tagsCategories, feedSettings, isLoading, advancedSettings]);
}
