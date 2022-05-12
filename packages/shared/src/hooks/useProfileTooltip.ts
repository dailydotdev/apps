import request from 'graphql-request';
import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { Author } from '../graphql/comments';
import { CompanionProtocol, COMPANION_PROTOCOL_KEY } from '../graphql/common';
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
  const client = useQueryClient();
  const { companionRequest } =
    client.getQueryData<CompanionProtocol>(COMPANION_PROTOCOL_KEY) || {};
  const requestMethod = companionRequest || request;
  const [shouldFetch, setShouldFetch] = useState(false);
  const key = ['readingRank', userId];
  const { data, isLoading } = useQuery<UserTooltipContentData>(
    key,
    () =>
      requestMethod(`${apiUrl}/graphql`, USER_TOOLTIP_CONTENT_QUERY, {
        id: userId,
        version: 2,
        requestUserInfo,
        queryKey: key,
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
