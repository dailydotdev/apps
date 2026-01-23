import { useQuery } from '@tanstack/react-query';
import type { DatasetTool } from '../../../graphql/user/userTool';
import { searchTools } from '../../../graphql/user/userTool';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';

export function useToolSearch(query: string) {
  const trimmedQuery = query.trim();
  const enabled = trimmedQuery.length >= 1;

  const queryKey = generateQueryKey(RequestKey.ToolSearch, null, trimmedQuery);

  const searchQuery = useQuery<DatasetTool[]>({
    queryKey,
    queryFn: () => searchTools(trimmedQuery),
    staleTime: StaleTime.Default,
    enabled,
  });

  return {
    ...searchQuery,
    results: searchQuery.data ?? [],
    isSearching: searchQuery.isFetching,
  };
}
