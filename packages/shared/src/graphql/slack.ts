import { gql } from 'graphql-request';

export type SlackChannels = {
  id: string;
  name: string;
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
