import { useMemo } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../contexts/AuthContext';
import type { Search } from '../../graphql/search';
import { getSearchSession } from '../../graphql/search';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import type { UseChatSessionProps, UseChatSession } from './types';

export const useChatSession = ({
  id,
  streamId,
}: UseChatSessionProps): UseChatSession => {
  const { user } = useAuthContext();
  const client = useQueryClient();
  const queryKey = useMemo(
    () => generateQueryKey(RequestKey.Search, user, id),
    [user, id],
  );
  const { data, isPending } = useQuery({
    queryKey,

    queryFn: () => {
      if (streamId && streamId === id) {
        return client.getQueryData<Search>(queryKey);
      }

      return getSearchSession(id);
    },
    enabled: !!id,
    staleTime: StaleTime.OneHour,
  });

  return {
    queryKey,
    isLoading: isPending,
    data,
  };
};
