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
import { useMutationSubscription } from '../mutationSubscription';
import {
  ContentPreferenceMutation,
  contentPreferenceMutationMatcher,
  mutationKeyToContentPreferenceStatusMap,
} from '../contentPreference/types';
import { PropsParameters } from '../../types';

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
  feedId,
}: UseSearchProviderSuggestionsProps): UseSearchProviderSuggestions => {
  const { user } = useAuthContext();
  const { getSuggestions } = useSearchProvider();
  const debouncedQuery = useDebounce(query, defaultSearchDebounceMs);
  const queryKey = generateQueryKey(RequestKey.Search, user, 'suggestions', {
    provider,
    debouncedQuery,
    limit,
    includeContentPreference,
    feedId,
  });

  const { data, isPending } = useQuery({
    queryKey,
    queryFn: async () => {
      return getSuggestions({
        provider,
        query: debouncedQuery,
        limit,
        includeContentPreference,
        feedId,
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

  useMutationSubscription({
    matcher: contentPreferenceMutationMatcher,
    callback: ({
      mutation,
      queryClient: mutationQueryClient,
      variables: mutationVariables,
    }) => {
      const [requestKey] = mutation.options.mutationKey as [
        RequestKey,
        ...unknown[],
      ];

      const { id: entityId } =
        mutationVariables as PropsParameters<ContentPreferenceMutation>;

      const nextStatus = mutationKeyToContentPreferenceStatusMap[requestKey];
      mutationQueryClient.setQueryData<SearchSuggestionResult>(
        queryKey,
        (subData) => {
          return {
            ...subData,
            hits: subData.hits?.map((hit) => {
              if (hit.id === entityId) {
                const newContentPreferenceEdge = structuredClone(hit);
                newContentPreferenceEdge.contentPreference = {
                  ...newContentPreferenceEdge.contentPreference,
                  status: nextStatus,
                };
                return newContentPreferenceEdge;
              }

              return hit;
            }),
          };
        },
      );
    },
  });

  return {
    isLoading: isPending,
    suggestions: data,
    queryKey,
  };
};
