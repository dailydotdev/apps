import { useContext, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { request } from 'graphql-request';
import {
  AdvancedSettings,
  AllTagCategoriesData,
  FeedSettings,
  FEED_SETTINGS_QUERY,
  TagCategory,
} from '../graphql/feedSettings';
import AuthContext from '../contexts/AuthContext';
import { graphqlUrl } from '../lib/config';
import { LoggedUser } from '../lib/user';
import { disabledRefetch } from '../lib/func';
import { StaleTime } from '../lib/query';

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

interface UseFeedSettingsProps {
  enabled?: boolean;
}

export default function useFeedSettings({
  enabled = true,
}: UseFeedSettingsProps = {}): FeedSettingsReturnType {
  const { user } = useContext(AuthContext);
  const filtersKey = getFeedSettingsQueryKey(user);
  const { data: feedQuery = {}, isLoading } = useQuery<AllTagCategoriesData>(
    filtersKey,
    () => request(graphqlUrl, FEED_SETTINGS_QUERY),
    {
      ...disabledRefetch,
      enabled: enabled && !!user,
      staleTime: StaleTime.FeedSettings,
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
