import type { QueryKey, UseQueryResult } from '@tanstack/react-query';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import type { PublicProfile } from '../../../lib/user';
import type { ProfileShowcase } from '../../../graphql/user/profileShowcase';
import { getProfileShowcase } from '../../../graphql/user/profileShowcase';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';

type ShowcaseUser = Pick<PublicProfile, 'id'> | null | undefined;

export type UseProfileShowcase<TSlice> = UseQueryResult<TSlice> & {
  queryKey: QueryKey;
  invalidate: () => void;
};

/**
 * One request behind the stack, hot takes, workspace photos and gear hooks.
 *
 * Each caller passes the selector for its own slice, so a hook still hands back
 * the connection it always did — but four of them mounting together now share a
 * single query key, and React Query collapses that into one round trip.
 *
 * `select` has to be referentially stable or React Query re-runs it on every
 * render, so callers pass a module-level function rather than an inline arrow.
 */
export function useProfileShowcase<TSlice>(
  user: ShowcaseUser,
  select: (data: ProfileShowcase) => TSlice,
): UseProfileShowcase<TSlice> {
  const queryClient = useQueryClient();
  const userId = user?.id;
  const queryKey = useMemo(
    () =>
      generateQueryKey(
        RequestKey.ProfileShowcase,
        userId ? { id: userId } : undefined,
        'profile',
      ),
    [userId],
  );

  const query = useQuery({
    queryKey,
    queryFn: () => getProfileShowcase(userId as string),
    select,
    enabled: !!userId,
    staleTime: StaleTime.Default,
  });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  return { ...query, queryKey, invalidate };
}
