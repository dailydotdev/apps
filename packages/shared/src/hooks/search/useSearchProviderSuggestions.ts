import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import {
  UseSearchProvider,
  UseSearchProviderProps,
  useSearchProvider,
} from './useSearchProvider';
import {
  defaultSearchSuggestionsLimit,
  minSearchQueryLength,
  SearchSuggestionResult,
} from '../../graphql/search';
import useDebounce from '../useDebounce';
import { defaultSearchDebounceMs } from '../../lib/func';

export type UseSearchProviderSuggestionsProps = {
  limit?: number;
} & UseSearchProviderProps;

export type UseSearchProviderSuggestions = {
  isLoading: boolean;
  suggestions: Awaited<ReturnType<UseSearchProvider['getSuggestions']>>;
} & {
  queryKey: unknown[];
};

export const useSearchProviderSuggestions = ({
  provider,
  query,
  limit = defaultSearchSuggestionsLimit,
  includeContentPreference,
}: UseSearchProviderSuggestionsProps): UseSearchProviderSuggestions => {
  const { user } = useAuthContext();
  const { getSuggestions } = useSearchProvider();
  const debouncedQuery = useDebounce(query, defaultSearchDebounceMs);
  const queryKey = generateQueryKey(RequestKey.Search, user, 'suggestions', {
    provider,
    debouncedQuery,
    limit,
    includeContentPreference,
  });

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      return getSuggestions({
        provider,
        query: debouncedQuery,
        limit,
        includeContentPreference,
      });
    },
    enabled: query?.length >= minSearchQueryLength,
    staleTime: StaleTime.Default,
    select: useCallback(
      (currentData: SearchSuggestionResult) => {
        if (!currentData) {
          return currentData;
        }

        return {
          ...currentData,
          hits: currentData?.hits?.slice(0, limit) || [],
        };
      },
      [limit],
    ),
  });

  return {
    isLoading,
    suggestions: data,
    queryKey,
  };
};
