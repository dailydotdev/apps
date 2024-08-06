import { gql } from 'graphql-request';
import type { Source } from './sources';

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

export type SlackChannelConnection = {
  data: SlackChannel[];
};

export const SLACK_CHANNELS_QUERY = gql`
  query SlackChannels($integrationId: ID!) {
    slackChannels(integrationId: $integrationId, limit: 999) {
      data {
        id
        name
      }
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
