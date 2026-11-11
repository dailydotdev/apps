import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../../contexts/AuthContext';
import { generateQueryKey } from '../../lib/query';
import { SharedFeedPage } from '../../components/utilities/common';

/**
 * A follow, block, hide or level set from an explanation drops the For You
 * feeds waiting in the cache, such as another sort's: they never refetch on
 * mount, and would come back without the change. The feed on screen keeps
 * what it showed until the next refresh.
 */
export const useDropIdleForYouFeeds = (): (() => void) => {
  const { user } = useAuthContext();
  const client = useQueryClient();

  return useCallback(
    () =>
      client.removeQueries({
        queryKey: generateQueryKey(SharedFeedPage.MyFeed, user),
        type: 'inactive',
      }),
    [client, user],
  );
};
