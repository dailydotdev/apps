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
import { Features, isFeaturedEnabled } from '../lib/featureManagement';

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
let hasClearedCache = false;

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
  const shouldShowMyFeed = isFeaturedEnabled(Features.MyFeedOn, flags);
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
    if (!user?.id || avoidRefresh) {
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
    const isFeedQueryEmpty = isObjectEmpty(feedQuery);
    const isFeedSettingsEmpty = isObjectEmpty(feedSettings);
    if (
      !isFeedSettingsEmpty ||
      !loadedUserFromCache ||
      isFeedQueryEmpty ||
      !shouldShowMyFeed
    ) {
      return;
    }

    /*
      This sets the initial value for the `feedSettings` property
      The query that fetches the information related to this property doesn't include this mentioned prop if not logged in - results to be `undefined`
      This also covers to initially load the filters left by the user if they have not finished the registration and came back
    */

    const localFeedSettings = getLocalFeedSettings();
    client.setQueryData<AllTagCategoriesData>(filtersKey, (current) => ({
      ...current,
      feedSettings: { ...localFeedSettings },
    }));
  }, [feedQuery, feedSettings, loadedUserFromCache, user]);

  useEffect(() => {
    if (!hasClearedCache && loadedUserFromCache && user) {
      hasClearedCache = true;
      storage.removeItem(LOCAL_FEED_SETTINGS_KEY);
    }
  }, [loadedUserFromCache, user]);

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
