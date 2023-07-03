import { useContext, useMemo } from 'react';
import { useQuery } from 'react-query';
import { request } from 'graphql-request';
import {
  AdvancedSettings,
  AllTagCategoriesData,
  FeedSettings,
  FEED_SETTINGS_QUERY,
  TagCategory,
  getEmptyFeedSettings,
} from '../graphql/feedSettings';
import AuthContext from '../contexts/AuthContext';
import { graphqlUrl } from '../lib/config';
import { LoggedUser } from '../lib/user';

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
};

export const getHasAnyFilter = (feedSettings: FeedSettings): boolean =>
  feedSettings?.includeTags?.length > 0 ||
  feedSettings?.blockedTags?.length > 0 ||
  feedSettings?.excludeSources?.length > 0 ||
  feedSettings?.advancedSettings?.length > 0;

const isObjectEmpty = (obj: unknown) => {
  if (typeof obj === 'undefined' || obj === null) {
    return true;
  }

  return Object.keys(obj).length === 0;
};

export default function useFeedSettings(): FeedSettingsReturnType {
  const { user } = useContext(AuthContext);
  const filtersKey = getFeedSettingsQueryKey(user);

  const { data: feedQuery = {}, isLoading } = useQuery<AllTagCategoriesData>(
    filtersKey,
    async () => {
      const req = await request<AllTagCategoriesData>(
        graphqlUrl,
        FEED_SETTINGS_QUERY,
        { loggedIn: !!user?.id },
      );

      if (user) {
        return req;
      }

      const feedSettings = isObjectEmpty(feedQuery.feedSettings)
        ? getEmptyFeedSettings()
        : feedQuery.feedSettings;

      return { ...req, feedSettings };
    },
  );

  const { tagsCategories, feedSettings, advancedSettings } = feedQuery;

  return useMemo(() => {
    return {
      tagsCategories,
      feedSettings,
      isLoading,
      advancedSettings,
      hasAnyFilter: getHasAnyFilter(feedSettings),
    };
  }, [tagsCategories, feedSettings, isLoading, advancedSettings]);
}
