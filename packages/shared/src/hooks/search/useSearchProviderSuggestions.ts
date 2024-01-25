import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../contexts/AuthContext';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import {
  UseSearchProvider,
  UseSearchProviderProps,
  useSearchProvider,
} from './useSearchProvider';
import { minSearchQueryLength } from '../../graphql/search';

export type UseSearchProviderSuggestionsProps = UseSearchProviderProps;

export type UseSearchProviderSuggestions = {
  isLoading: boolean;
  suggestions: Awaited<ReturnType<UseSearchProvider['getSuggestions']>>;
};

export const useSearchProviderSuggestions = ({
  provider,
  query,
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
    },
  );

  return {
    isLoading,
    suggestions: data,
  };
};
