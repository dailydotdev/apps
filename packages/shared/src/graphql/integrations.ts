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
    slackChannels(integrationId: $integrationId, limit: 100, cursor: $cursor) {
      data {
        id
        name
      }
      cursor
    }
  }
`;

export const SLACK_RECENT_CHANNELS_QUERY = gql`
  query SlackRecentChannels($integrationId: ID!) {
    slackRecentChannels(integrationId: $integrationId) {
      id
      name
    }
  }
`;

export const slackRecentChannelsQueryOptions = ({
  integrationId,
  user,
}: {
  integrationId?: string;
  user?: LoggedUser;
}) => ({
  queryKey: generateQueryKey(RequestKey.SlackRecentChannels, user, {
    integrationId,
  }),
  queryFn: async (): Promise<SlackChannel[]> => {
    const { slackRecentChannels } = await gqlClient.request<{
      slackRecentChannels: SlackChannel[];
    }>(SLACK_RECENT_CHANNELS_QUERY, { integrationId });

    return slackRecentChannels;
  },
  staleTime: StaleTime.Default,
  enabled: !!integrationId && !!user,
});

export const SLACK_POST_MESSAGE_MUTATION = gql`
  mutation SlackPostMessage(
    $integrationId: ID!
    $channelId: ID!
    $postId: ID!
  ) {
    slackPostMessage(
      integrationId: $integrationId
      channelId: $channelId
      postId: $postId
    ) {
      _
    }
  }
`;

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
