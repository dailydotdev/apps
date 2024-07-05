import request from 'graphql-request';
import { useAuthContext } from '../contexts/AuthContext';
import { setCookie } from '../lib/cookie';
import { graphqlUrl } from '../lib/config';
import { SLACK_CONNECT_SOURCE_MUTATION } from '../graphql/slack';

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
};

const scopes = ['channels:read', 'chat:write', 'channels:join'];

export const useSlack = (): UseSlack => {
  const { user } = useAuthContext();

  return {
    connect: async ({ redirectPath }) => {
      const url = new URL('https://slack.com/oauth/v2/authorize');

      const redirectUrl = new URL(
        `${window.location.origin}/api/slack/auth/callback`,
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
      });

      window.location.href = url.toString();
    },
    connectSource: async ({ integrationId, channelId, sourceId }) => {
      await request(graphqlUrl, SLACK_CONNECT_SOURCE_MUTATION, {
        integrationId,
        channelId,
        sourceId,
      });
    },
  };
};
