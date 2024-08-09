import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import {
  SlackChannel,
  UserIntegration,
  UserIntegrationType,
} from '../../../graphql/integrations';
import { SourceType } from '../../../graphql/sources';
import { useSlack } from '../../../hooks/integrations/slack/useSlack';
import { labels } from '../../../lib';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { LazyModal } from '../common/types';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useToastNotification } from '../../../hooks';
import { useSlackChannels } from '../../../hooks/integrations/slack/useSlackChannels';
import { useIntegrations } from '../../../hooks/integrations/useIntegrations';
import { useSourceIntegration } from '../../../hooks/integrations/useSourceIntegration';
import type { SlackIntegrationModalProps } from './SlackIntegrationModal';

export type UseSlackIntegrationModalProps = Pick<
  SlackIntegrationModalProps,
  'source'
>;

export type UseSlackIntegrationModal = {
  state: {
    userIntegration?: UserIntegration;
    channelId?: string;
  };
  slackIntegrations?: UserIntegration[];
  channels?: SlackChannel[];
  isLoadingIntegrations: boolean;
  selectedIntegration?: UserIntegration;
  selectedIntegrationIndex: number;
  selectedChannelIndex: number;
  onSave: () => Promise<void>;
  isSaving: boolean;
  onConnectNew: () => void;
  onWorkspaceChange: (value: string, index: number) => void;
  onChannelChange: (value: string, index: number) => void;
};

export const useSlackIntegrationModal = ({
  source,
}: UseSlackIntegrationModalProps): UseSlackIntegrationModal => {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();
  const { displayToast } = useToastNotification();

  const [state, setState] = useState<{
    userIntegration?: UserIntegration;
    channelId?: string;
  }>({});

  const { data: sourceIntegration } = useSourceIntegration({
    userIntegrationType: UserIntegrationType.Slack,
    sourceId: source.id,
  });

  const { data: slackIntegrations, isLoading: isLoadingIntegrations } =
    useIntegrations({
      queryOptions: {
        select: useCallback((data) => {
          const filteredData = data.filter(
            (integration) => integration.type === UserIntegrationType.Slack,
          );

          if (filteredData.length > 0) {
            filteredData.push({
              id: 'new',
              type: UserIntegrationType.Slack,
              createdAt: new Date(),
              updatedAt: new Date(),
              name: 'Connect another workspace',
              userId: 'new',
            });
          }

          return filteredData;
        }, []),
      },
    });

  const selectedIntegration =
    state.userIntegration ||
    sourceIntegration?.userIntegration ||
    slackIntegrations?.[0];
  const selectedIntegrationIndex = useMemo(() => {
    return (
      slackIntegrations?.findIndex(
        (item) => item.id === selectedIntegration?.id,
      ) || 0
    );
  }, [slackIntegrations, selectedIntegration]);

  const { data: channels } = useSlackChannels({
    integrationId: selectedIntegration?.id,
  });

  const selectedChannel = state.channelId || sourceIntegration?.channelIds[0];
  const selectedChannelIndex = useMemo(() => {
    return channels?.findIndex((item) => item.id === selectedChannel) || 0;
  }, [channels, selectedChannel]);

  const slack = useSlack();

  const onConnectNew = useCallback(() => {
    slack.connect({
      redirectPath: `/${
        source.type === SourceType.Squad ? 'squads' : 'sources'
      }/${source.handle}?lzym=${LazyModal.SlackIntegration}`,
    });
  }, [slack, source]);

  const { mutateAsync: onSave, isLoading: isSaving } = useMutation(
    async () => {
      await slack.connectSource({
        channelId: channels[selectedChannelIndex].id,
        integrationId: selectedIntegration.id,
        sourceId: source.id,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(
          generateQueryKey(RequestKey.UserSourceIntegrations, user),
        );

        displayToast(labels.integrations.success.integrationSaved);
      },
      onError: () => {
        displayToast(labels.error.generic);
      },
    },
  );

  return {
    state,
    slackIntegrations,
    channels,
    isLoadingIntegrations,
    selectedIntegration,
    selectedIntegrationIndex,
    selectedChannelIndex,
    onSave,
    isSaving,
    onConnectNew,
    onWorkspaceChange: useCallback(
      (value, index) => {
        const currentIntegration = slackIntegrations[index];

        if (currentIntegration.id === 'new') {
          onConnectNew();

          return;
        }

        setState((current) => {
          return {
            ...current,
            userIntegration: slackIntegrations[index],
            channelId: undefined,
          };
        });
      },
      [slackIntegrations, onConnectNew],
    ),
    onChannelChange: useCallback(
      (value, index) => {
        setState((current) => {
          return {
            ...current,
            channelId: channels[index].id,
          };
        });
      },
      [channels],
    ),
  };
};
