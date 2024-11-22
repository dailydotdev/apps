import { useQuery } from '@tanstack/react-query';
import { gqlClient } from '../graphql/common';
import { SEARCH_SOURCES_QUERY, Source } from '../graphql/sources';
import { generateQueryKey, RequestKey } from '../lib/query';

export type UseSourceSearchProps = {
  value: string;
};

export type UseSourceSearch = {
  data?: Source[];
  isPending: boolean;
};

export const MIN_SEARCH_QUERY_LENGTH = 2;

export const useSourceSearch = ({
  value,
}: UseSourceSearchProps): UseSourceSearch => {
  const { data, isPending } = useQuery({
    queryKey: generateQueryKey(RequestKey.SearchSources, null, value),
    queryFn: async () => {
      const result = await gqlClient.request<{
        searchSources: Source[];
      }>(SEARCH_SOURCES_QUERY, {
        query: value,
      });

      return result.searchSources;
    },
    enabled: value?.length >= MIN_SEARCH_QUERY_LENGTH,
  });

  return {
    data,
    isPending,
  };
};
