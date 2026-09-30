import { gql } from 'graphql-request';
import type { Source } from './sources';
import { gqlClient } from './common';
import { generateQueryKey, RequestKey, StaleTime } from '../lib/query';
import type { LoggedUser } from '../lib/user';

export enum UserIntegrationType {
  Slack = 'slack',
}

export type UserIntegration = {
  id: string;
  type: UserIntegrationType;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  userId: string;
  canPostAsUser?: boolean;
};

export type SlackChannel = {
  id: string;
  name: string;
};

export type UserSourceIntegration = {
  type: UserIntegrationType;
  createdAt: Date;
  updatedAt: Date;
  userIntegration: UserIntegration;
  source: Source;
  channelIds: string[];
};

export const SLACK_CHANNELS_QUERY = gql`
  query SlackChannels($integrationId: ID!, $cursor: String) {
    slackChannels(integrationId: $integrationId, limit: 200, cursor: $cursor) {
      data {
        id
        name
      }
      cursor
    }
  }
`;

export const INTEGRATION_RECENT_CHANNELS_QUERY = gql`
  query IntegrationRecentChannels($integrationId: ID!) {
    integrationRecentChannels(integrationId: $integrationId) {
      id
      name
    }
  }
`;

export const integrationRecentChannelsQueryOptions = ({
  integrationId,
  user,
}: {
  integrationId?: string;
  user?: LoggedUser;
}) => ({
  queryKey: generateQueryKey(RequestKey.IntegrationRecentChannels, user, {
    integrationId,
  }),
  queryFn: async (): Promise<SlackChannel[]> => {
    const { integrationRecentChannels } = await gqlClient.request<{
      integrationRecentChannels: SlackChannel[];
    }>(INTEGRATION_RECENT_CHANNELS_QUERY, { integrationId });

    return integrationRecentChannels;
  },
  staleTime: StaleTime.Default,
  enabled: !!integrationId && !!user,
});

export const INTEGRATION_SHARE_POST_MUTATION = gql`
  mutation IntegrationSharePost(
    $integrationId: ID!
    $channelId: ID!
    $postId: ID!
  ) {
    integrationSharePost(
      integrationId: $integrationId
      channelId: $channelId
      postId: $postId
    ) {
      _
    }
  }
`;

export type SlackDigest = {
  id: string;
  integrationId: string;
  channelId: string;
  channelName: string;
  // 0 is Sunday, as in Date.getDay
  weekday: number;
  hour: number;
  timezone: string;
  // empty means every topic the team reads
  tags: string[];
  includeTeamStats: boolean;
};

export type UpsertSlackDigestInput = Omit<SlackDigest, 'id' | 'channelName'> & {
  id?: string;
};

const SLACK_DIGEST_FRAGMENT = gql`
  fragment SlackDigestFragment on SlackDigest {
    id
    integrationId
    channelId
    channelName
    weekday
    hour
    timezone
    tags
    includeTeamStats
  }
`;

export const SLACK_DIGESTS_QUERY = gql`
  query SlackDigests($integrationId: ID!) {
    slackDigests(integrationId: $integrationId) {
      ...SlackDigestFragment
    }
  }
  ${SLACK_DIGEST_FRAGMENT}
`;

export const UPSERT_SLACK_DIGEST_MUTATION = gql`
  mutation UpsertSlackDigest($input: UpsertSlackDigestInput!) {
    upsertSlackDigest(input: $input) {
      ...SlackDigestFragment
    }
  }
  ${SLACK_DIGEST_FRAGMENT}
`;

export const DELETE_SLACK_DIGEST_MUTATION = gql`
  mutation DeleteSlackDigest($id: ID!) {
    deleteSlackDigest(id: $id) {
      _
    }
  }
`;

export const slackDigestsQueryOptions = ({
  integrationId,
  user,
}: {
  integrationId?: string;
  user?: LoggedUser;
}) => ({
  queryKey: generateQueryKey(RequestKey.SlackDigests, user, {
    integrationId,
  }),
  queryFn: async (): Promise<SlackDigest[]> => {
    const { slackDigests } = await gqlClient.request<{
      slackDigests: SlackDigest[];
    }>(SLACK_DIGESTS_QUERY, { integrationId });

    return slackDigests;
  },
  staleTime: StaleTime.Default,
  enabled: !!integrationId && !!user,
});

export const SLACK_CONNECT_SOURCE_MUTATION = gql`
  mutation SlackConnectSource(
    $integrationId: ID!
    $channelId: ID!
    $sourceId: ID!
  ) {
    slackConnectSource(
      integrationId: $integrationId
      channelId: $channelId
      sourceId: $sourceId
    ) {
      _
    }
  }
`;

export const SOURCE_INTEGRATION_QUERY = gql`
  query SourceIntegration(
    $sourceId: ID!
    $userIntegrationType: UserIntegrationType!
  ) {
    sourceIntegration(sourceId: $sourceId, type: $userIntegrationType) {
      userIntegration {
        id
        userId
        type
      }
      type
      createdAt
      updatedAt
      source {
        id
      }
      channelIds
    }
  }
`;

export const SOURCE_INTEGRATIONS_QUERY = gql`
  query SourceIntegrations($integrationId: ID!) {
    sourceIntegrations(integrationId: $integrationId) {
      edges {
        node {
          userIntegration {
            id
            userId
            type
          }
          type
          createdAt
          updatedAt
          source {
            id
            name
            handle
            image
          }
          channelIds
        }
      }
    }
  }
`;

export const REMOVE_INTEGRATION_MUTATION = gql`
  mutation RemoveIntegration($integrationId: ID!) {
    removeIntegration(integrationId: $integrationId) {
      _
    }
  }
`;

export const REMOVE_SOURCE_INTEGRATION_MUTATION = gql`
  mutation RemoveSourceIntegration($sourceId: ID!, $integrationId: ID!) {
    removeSourceIntegration(
      sourceId: $sourceId
      integrationId: $integrationId
    ) {
      _
    }
  }
`;

export const CREATE_SHARED_SLACK_CHANNEL_MUTATION = gql`
  mutation CreateSharedSlackChannel(
    $email: String!
    $channelName: String!
    $opportunityId: ID!
  ) {
    createSharedSlackChannel(
      email: $email
      channelName: $channelName
      opportunityId: $opportunityId
    ) {
      _
    }
  }
`;
