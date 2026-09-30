import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  SlackDigest,
  UpsertSlackDigestInput,
} from '../../../graphql/integrations';
import {
  DELETE_SLACK_DIGEST_MUTATION,
  slackDigestsQueryOptions,
  UPSERT_SLACK_DIGEST_MUTATION,
} from '../../../graphql/integrations';
import { gqlClient } from '../../../graphql/common';
import { useAuthContext } from '../../../contexts/AuthContext';

export type UseSlackDigests = {
  digests?: SlackDigest[];
  isSuccess: boolean;
  upsertDigest: (input: UpsertSlackDigestInput) => Promise<SlackDigest>;
  deleteDigest: (id: string) => Promise<void>;
  isSaving: boolean;
};

export const useSlackDigests = ({
  integrationId,
  enabled = true,
}: {
  integrationId?: string;
  enabled?: boolean;
}): UseSlackDigests => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const queryOptions = slackDigestsQueryOptions({ integrationId, user });
  const { data: digests, isSuccess } = useQuery({
    ...queryOptions,
    enabled: queryOptions.enabled && enabled,
  });

  const { mutateAsync: upsertDigest, isPending: isUpserting } = useMutation({
    mutationFn: async (input: UpsertSlackDigestInput) => {
      const { upsertSlackDigest } = await gqlClient.request<{
        upsertSlackDigest: SlackDigest;
      }>(UPSERT_SLACK_DIGEST_MUTATION, { input });

      return upsertSlackDigest;
    },
    onSuccess: (digest) => {
      queryClient.setQueryData<SlackDigest[]>(
        queryOptions.queryKey,
        (current) =>
          current?.some(({ id }) => id === digest.id)
            ? current.map((item) => (item.id === digest.id ? digest : item))
            : [...(current ?? []), digest],
      );
    },
  });

  const { mutateAsync: deleteDigest, isPending: isDeleting } = useMutation({
    mutationFn: async (id: string) => {
      await gqlClient.request(DELETE_SLACK_DIGEST_MUTATION, { id });
    },
    onSuccess: (_, id) => {
      queryClient.setQueryData<SlackDigest[]>(
        queryOptions.queryKey,
        (current) => current?.filter((item) => item.id !== id),
      );
    },
  });

  return {
    digests,
    isSuccess,
    upsertDigest,
    deleteDigest,
    isSaving: isUpserting || isDeleting,
  };
};
