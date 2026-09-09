import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { gqlClient } from '../../../graphql/common';
import {
  SLACK_POST_MESSAGE_MUTATION,
  integrationRecentChannelsQueryOptions,
  UserIntegrationType,
} from '../../../graphql/integrations';
import type { UserIntegration } from '../../../graphql/integrations';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useIntegrationsQuery } from '../useIntegrationsQuery';
import { useSlack } from './useSlack';

export type UseSlackShare = {
  /**
   * The workspace a share posts to. Absent while loading, when the user has no
   * Slack workspace, or when the connected one predates user-token scopes.
   */
  integration?: UserIntegration;
  isLoading: boolean;
  connect: (redirectPath: string) => void;
  share: (params: { channelId: string; postId: string }) => Promise<void>;
  isSharing: boolean;
};

export const useSlackShare = (): UseSlackShare => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const { connect } = useSlack();
  const { data: integrations, isLoading } = useIntegrationsQuery();

  // an integration connected before user scopes were requested holds no user
  // token, so it cannot post as the person and has to go back through OAuth
  const integration = integrations?.find(
    ({ type, canPostAsUser }) =>
      type === UserIntegrationType.Slack && canPostAsUser,
  );

  const { mutateAsync: share, isPending: isSharing } = useMutation({
    mutationFn: async ({
      channelId,
      postId,
    }: {
      channelId: string;
      postId: string;
    }) => {
      await gqlClient.request(SLACK_POST_MESSAGE_MUTATION, {
        integrationId: integration!.id,
        channelId,
        postId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: integrationRecentChannelsQueryOptions({
          integrationId: integration!.id,
          user,
        }).queryKey,
      });
    },
  });

  return {
    integration,
    isLoading,
    connect: useCallback(
      (redirectPath: string) => connect({ redirectPath }),
      [connect],
    ),
    share: useCallback(
      async (params) => {
        await share(params);
      },
      [share],
    ),
    isSharing,
  };
};
