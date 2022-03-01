import request from 'graphql-request';
import { useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import {
  UserTooltipContentData,
  USER_TOOLTIP_CONTENT_QUERY,
} from '../graphql/users';
import { apiUrl } from '../lib/config';

interface UseProfileTooltip {
  fetchInfo: () => unknown;
  data?: UserTooltipContentData;
}

export const useProfileTooltip = (userId: string): UseProfileTooltip => {
  const [shouldFetch, setShouldFetch] = useState(false);
  const key = ['readingRank', userId];
  const { data } = useQuery<UserTooltipContentData>(
    key,
    () =>
      request(`${apiUrl}/graphql`, USER_TOOLTIP_CONTENT_QUERY, {
        id: userId,
        version: 2,
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
      fetchInfo: () => setShouldFetch(true),
    }),
    [data, setShouldFetch],
  );
};
