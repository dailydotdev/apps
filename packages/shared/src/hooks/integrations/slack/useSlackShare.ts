import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ApiErrorResult } from '../../../graphql/common';
import { ApiError, getApiError, gqlClient } from '../../../graphql/common';
import {
  INTEGRATION_SHARE_IMAGE_MUTATION,
  INTEGRATION_SHARE_POST_MUTATION,
  integrationRecentChannelsQueryOptions,
  UserIntegrationType,
} from '../../../graphql/integrations';
import type { UserIntegration } from '../../../graphql/integrations';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useIntegrationsQuery } from '../useIntegrationsQuery';
import { useSlack } from './useSlack';

type SlackShareParams = {
  channelId: string;
  postId: string;
  /** Sent instead of the post link, with the message above it. */
  image?: File;
  message?: string;
};

/** The workspace's token lacks `files:write`, so it has to reconnect. */
export const isSlackMissingScopeError = (error: unknown): boolean => {
  const { extensions } =
    getApiError(error as ApiErrorResult, ApiError.Forbidden) ?? {};

  return (
    (extensions as { reason?: string } | undefined)?.reason ===
    'INTEGRATION_MISSING_SCOPE'
  );
};

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
  /** Whether a share can upload an image. False until Slack is reconnected. */
  canShareImages: boolean;
  isLoading: boolean;
  connect: (redirectPath: string) => void;
  share: (params: SlackShareParams) => Promise<void>;
  isSharing: boolean;
};

export const useSlackShare = ({
  enabled = true,
}: { enabled?: boolean } = {}): UseSlackShare => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const { connect } = useSlack();
  const { data: integrations, isLoading } = useIntegrationsQuery({
    queryOptions: { enabled },
  });

  // prefer a workspace that can post as the person, but fall back to any
  // connected one: sharing as the app beats not sharing at all
  const slackIntegrations = integrations?.filter(
    ({ type }) => type === UserIntegrationType.Slack,
  );
  const integration =
    slackIntegrations?.find(({ canPostAsUser }) => canPostAsUser) ??
    slackIntegrations?.[0];

  const { mutateAsync: share, isPending: isSharing } = useMutation({
    mutationFn: async ({ image, message, ...params }: SlackShareParams) => {
      const integrationId = integration!.id;

      if (image) {
        await gqlClient.request(INTEGRATION_SHARE_IMAGE_MUTATION, {
          ...params,
          integrationId,
          image,
          message: message?.trim() || undefined,
        });

        return;
      }

      await gqlClient.request(INTEGRATION_SHARE_POST_MUTATION, {
        ...params,
        integrationId,
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
    canShareImages: !!integration?.canShareImages,
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
