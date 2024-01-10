import { useCallback, useContext } from 'react';
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

export interface FeedSettingsReturnType {
  tagsCategories: TagCategory[];
  feedSettings: FeedSettings;
  isLoading: boolean;
  hasAnyFilter?: boolean;
  advancedSettings: AdvancedSettings[];
  checkSettingsEnabledState(value: number): boolean;
}

export const getHasAnyFilter = (feedSettings: FeedSettings): boolean =>
  feedSettings?.includeTags?.length > 0 ||
  feedSettings?.blockedTags?.length > 0 ||
  feedSettings?.excludeSources?.length > 0 ||
  feedSettings?.advancedSettings?.length > 0;

export interface UseFeedSettingsProps {
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
  const checkSettingsEnabledState = useCallback(
    (idParam: number) => {
      const advanced = advancedSettings?.find(({ id }) => id === idParam);

      if (!advanced) {
        return false;
      }

      const setting = feedSettings?.advancedSettings?.find(
        ({ id }) => id === idParam,
      );

      return setting?.enabled ?? advanced.defaultEnabledState;
    },
    [advancedSettings, feedSettings],
  );

  return {
    tagsCategories,
    feedSettings,
    isLoading,
    advancedSettings,
    hasAnyFilter: getHasAnyFilter(feedSettings),
    checkSettingsEnabledState,
  };
}
