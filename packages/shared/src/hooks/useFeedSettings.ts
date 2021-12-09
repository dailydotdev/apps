import { useContext, useMemo, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
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
  hasAnyFilter?: boolean;
  advancedSettings: AdvancedSettings[];
  setAvoidRefresh: (value: boolean) => void;
};

let avoidRefresh = false;

export default function useFeedSettings(): FeedSettingsReturnType {
  const { user } = useContext(AuthContext);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const filtersKey = getFeedSettingsQueryKey(user);
  const queryClient = useQueryClient();
  const setAvoidRefresh = (value: boolean) => {
    avoidRefresh = value;
  };

  const {
    data: { tagsCategories, feedSettings, advancedSettings } = {},
    isLoading,
  } = useQuery<AllTagCategoriesData>(filtersKey, () =>
    request(`${apiUrl}/graphql`, FEED_SETTINGS_QUERY, {
      loggedIn: !!user?.id,
    }),
  );

  useEffect(() => {
    if (avoidRefresh) {
      return;
    }
    if (isFirstLoad) {
      setIsFirstLoad(false);
      return;
    }

    setTimeout(() => {
      queryClient.invalidateQueries(generateQueryKey('popular', user));
      queryClient.invalidateQueries(generateQueryKey('recent', user));
    }, 100);
  }, [tagsCategories, feedSettings, avoidRefresh]);

  const hasAnyFilter =
    feedSettings?.includeTags?.length > 0 ||
    feedSettings?.blockedTags?.length > 0 ||
    feedSettings?.excludeSources?.length > 0 ||
    feedSettings?.advancedSettings?.length > 0;

  return useMemo(() => {
    return {
      tagsCategories,
      feedSettings,
      isLoading,
      advancedSettings,
      hasAnyFilter,
      setAvoidRefresh,
    };
  }, [
    tagsCategories,
    feedSettings,
    isLoading,
    advancedSettings,
    hasAnyFilter,
    setAvoidRefresh,
  ]);
}
