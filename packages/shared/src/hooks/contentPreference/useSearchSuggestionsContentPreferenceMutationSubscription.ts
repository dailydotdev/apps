import type { SearchSuggestionResult } from '../../graphql/search';
import type { RequestKey } from '../../lib/query';
import { useMutationSubscription } from '../mutationSubscription';
import type { ContentPreferenceMutation } from './types';
import {
  contentPreferenceMutationMatcher,
  mutationKeyToContentPreferenceStatusMap,
} from './types';

type UseSearchSuggestionsContentPreferenceMutationSubscriptionProps = {
  queryKey: unknown[];
};

type UseSearchSuggestionsContentPreferenceMutationSubscription = ReturnType<
  typeof useMutationSubscription
>;

export const useUseSearchSuggestionsContentPreferenceMutationSubscription = ({
  queryKey,
}: UseSearchSuggestionsContentPreferenceMutationSubscriptionProps): UseSearchSuggestionsContentPreferenceMutationSubscription => {
  return useMutationSubscription({
    matcher: contentPreferenceMutationMatcher,
    callback: ({
      mutation,
      variables: mutationVariables,
      queryClient: mutationQueryClient,
    }) => {
      const currentData = mutationQueryClient.getQueryData(queryKey);
      const [requestKey] = mutation.options.mutationKey as [
        RequestKey,
        ...unknown[],
      ];

      if (!currentData) {
        return;
      }

      const nextStatus = mutationKeyToContentPreferenceStatusMap[requestKey];

      const { id: entityId } =
        mutationVariables as Parameters<ContentPreferenceMutation>[0];

      mutationQueryClient.setQueryData<SearchSuggestionResult | undefined>(
        queryKey,
        (data) => {
          if (!data) {
            return data;
          }

          const newData = {
            ...data,
            hits: data.hits?.map((hit) => {
              if (hit.id === entityId) {
                if (!nextStatus) {
                  return {
                    ...hit,
                    contentPreference: undefined,
                  };
                }

                if (!hit.contentPreference) {
                  return hit;
                }

                return {
                  ...hit,
                  contentPreference: {
                    ...hit.contentPreference,
                    status: nextStatus,
                  },
                };
              }

              return hit;
            }),
          };

          return newData;
        },
      );
    },
  });
};
