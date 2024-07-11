import { useMemo, useState } from 'react';
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
