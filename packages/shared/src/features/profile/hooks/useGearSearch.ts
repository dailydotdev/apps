import { useQuery } from '@tanstack/react-query';
import type { DatasetGear } from '../../../graphql/user/gear';
import { searchGear } from '../../../graphql/user/gear';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';

export function useGearSearch(query: string) {
  const trimmedQuery = query.trim();
  const enabled = trimmedQuery.length >= 1;

  const queryKey = generateQueryKey(RequestKey.GearSearch, null, trimmedQuery);

  const searchQuery = useQuery<DatasetGear[]>({
    queryKey,
    queryFn: () => searchGear(trimmedQuery),
    staleTime: StaleTime.Default,
    enabled,
  });

  return {
    ...searchQuery,
    results: searchQuery.data ?? [],
    isSearching: searchQuery.isFetching,
  };
}
