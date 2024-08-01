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
} from '../../graphql/search';

export type UseSearchProviderSuggestionsProps = {
  limit?: number;
  minQueryLength?: number;
} & UseSearchProviderProps;

export type UseSearchProviderSuggestions = {
  isLoading: boolean;
  suggestions: Awaited<ReturnType<UseSearchProvider['getSuggestions']>>;
};

export const useSearchProviderSuggestions = ({
  provider,
  query,
  limit = defaultSearchSuggestionsLimit,
  minQueryLength = minSearchQueryLength,
}: UseSearchProviderSuggestionsProps): UseSearchProviderSuggestions => {
  const { user } = useAuthContext();
  const { getSuggestions } = useSearchProvider();

  const { data, isLoading } = useQuery(
    generateQueryKey(RequestKey.Search, user, 'suggestions', {
      provider,
      query,
      limit,
    }),
    async () => {
      return getSuggestions({ provider, query, limit });
    },
    {
      enabled: query?.length >= minQueryLength,
      staleTime: StaleTime.Default,
      select: useCallback(
        (currentData) => {
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
    },
  );

  return {
    isLoading,
    suggestions: data,
  };
};
