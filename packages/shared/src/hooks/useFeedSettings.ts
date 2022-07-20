import { useContext, useMemo, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { request } from 'graphql-request';
import {
  AdvancedSettings,
  AllTagCategoriesData,
  FeedSettings,
  FEED_SETTINGS_QUERY,
  TagCategory,
  getEmptyFeedSettings,
} from '../graphql/feedSettings';
import { storageWrapper as storage } from '../lib/storageWrapper';
import AuthContext from '../contexts/AuthContext';
import { apiUrl } from '../lib/config';
import { generateQueryKey } from '../lib/query';
import { LoggedUser } from '../lib/user';
import FeaturesContext from '../contexts/FeaturesContext';
import usePersistentContext from './usePersistentContext';
import useDebounce from './useDebounce';

export const getFeedSettingsQueryKey = (user?: LoggedUser): string[] => [
  user?.id,
  'feedSettings',
];

export type FeedSettingsReturnType = {
  tagsCategories: TagCategory[];
  feedSettings: FeedSettings;
  isLoading: boolean;
  hasAnyFilter?: boolean;
  advancedSettings: AdvancedSettings[];
  setAvoidRefresh: (value: boolean) => void;
};

export const getHasAnyFilter = (feedSettings: FeedSettings): boolean =>
  feedSettings?.includeTags?.length > 0 ||
  feedSettings?.blockedTags?.length > 0 ||
  feedSettings?.excludeSources?.length > 0 ||
  feedSettings?.advancedSettings?.length > 0;

export const LOCAL_FEED_SETTINGS_KEY = 'feedSettings:local';

export const updateLocalFeedSettings = (feedSettings: FeedSettings): void => {
  storage.setItem(LOCAL_FEED_SETTINGS_KEY, JSON.stringify(feedSettings));
};

export const getLocalFeedSettings = (
  nullIfUndefined?: boolean,
): FeedSettings => {
  const value = storage.getItem(LOCAL_FEED_SETTINGS_KEY);
  if (!value) {
    return nullIfUndefined ? null : getEmptyFeedSettings();
  }

  try {
    return JSON.parse(value) as FeedSettings;
  } catch (ex) {
    return getEmptyFeedSettings();
  }
};

const isObjectEmpty = (obj: unknown) => {
  if (typeof obj === 'undefined' || obj === null) {
    return true;
  }

  return Object.keys(obj).length === 0;
};

const AVOID_REFRESH_KEY = 'avoidRefresh';

export default function useFeedSettings(): FeedSettingsReturnType {
  const { user } = useContext(AuthContext);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const filtersKey = getFeedSettingsQueryKey(user);
  const queryClient = useQueryClient();
  const { shouldShowMyFeed } = useContext(FeaturesContext);
  const [avoidRefresh, setAvoidRefresh] = usePersistentContext(
    AVOID_REFRESH_KEY,
    false,
    [true, false],
    false,
  );
  const [invaliateQueries] = useDebounce(() => {
    queryClient.invalidateQueries(generateQueryKey('popular', user));
    queryClient.invalidateQueries(generateQueryKey('my-feed', user));
  }, 100);

  const { data: feedQuery = {}, isLoading } = useQuery<AllTagCategoriesData>(
    filtersKey,
    async () => {
      const req = await request<AllTagCategoriesData>(
        `${apiUrl}/graphql`,
        FEED_SETTINGS_QUERY,
        { loggedIn: !!user?.id },
      );

      if (user || !shouldShowMyFeed) {
        return req;
      }

      const feedSettings = isObjectEmpty(feedQuery.feedSettings)
        ? getEmptyFeedSettings()
        : feedQuery.feedSettings;

      return { ...req, feedSettings };
    },
  );

  const { tagsCategories, feedSettings, advancedSettings } = feedQuery;

  useEffect(() => {
    if (!user?.id || avoidRefresh) {
      return;
    }

    if (isFirstLoad) {
      setIsFirstLoad(false);
      return;
    }

    invaliateQueries();
  }, [tagsCategories, feedSettings, avoidRefresh]);

  return useMemo(() => {
    return {
      tagsCategories,
      feedSettings,
      isLoading,
      advancedSettings,
      hasAnyFilter: getHasAnyFilter(feedSettings),
      setAvoidRefresh,
    };
  }, [
    tagsCategories,
    feedSettings,
    isLoading,
    advancedSettings,
    setAvoidRefresh,
  ]);
}
