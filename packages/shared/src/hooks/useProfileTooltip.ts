import request from 'graphql-request';
import { useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { Author } from '../graphql/comments';
import {
  USER_TOOLTIP_CONTENT_QUERY,
  UserReadingRank,
  MostReadTag,
} from '../graphql/users';
import { apiUrl } from '../lib/config';

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
  const [shouldFetch, setShouldFetch] = useState(false);
  const key = ['readingRank', userId];
  const { data, isLoading } = useQuery<UserTooltipContentData>(
    key,
    () =>
      request(`${apiUrl}/graphql`, USER_TOOLTIP_CONTENT_QUERY, {
        id: userId,
        version: 2,
        requestUserInfo,
      }),
    {
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
