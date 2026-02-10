import { useCallback, useState } from 'react';
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

export const useDiscoverHotTakes = (): UseDiscoverHotTakes => {
  const { user } = useAuthContext();
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const { data, isLoading } = useQuery({
    queryKey: generateQueryKey(RequestKey.DiscoverHotTakes, user),
    queryFn: () => getDiscoverHotTakes(),
    staleTime: StaleTime.Default,
    enabled: !!user,
  });

  const hotTakes = (data ?? []).filter((take) => !dismissedIds.has(take.id));
  const currentTake = hotTakes[0] ?? null;
  const nextTake = hotTakes[1] ?? null;

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
    isEmpty: !isLoading && hotTakes.length === 0,
    dismissCurrent,
  };
};
