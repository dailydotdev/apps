import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import type {
  UseSearchProvider,
  UseSearchProviderProps,
} from './useSearchProvider';
import { useSearchProvider } from './useSearchProvider';
import type { SearchSuggestionResult } from '../../graphql/search';
import {
  defaultSearchSuggestionsLimit,
  minSearchQueryLength,
} from '../../graphql/search';
import useDebounce from '../useDebounce';
import { defaultSearchDebounceMs } from '../../lib/func';
import { useMutationSubscription } from '../mutationSubscription';
import type { ContentPreferenceMutation } from '../contentPreference/types';
import {
  contentPreferenceMutationMatcher,
  mutationKeyToContentPreferenceStatusMap,
} from '../contentPreference/types';
import { feature } from '../../lib/featureManagement';
import { useFeaturesReadyContext } from '../../components/GrowthBookProvider';

export type UseSearchProviderSuggestionsProps = {
  limit?: number;
  enabled?: boolean;
} & UseSearchProviderProps;

export type UseSearchProviderSuggestions = {
  isLoading: boolean;
  suggestions:
    | Awaited<ReturnType<UseSearchProvider['getSuggestions']>>
    | undefined;
} & {
  queryKey: unknown[];
};

export const useSearchProviderSuggestions = ({
  provider,
  query,
  limit = defaultSearchSuggestionsLimit,
  includeContentPreference,
  feedId,
  enabled = true,
}: UseSearchProviderSuggestionsProps): UseSearchProviderSuggestions => {
  const { user } = useAuthContext();
  const { getSuggestions } = useSearchProvider();
  const { getFeatureValue } = useFeaturesReadyContext();
  const version = getFeatureValue(feature.searchVersion);
  const debouncedQuery = useDebounce(query, defaultSearchDebounceMs);
  const queryKey = generateQueryKey(RequestKey.Search, user, 'suggestions', {
    provider,
    debouncedQuery,
    limit,
    includeContentPreference,
    feedId,
    version,
  });

  const { data, isLoading: isQueryLoading } = useQuery({
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
    enabled: enabled && debouncedQuery?.length >= minSearchQueryLength,
    placeholderData: keepPreviousData,
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
        mutationVariables as Parameters<ContentPreferenceMutation>[0];

      const nextStatus = mutationKeyToContentPreferenceStatusMap[requestKey];
      mutationQueryClient.setQueryData(
        queryKey,
        (subData: SearchSuggestionResult | undefined) => {
          if (!subData) {
            return subData;
          }

          return {
            ...subData,
            hits: subData.hits?.map((hit) => {
              if (hit.id === entityId) {
                return {
                  ...hit,
                  contentPreference: nextStatus
                    ? ({
                        ...hit.contentPreference,
                        status: nextStatus,
                      } as typeof hit.contentPreference)
                    : undefined,
                };
              }

              return hit;
            }),
          } as SearchSuggestionResult;
        },
      );
    },
  });

  // The debounce window is part of the wait from the user's point of view, so
  // report it as loading to avoid an empty-state flash before the fetch starts.
  const isDebouncePending =
    enabled &&
    query !== debouncedQuery &&
    query?.length >= minSearchQueryLength;

  return {
    isLoading: isQueryLoading || isDebouncePending,
    suggestions: data,
    queryKey,
  };
};
