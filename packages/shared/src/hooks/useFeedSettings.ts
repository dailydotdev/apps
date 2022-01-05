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
import { Features, getFeatureValue } from '../lib/featureManagement';

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

let avoidRefresh = false;

export const LOCAL_FEED_SETTINGS_KEY = 'feedSettings:local';

export const updateLocalFeedSettings = (feedSettings: FeedSettings): void => {
  storage.setItem(LOCAL_FEED_SETTINGS_KEY, JSON.stringify(feedSettings));
};

export const getLocalFeedSettings = (): FeedSettings => {
  const value = storage.getItem(LOCAL_FEED_SETTINGS_KEY);
  if (!value) {
    return getEmptyFeedSettings();
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

export default function useFeedSettings(): FeedSettingsReturnType {
  const { user, loadedUserFromCache } = useContext(AuthContext);
  const client = useQueryClient();
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const filtersKey = getFeedSettingsQueryKey(user);
  const queryClient = useQueryClient();
  const { flags } = useContext(FeaturesContext);
  const myFeed = getFeatureValue(Features.MyFeedOn, flags, 'false');
  const shouldShowMyFeed = myFeed === 'true';
  const setAvoidRefresh = (value: boolean) => {
    avoidRefresh = value;
  };

  const { data: feedQuery = {}, isLoading } = useQuery<AllTagCategoriesData>(
    filtersKey,
    async () => {
      const req = await request(`${apiUrl}/graphql`, FEED_SETTINGS_QUERY, {
        loggedIn: !!user?.id,
      });

      return { ...feedQuery, ...req };
    },
  );

  const { tagsCategories, feedSettings, advancedSettings } = feedQuery;

  useEffect(() => {
    if (!user?.id) {
      return;
    }

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

  useEffect(() => {
    const isEmpty = isObjectEmpty(feedSettings);
    const isFeedQueryEmpty = Object.keys(feedQuery).length === 0;
    if (!isEmpty || !loadedUserFromCache || isFeedQueryEmpty) {
      return;
    }

    if (user || !shouldShowMyFeed) {
      storage.removeItem(LOCAL_FEED_SETTINGS_KEY);
      return;
    }

    const localFeedSettings = getLocalFeedSettings();
    const queryData =
      client.getQueryData<AllTagCategoriesData>(filtersKey) || {};
    const updatedFeedSettings = {
      ...queryData,
      feedSettings: { ...localFeedSettings },
    };
    client.setQueryData<AllTagCategoriesData>(filtersKey, updatedFeedSettings);
    updateLocalFeedSettings(updatedFeedSettings.feedSettings);
  }, [feedQuery, loadedUserFromCache, user]);

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
