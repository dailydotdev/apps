import { useQuery } from '@tanstack/react-query';
import type { AutocompleteTool } from '../../../graphql/user/userStack';
import { searchTools } from '../../../graphql/user/userStack';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';
import useDebounce from '../../../hooks/useDebounce';
import { defaultSearchDebounceMs } from '../../../lib/func';

export function useStackSearch(query: string) {
  const trimmedQuery = query.trim();
  const debouncedQuery = useDebounce(trimmedQuery, defaultSearchDebounceMs);
  const enabled = debouncedQuery.length >= 1;

  const queryKey = generateQueryKey(
    RequestKey.StackSearch,
    undefined,
    debouncedQuery,
  );

  const searchQuery = useQuery<AutocompleteTool[]>({
    queryKey,
    queryFn: () => searchTools(debouncedQuery),
    staleTime: StaleTime.Default,
    enabled,
  });

  return {
    ...searchQuery,
    results: searchQuery.data ?? [],
    isSearching: searchQuery.isFetching,
  };
}
