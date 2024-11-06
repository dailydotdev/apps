import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Author } from '../graphql/comments';
import {
  USER_TOOLTIP_CONTENT_QUERY,
  UserReadingRank,
  MostReadTag,
} from '../graphql/users';
import { useRequestProtocol } from './useRequestProtocol';
import { StaleTime } from '../lib/query';

export type UserTooltipContentData = {
  rank: UserReadingRank;
  tags: MostReadTag[];
  user?: Author;
};

interface UseProfileTooltip {
  enableFetchInfo: () => unknown;
  data?: UserTooltipContentData;
  isLoading: boolean;
}

interface UseProfileTooltipProps {
  userId: string;
  requestUserInfo?: boolean;
}

export const useProfileTooltip = ({
  userId,
  requestUserInfo = false,
}: UseProfileTooltipProps): UseProfileTooltip => {
  const { requestMethod } = useRequestProtocol();
  const [shouldFetch, setShouldFetch] = useState(false);
  const key = ['readingRank', userId];
  const { data, isPending, error } = useQuery<UserTooltipContentData>({
    queryKey: key,
    queryFn: () =>
      requestMethod(
        USER_TOOLTIP_CONTENT_QUERY,
        {
          id: userId,
          version: 2,
          requestUserInfo,
        },
        { requestKey: JSON.stringify(key) },
      ),

    staleTime: StaleTime.Tooltip,
    refetchOnWindowFocus: false,
    enabled: shouldFetch && !!userId,
  });

  useEffect(() => {
    if (data || error) {
      setShouldFetch(false);
    }
  }, [data, error]);

  return {
    data,
    isLoading: isPending,
    enableFetchInfo: () => setShouldFetch(true),
  };
};
