import { gql } from 'graphql-request';
import { gqlClient } from '../../graphql/common';
import type { Connection } from '../../graphql/common';
import type { UserShortProfile } from '../../lib/user';

export type DirectMessageConversation = {
  id: string;
  jid: string;
  peerJid: string;
  createdAt: string;
  peer: Pick<
    UserShortProfile,
    'id' | 'name' | 'username' | 'image' | 'permalink'
  >;
};

export type DirectMessageToken = {
  token: string;
  jid: string;
  expiresAt: string;
};

const DIRECT_MESSAGE_CONVERSATION_FRAGMENT = gql`
  fragment DirectMessageConversationFragment on DirectMessageConversation {
    id
    jid
    peerJid
    createdAt
    peer {
      id
      name
      username
      image
      permalink
    }
  }
`;

const DIRECT_MESSAGE_CONVERSATIONS_QUERY = gql`
  query DirectMessageConversations($first: Int, $after: String) {
    directMessageConversations(first: $first, after: $after) {
      edges {
        node {
          ...DirectMessageConversationFragment
        }
      }
    }
  }
  ${DIRECT_MESSAGE_CONVERSATION_FRAGMENT}
`;

const START_DIRECT_MESSAGE_MUTATION = gql`
  mutation StartDirectMessage($userId: ID!) {
    startDirectMessage(userId: $userId) {
      ...DirectMessageConversationFragment
    }
  }
  ${DIRECT_MESSAGE_CONVERSATION_FRAGMENT}
`;

const DIRECT_MESSAGE_TOKEN_MUTATION = gql`
  mutation DirectMessageToken {
    directMessageToken {
      token
      jid
      expiresAt
    }
  }
`;

const CAN_DIRECT_MESSAGE_QUERY = gql`
  query CanDirectMessage($userId: ID!) {
    canDirectMessage(userId: $userId)
  }
`;

export const DIRECT_MESSAGE_SETTINGS_QUERY = gql`
  query DirectMessageSettings {
    directMessageSettings {
      enabled
    }
  }
`;

export const UPDATE_DIRECT_MESSAGE_SETTINGS_MUTATION = gql`
  mutation UpdateDirectMessageSettings($enabled: Boolean!) {
    updateDirectMessageSettings(enabled: $enabled) {
      enabled
    }
  }
`;

// The inbox is short for now; one page covers it until the list paginates.
const conversationsPageSize = 50;

export const getDirectMessageConversations = async (): Promise<
  DirectMessageConversation[]
> => {
  const res = await gqlClient.request<{
    directMessageConversations: Connection<DirectMessageConversation>;
  }>(DIRECT_MESSAGE_CONVERSATIONS_QUERY, { first: conversationsPageSize });

  return res.directMessageConversations.edges.map(({ node }) => node);
};

export const startDirectMessage = async (
  userId: string,
): Promise<DirectMessageConversation> => {
  const res = await gqlClient.request<{
    startDirectMessage: DirectMessageConversation;
  }>(START_DIRECT_MESSAGE_MUTATION, { userId });

  return res.startDirectMessage;
};

export const getDirectMessageToken = async (): Promise<DirectMessageToken> => {
  const res = await gqlClient.request<{
    directMessageToken: DirectMessageToken;
  }>(DIRECT_MESSAGE_TOKEN_MUTATION);

  return res.directMessageToken;
};

export const getCanDirectMessage = async (userId: string): Promise<boolean> => {
  const res = await gqlClient.request<{ canDirectMessage: boolean }>(
    CAN_DIRECT_MESSAGE_QUERY,
    { userId },
  );

  return res.canDirectMessage;
};
