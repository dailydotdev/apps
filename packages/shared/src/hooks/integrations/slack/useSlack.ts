import { useCallback } from 'react';
import { useAuthContext } from '../../../contexts/AuthContext';
import { setCookie } from '../../../lib/cookie';
import {
  SLACK_CONNECT_SOURCE_MUTATION,
  UserIntegrationType,
} from '../../../graphql/integrations';
import { isDevelopment } from '../../../lib/constants';
import { gqlClient } from '../../../graphql/common';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent } from '../../../lib/log';

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

const scopes = ['channels:read', 'chat:write', 'channels:join', 'groups:read'];

export const useSlack = (): UseSlack => {
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();

  const connect = useCallback<UseSlack['connect']>(
    async ({ redirectPath }) => {
      const url = new URL('https://slack.com/oauth/v2/authorize');

      const redirectUrl = new URL(
        `https://api.local.com/integrations/slack/auth/callback`,
      );
      url.searchParams.append('redirect_uri', redirectUrl.toString());

      url.searchParams.append('state', user.id);
      url.searchParams.append('scope', scopes.join(','));
      url.searchParams.append(
        'client_id',
        process.env.NEXT_PUBLIC_SLACK_CLIENT_ID,
      );

      setCookie('slackRedirectPath', redirectPath, {
        path: '/',
        maxAge: 3600,
        secure: !isDevelopment,
        domain: process.env.NEXT_PUBLIC_DOMAIN,
        sameSite: 'lax',
      });

      window.location.href = url.toString();
    },
    [user?.id],
  );

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
