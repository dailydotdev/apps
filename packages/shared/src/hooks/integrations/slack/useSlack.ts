import { useCallback } from 'react';
import {
  SLACK_CONNECT_SOURCE_MUTATION,
  UserIntegrationType,
} from '../../../graphql/integrations';
import { gqlClient } from '../../../graphql/common';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent } from '../../../lib/log';
import { apiUrl } from '../../../lib/config';

export type UseSlack = {
  connect: ({ redirectPath }: { redirectPath: string }) => void;
  connectSource: ({
    integrationId,
    channelId,
    sourceId,
  }: {
    integrationId: string;
    channelId: string;
    sourceId: string;
  }) => Promise<void>;
};

export const useSlack = (): UseSlack => {
  const { logEvent } = useLogContext();

  const connect = useCallback<UseSlack['connect']>(({ redirectPath }) => {
    // apiUrl is a relative proxy path on localhost, hence the base
    const url = new URL(
      `${apiUrl}/integrations/slack/auth/authorize`,
      globalThis.location?.origin,
    );
    url.searchParams.set('redirectPath', redirectPath);

    window.location.href = url.toString();
  }, []);

  const connectSource = useCallback<UseSlack['connectSource']>(
    async ({ integrationId, channelId, sourceId }) => {
      logEvent({
        event_name: LogEvent.SetIntegration,
        target_id: UserIntegrationType.Slack,
        extra: JSON.stringify({
          source: sourceId,
        }),
      });

      await gqlClient.request(SLACK_CONNECT_SOURCE_MUTATION, {
        integrationId,
        channelId,
        sourceId,
      });
    },
    [logEvent],
  );

  return {
    connect,
    connectSource,
  };
};
