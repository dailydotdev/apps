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
import { useConditionalFeature } from '../useConditionalFeature';
import { useLogContext } from '../../contexts/LogContext';
import { searchResultsLogEvent } from '../../lib/searchLog';
import { useSearchId } from './useSearchId';

export type UseSearchProviderSuggestionsProps = {
  limit?: number;
  enabled?: boolean;
  /**
   * Correlation id shared with the surface that renders these suggestions, so
   * its impressions and clicks join back to this fetch. Minted internally when
   * the caller has no surface-level id of its own.
   */
  searchId?: string;
  /** Surface-level scope (e.g. the Spotlight scope) reported with results. */
  scope?: string;
} & UseSearchProviderProps;

export type UseSearchProviderSuggestions = {
  isLoading: boolean;
  suggestions:
    | Awaited<ReturnType<UseSearchProvider['getSuggestions']>>
    | undefined;
} & {
  queryKey: unknown[];
  /** Identity of the fetch behind `suggestions`, for joining engagement to it. */
  searchId: string;
  searchVersion: number;
};

export const useSearchProviderSuggestions = ({
  provider,
  query,
  limit = defaultSearchSuggestionsLimit,
  includeContentPreference,
  feedId,
  enabled = true,
  searchId,
  scope,
}: UseSearchProviderSuggestionsProps): UseSearchProviderSuggestions => {
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const { getSuggestions } = useSearchProvider();
  const debouncedQuery = useDebounce(query, defaultSearchDebounceMs);
  const isQueryable = enabled && debouncedQuery?.length >= minSearchQueryLength;
  // Spotlight mounts this hook on every page, so the flag must only be
  // evaluated once a real suggestion request is about to run. Evaluating it
  // unconditionally enrolls every pageview in the search experiment.
  const { value: version } = useConditionalFeature({
    feature: feature.searchVersion,
    shouldEvaluate: isQueryable,
  });
  const ownSearchId = useSearchId(`${provider}:${version}:${debouncedQuery}`);
  const activeSearchId = searchId ?? ownSearchId;
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
      const requestStartedAt = performance.now();
      const result = await getSuggestions({
        provider,
        query: debouncedQuery,
        limit,
        includeContentPreference,
        feedId,
      });

      logEvent(
        searchResultsLogEvent({
          searchId: activeSearchId,
          query: debouncedQuery,
          provider,
          searchVersion: version,
          resultCount: result?.hits?.length ?? 0,
          latencyMs: Math.round(performance.now() - requestStartedAt),
          scope,
        }),
      );

      return result;
    },
    enabled: isQueryable,
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
    searchId: activeSearchId,
    searchVersion: version,
  };
};
