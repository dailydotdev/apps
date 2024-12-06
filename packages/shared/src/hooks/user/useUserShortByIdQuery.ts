import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { UserCompany } from '../../lib/userCompany';
import { USER_SHORT_BY_ID } from '../../graphql/users';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { gqlClient } from '../../graphql/common';
import type { PublicProfile } from '../../lib/user';
import { useMutationSubscription } from '../mutationSubscription';
import {
  ContentPreferenceMutation,
  contentPreferenceMutationMatcher,
  mutationKeyToContentPreferenceStatusMap,
} from '../contentPreference/types';
import { PropsParameters } from '../../types';
import {
  ContentPreference,
  ContentPreferenceType,
} from '../../graphql/contentPreference';

export type UseSlackChannelsQuery = UseQueryResult<PublicProfile>;
export const useUserShortByIdQuery = ({
  id,
}: {
  id: string;
}): UseSlackChannelsQuery => {
  const queryKey = generateQueryKey(RequestKey.UserShortById, null, { id });

  const queryResult = useQuery({
    queryKey,
    queryFn: async (): Promise<UserCompany[]> => {
      const res = await gqlClient.request(USER_SHORT_BY_ID, { id });

      return res.user;
    },
    staleTime: StaleTime.Default,
    enabled: !!id,
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

      const { id: entityId, entity: entityType } =
        mutationVariables as PropsParameters<ContentPreferenceMutation>;

      if (entityId !== id || entityType !== ContentPreferenceType.User) {
        return;
      }

      const nextStatus = mutationKeyToContentPreferenceStatusMap[requestKey];

      if (!nextStatus) {
        mutationQueryClient.setQueryData<ContentPreference>(
          queryKey,
          (data) => {
            return {
              ...data,
              contentPreference: null,
            };
          },
        );

        return;
      }

      mutationQueryClient.setQueryData<ContentPreference>(queryKey, (data) => {
        return {
          ...data,
          contentPreference: {
            status: nextStatus,
            referenceId: entityId,
            type: entityType,
            createdAt: new Date(),
          },
        };
      });
    },
  });

  return queryResult;
};
