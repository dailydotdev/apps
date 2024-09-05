import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { Author } from '../graphql/comments';
import {
  MostReadTag,
  USER_TOOLTIP_CONTENT_QUERY,
  UserReadingRank,
} from '../graphql/users';
import { StaleTime } from '../lib/query';
import { useRequestProtocol } from './useRequestProtocol';

export type UserTooltipContentData = {
  rank: UserReadingRank;
  tags: MostReadTag[];
  user?: Author;
};

interface UseProfileTooltip {
  fetchInfo: () => unknown;
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
  const { data, isLoading } = useQuery<UserTooltipContentData>(
    key,
    () =>
      requestMethod(
        USER_TOOLTIP_CONTENT_QUERY,
        {
          id: userId,
          version: 2,
          requestUserInfo,
        },
        { requestKey: JSON.stringify(key) },
      ),
    {
      staleTime: StaleTime.Tooltip,
      refetchOnWindowFocus: false,
      enabled: shouldFetch && !!userId,
      onSettled: () => setShouldFetch(false),
    },
  );

  return useMemo(
    () => ({
      data,
      isLoading,
      fetchInfo: () => setShouldFetch(true),
    }),
    [data, isLoading, setShouldFetch],
  );
};
