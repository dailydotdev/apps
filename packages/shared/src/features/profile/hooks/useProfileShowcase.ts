import type { NoInfer, QueryKey, UseQueryResult } from '@tanstack/react-query';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import type { PublicProfile } from '../../../lib/user';
import type { ProfileShowcase } from '../../../graphql/user/profileShowcase';
import { getProfileShowcase } from '../../../graphql/user/profileShowcase';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';

type ShowcaseUser = Pick<PublicProfile, 'id'> | null | undefined;

// `NoInfer` mirrors what `useQuery` wraps its result in; it resolves away at
// every concrete call site but keeps the generic body assignable.
export type UseProfileShowcase<Slice extends keyof ProfileShowcase> =
  UseQueryResult<NoInfer<ProfileShowcase[Slice]>> & {
    queryKey: QueryKey;
    invalidate: () => void;
    updateSlice: (
      updater: (slice: ProfileShowcase[Slice]) => ProfileShowcase[Slice],
    ) => Promise<void>;
  };

/**
 * One request behind the stack, hot takes, workspace photos and gear hooks.
 *
 * Each caller names its own slice, so a hook still hands back the connection it
 * always did — but four of them mounting together now share a single query key,
 * and React Query collapses that into one round trip.
 *
 * Because the four slices live in one cache entry, writes go through
 * `updateSlice`: the caller only touches its own connection and this hook keeps
 * the sibling slices intact.
 */
export function useProfileShowcase<Slice extends keyof ProfileShowcase>(
  user: ShowcaseUser,
  slice: Slice,
): UseProfileShowcase<Slice> {
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

  const select = useCallback((data: ProfileShowcase) => data[slice], [slice]);

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

  const updateSlice = useCallback(
    async (
      updater: (data: ProfileShowcase[Slice]) => ProfileShowcase[Slice],
    ) => {
      // Discard any in-flight read so a response issued before the mutation
      // cannot land after it and overwrite the reconciled cache.
      await queryClient.cancelQueries({ queryKey });

      // Cancelling reverts the query to its pre-fetch state, so when the
      // mutation beat the *first* showcase response there is now nothing to
      // reconcile into — writing would no-op and leave all four sections
      // blank. Schedule a fresh fetch instead and let the server response
      // carry the mutation result.
      if (!queryClient.getQueryData<ProfileShowcase>(queryKey)) {
        await queryClient.invalidateQueries({ queryKey });
        return;
      }

      queryClient.setQueryData<ProfileShowcase>(queryKey, (data) =>
        data ? { ...data, [slice]: updater(data[slice]) } : data,
      );
    },
    [queryClient, queryKey, slice],
  );

  return { ...query, queryKey, invalidate, updateSlice };
}
