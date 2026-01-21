import { useQuery } from '@tanstack/react-query';
import type { DatasetStack } from '../../../graphql/user/userStack';
import { searchStack } from '../../../graphql/user/userStack';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';

export function useStackSearch(query: string) {
  const trimmedQuery = query.trim();
  const enabled = trimmedQuery.length >= 1;

  const queryKey = generateQueryKey(RequestKey.StackSearch, null, trimmedQuery);

  const searchQuery = useQuery<DatasetStack[]>({
    queryKey,
    queryFn: () => searchStack(trimmedQuery),
    staleTime: StaleTime.Default,
    enabled,
  });

  return {
    ...searchQuery,
    results: searchQuery.data ?? [],
    isSearching: searchQuery.isFetching,
  };
}
