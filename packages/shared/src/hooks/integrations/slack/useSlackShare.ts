import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { gqlClient } from '../../../graphql/common';
import {
  INTEGRATION_SHARE_POST_MUTATION,
  integrationRecentChannelsQueryOptions,
  UserIntegrationType,
} from '../../../graphql/integrations';
import type { UserIntegration } from '../../../graphql/integrations';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useIntegrationsQuery } from '../useIntegrationsQuery';
import { useSlack } from './useSlack';

export type UseSlackShare = {
  /**
   * The workspace a share posts to. Absent while loading, or when the user has
   * no Slack workspace connected.
   */
  integration?: UserIntegration;
  /**
   * Whether a share is attributed to the person. False means it posts as the
   * daily.dev app, which is what happens until the workspace grants user scopes.
   */
  canPostAsUser: boolean;
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

  // prefer a workspace that can post as the person, but fall back to any
  // connected one: sharing as the app beats not sharing at all
  const slackIntegrations = integrations?.filter(
    ({ type }) => type === UserIntegrationType.Slack,
  );
  const integration =
    slackIntegrations?.find(({ canPostAsUser }) => canPostAsUser) ??
    slackIntegrations?.[0];

  const { mutateAsync: share, isPending: isSharing } = useMutation({
    mutationFn: async ({
      channelId,
      postId,
    }: {
      channelId: string;
      postId: string;
    }) => {
      await gqlClient.request(INTEGRATION_SHARE_POST_MUTATION, {
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
    canPostAsUser: !!integration?.canPostAsUser,
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
