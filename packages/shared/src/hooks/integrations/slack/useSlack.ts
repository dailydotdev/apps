import { useCallback } from 'react';
import { useAuthContext } from '../../../contexts/AuthContext';
import { setCookie } from '../../../lib/cookie';
import {
  SLACK_CONNECT_SOURCE_MUTATION,
  UserIntegrationType,
} from '../../../graphql/integrations';
import { isDevelopment } from '../../../lib/constants';
import { gqlClient } from '../../../graphql/common';
import { apiUrl } from '../../../lib/config';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent } from '../../../lib/log';
import { feature } from '../../../lib/featureManagement';
import { useConditionalFeature } from '../../useConditionalFeature';

export type UseSlackProps = void;

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
  isFeatureLoading: boolean;
  isFeatureEnabled: boolean;
};

const scopes = ['channels:read', 'chat:write', 'channels:join', 'groups:read'];

export const useSlack = (): UseSlack => {
  const { user, isLoggedIn } = useAuthContext();
  const { logEvent } = useLogContext();
  const { value: slackIntegration, isLoading: isFeatureLoading } =
    useConditionalFeature({
      feature: feature.slackIntegration,
      shouldEvaluate: isLoggedIn,
    });

  const connect = useCallback<UseSlack['connect']>(
    async ({ redirectPath }) => {
      const url = new URL('https://slack.com/oauth/v2/authorize');

      const redirectUrl = new URL(`${apiUrl}/integrations/slack/auth/callback`);
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
    isFeatureLoading,
    isFeatureEnabled: !isFeatureLoading && !!slackIntegration,
  };
};
