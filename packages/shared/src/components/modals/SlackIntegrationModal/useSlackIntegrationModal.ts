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
import { useSlackChannelsQuery } from '../../../hooks/integrations/slack/useSlackChannelsQuery';
import { useIntegrationsQuery } from '../../../hooks/integrations/useIntegrationsQuery';
import { useSourceIntegrationQuery } from '../../../hooks/integrations/useSourceIntegrationQuery';
import type { SlackIntegrationModalProps } from './SlackIntegrationModal';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, Origin } from '../../../lib/log';

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
  hasIntegrations: boolean;
};

export const useSlackIntegrationModal = ({
  source,
}: UseSlackIntegrationModalProps): UseSlackIntegrationModal => {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();
  const { displayToast } = useToastNotification();
  const { logEvent } = useLogContext();

  const [state, setState] = useState<{
    userIntegration?: UserIntegration;
    channelId?: string;
  }>({});

  const { data: sourceIntegration } = useSourceIntegrationQuery({
    userIntegrationType: UserIntegrationType.Slack,
    sourceId: source.id,
  });

  const { data: slackIntegrations, isLoading: isLoadingIntegrations } =
    useIntegrationsQuery({
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
  const hasIntegrations = !!slackIntegrations?.length && !isLoadingIntegrations;

  const { data: channels } = useSlackChannelsQuery({
    integrationId: selectedIntegration?.id,
  });

  const selectedChannel = state.channelId || sourceIntegration?.channelIds[0];
  const selectedChannelIndex = useMemo(() => {
    return channels?.findIndex((item) => item.id === selectedChannel) || 0;
  }, [channels, selectedChannel]);

  const slack = useSlack();

  const onConnectNew = useCallback(() => {
    logEvent({
      event_name: LogEvent.StartAddingWorkspace,
      target_id: UserIntegrationType.Slack,
      extra: JSON.stringify({
        source: source.id,
        origin: hasIntegrations ? Origin.WorkspaceDropdown : Origin.SquadPage,
      }),
    });

    slack.connect({
      redirectPath: `/${
        source.type === SourceType.Squad ? 'squads' : 'sources'
      }/${source.handle}?lzym=${LazyModal.SlackIntegration}`,
    });
  }, [slack, source, logEvent, hasIntegrations]);

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

  const onWorkspaceChange = useCallback<
    UseSlackIntegrationModal['onWorkspaceChange']
  >(
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
  );

  const onChannelChange = useCallback<
    UseSlackIntegrationModal['onChannelChange']
  >(
    (value, index) => {
      setState((current) => {
        return {
          ...current,
          channelId: channels[index].id,
        };
      });
    },
    [channels],
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
    onWorkspaceChange,
    onChannelChange,
    hasIntegrations,
  };
};
