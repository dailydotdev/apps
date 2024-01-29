import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import {
  UseSearchProvider,
  UseSearchProviderProps,
  useSearchProvider,
} from './useSearchProvider';
import { minSearchQueryLength } from '../../graphql/search';

export type UseSearchProviderSuggestionsProps = {
  limit?: number;
} & UseSearchProviderProps;

export type UseSearchProviderSuggestions = {
  isLoading: boolean;
  suggestions: Awaited<ReturnType<UseSearchProvider['getSuggestions']>>;
};

export const useSearchProviderSuggestions = ({
  provider,
  query,
  limit = 3,
}: UseSearchProviderSuggestionsProps): UseSearchProviderSuggestions => {
  const { user } = useAuthContext();
  const { getSuggestions } = useSearchProvider();

  const { data, isLoading } = useQuery(
    generateQueryKey(RequestKey.Search, user, 'suggestions', {
      provider,
      query,
    }),
    async () => {
      return getSuggestions({ provider, query });
    },
    {
      enabled: query?.length >= minSearchQueryLength,
      staleTime: StaleTime.Default,
      keepPreviousData: true,
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
