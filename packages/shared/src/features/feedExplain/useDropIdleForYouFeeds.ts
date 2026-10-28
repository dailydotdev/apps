import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../../contexts/AuthContext';
import { generateQueryKey } from '../../lib/query';
import { SharedFeedPage } from '../../components/utilities/common';

/**
 * Debug keeps its own feed on screen, so a follow, block or hide made there
 * drops the regular For You feed waiting in the cache: it never refetches on
 * mount, and would come back without the change once Debug is off.
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
