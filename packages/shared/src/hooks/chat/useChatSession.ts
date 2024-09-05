import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useAuthContext } from '../../contexts/AuthContext';
import { getSearchSession, Search } from '../../graphql/search';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { UseChatSession, UseChatSessionProps } from './types';

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
  const { data, isLoading } = useQuery(
    queryKey,
    () => {
      if (streamId && streamId === id) {
        return client.getQueryData<Search>(queryKey);
      }

      return getSearchSession(id);
    },
    { enabled: !!id },
  );

  return {
    queryKey,
    isLoading,
    data,
  };
};
