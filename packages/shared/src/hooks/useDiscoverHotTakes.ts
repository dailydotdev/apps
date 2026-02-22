import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { HotTake } from '../graphql/user/userHotTake';
import { getDiscoverHotTakes } from '../graphql/user/userHotTake';
import { generateQueryKey, RequestKey, StaleTime } from '../lib/query';
import { useAuthContext } from '../contexts/AuthContext';

interface UseDiscoverHotTakes {
  hotTakes: HotTake[];
  currentTake: HotTake | null;
  nextTake: HotTake | null;
  isLoading: boolean;
  isEmpty: boolean;
  dismissCurrent: () => void;
}

const REFETCH_THRESHOLD = 5;

export const useDiscoverHotTakes = (): UseDiscoverHotTakes => {
  const { user } = useAuthContext();
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [allHotTakes, setAllHotTakes] = useState<HotTake[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const seenIdsRef = useRef<Set<string>>(new Set());

  const { isLoading, isFetching, refetch } = useQuery({
    queryKey: generateQueryKey(RequestKey.DiscoverHotTakes, user),
    queryFn: async () => {
      const items = await getDiscoverHotTakes();

      const newItems = items.filter((t) => !seenIdsRef.current.has(t.id));
      items.forEach((item) => seenIdsRef.current.add(item.id));

      if (newItems.length === 0) {
        setHasMore(false);
      } else {
        setAllHotTakes((prev) => [...prev, ...newItems]);
      }

      return items;
    },
    staleTime: StaleTime.Default,
    enabled: !!user,
  });

  const hotTakes = allHotTakes.filter((take) => !dismissedIds.has(take.id));
  const currentTake = hotTakes[0] ?? null;
  const nextTake = hotTakes[1] ?? null;

  // Fetch more when running low on remaining items
  useEffect(() => {
    if (hotTakes.length < REFETCH_THRESHOLD && !isFetching && hasMore) {
      refetch().catch(() => undefined);
    }
  }, [hotTakes.length, isFetching, hasMore, refetch]);

  const dismissCurrent = useCallback(() => {
    if (currentTake) {
      setDismissedIds((prev) => new Set(prev).add(currentTake.id));
    }
  }, [currentTake]);

  return {
    hotTakes,
    currentTake,
    nextTake,
    isLoading,
    isEmpty: !isLoading && !isFetching && hotTakes.length === 0 && !hasMore,
    dismissCurrent,
  };
};
