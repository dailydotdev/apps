import { useQuery } from '@tanstack/react-query';
import { startOfTomorrow, subDays, subMonths } from 'date-fns';
import type { ProfileReadingData, UserReadHistory } from '../../graphql/users';
import { USER_READING_HISTORY_QUERY } from '../../graphql/users';
import { gqlClient } from '../../graphql/common';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';
import type { PublicProfile } from '../../lib/user';

export const sumReads = (readHistory?: UserReadHistory[]): number =>
  readHistory?.reduce((total, entry) => {
    const reads = entry?.reads || 0;

    return total + (typeof reads === 'number' && reads >= 0 ? reads : 0);
  }, 0) ?? 0;

interface UseProfileReadingHistoryResult {
  readingHistory?: ProfileReadingData;
  isLoading: boolean;
  before: Date;
  after: Date;
}

/**
 * The window is not part of the key, so the header and the widgets column
 * share one cache entry and one request between them.
 */
export function useProfileReadingHistory(
  user?: PublicProfile,
): UseProfileReadingHistoryResult {
  const { tokenRefreshed } = useAuthContext();
  const before = startOfTomorrow();
  const after = subMonths(subDays(before, 2), 5);

  const { data: readingHistory, isLoading } = useQuery<ProfileReadingData>({
    queryKey: generateQueryKey(RequestKey.ReadingStats, user),
    queryFn: () =>
      gqlClient.request(USER_READING_HISTORY_QUERY, {
        id: user?.id,
        before,
        after,
        version: 2,
        limit: 6,
      }),
    enabled: !!user && tokenRefreshed,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  return { readingHistory, isLoading, before, after };
}
