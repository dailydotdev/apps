import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../contexts/AuthContext';
import {
  FEED_TAGS_LIST_QUERY,
  type FeedTagsListData,
} from '../graphql/feedTagsList';
import { RequestKey, StaleTime, generateQueryKey } from '../lib/query';
import { useRequestProtocol } from './useRequestProtocol';

const DEFAULT_LIMIT = 10;

export const useFeedTagsList = ({
  limit = DEFAULT_LIMIT,
  enabled = true,
}: { limit?: number; enabled?: boolean } = {}) => {
  const { isLoggedIn, user } = useAuthContext();
  const { requestMethod } = useRequestProtocol();

  const query = useQuery({
    queryKey: generateQueryKey(RequestKey.FeedTagsList, user, limit),
    queryFn: async () => {
      const result = await requestMethod<FeedTagsListData>(
        FEED_TAGS_LIST_QUERY,
        { limit },
      );
      return result.feedTagsList;
    },
    enabled: isLoggedIn && enabled,
    staleTime: StaleTime.OneHour,
    gcTime: StaleTime.OneDay,
    retry: false,
  });

  return {
    ...query,
    tags: query.data?.tags ?? [],
  };
};
