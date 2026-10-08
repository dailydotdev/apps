import { gql } from 'graphql-request';
import { gqlClient } from '../../graphql/common';
import type { Connection } from '../../graphql/common';
import type { UserShortProfile } from '../../lib/user';

export type DirectMessageConversation = {
  id: string;
  // Null on a message request, which isn't paired in the chat server yet.
  jid: string | null;
  peerJid: string | null;
  requestMessage: string | null;
  // The viewer started it, so wrote the note.
  createdByViewer: boolean;
  // Still a message request. A declined one stays a request to its sender.
  isRequest: boolean;
  createdAt: string;
  peer: Pick<
    UserShortProfile,
    'id' | 'name' | 'username' | 'image' | 'permalink'
  >;
};

// How the viewer can reach a user. The server never says why it's
// unavailable, and shows a declined request as still pending.
export enum DirectMessageAccess {
  Open = 'open',
  Request = 'request',
  Pending = 'pending',
  Unavailable = 'unavailable',
}

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
    requestMessage
    createdByViewer
    isRequest
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

const DIRECT_MESSAGE_ACCESS_QUERY = gql`
  query DirectMessageAccess($userId: ID!) {
    directMessageAccess(userId: $userId)
  }
`;

const DIRECT_MESSAGE_REQUESTS_QUERY = gql`
  query DirectMessageRequests($first: Int, $after: String) {
    directMessageRequests(first: $first, after: $after) {
      edges {
        node {
          ...DirectMessageConversationFragment
        }
      }
    }
  }
  ${DIRECT_MESSAGE_CONVERSATION_FRAGMENT}
`;

const DIRECT_MESSAGE_CONVERSATION_QUERY = gql`
  query DirectMessageConversation($userId: ID!) {
    directMessageConversation(userId: $userId) {
      ...DirectMessageConversationFragment
    }
  }
  ${DIRECT_MESSAGE_CONVERSATION_FRAGMENT}
`;

const DIRECT_MESSAGE_REQUEST_COUNT_QUERY = gql`
  query DirectMessageRequestCount {
    directMessageRequestCount
  }
`;

const SEND_DIRECT_MESSAGE_REQUEST_MUTATION = gql`
  mutation SendDirectMessageRequest($userId: ID!, $message: String!) {
    sendDirectMessageRequest(userId: $userId, message: $message) {
      _
    }
  }
`;

const ACCEPT_DIRECT_MESSAGE_REQUEST_MUTATION = gql`
  mutation AcceptDirectMessageRequest($userId: ID!) {
    acceptDirectMessageRequest(userId: $userId) {
      ...DirectMessageConversationFragment
    }
  }
  ${DIRECT_MESSAGE_CONVERSATION_FRAGMENT}
`;

const DECLINE_DIRECT_MESSAGE_REQUEST_MUTATION = gql`
  mutation DeclineDirectMessageRequest($userId: ID!) {
    declineDirectMessageRequest(userId: $userId) {
      _
    }
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

export const getDirectMessageAccess = async (
  userId: string,
): Promise<DirectMessageAccess> => {
  const res = await gqlClient.request<{
    directMessageAccess: DirectMessageAccess;
  }>(DIRECT_MESSAGE_ACCESS_QUERY, { userId });

  return res.directMessageAccess;
};

export const getDirectMessageRequests = async (): Promise<
  DirectMessageConversation[]
> => {
  const res = await gqlClient.request<{
    directMessageRequests: Connection<DirectMessageConversation>;
  }>(DIRECT_MESSAGE_REQUESTS_QUERY, { first: conversationsPageSize });

  return res.directMessageRequests.edges.map(({ node }) => node);
};

export const getDirectMessageConversation = async (
  userId: string,
): Promise<DirectMessageConversation | null> => {
  const res = await gqlClient.request<{
    directMessageConversation: DirectMessageConversation | null;
  }>(DIRECT_MESSAGE_CONVERSATION_QUERY, { userId });

  return res.directMessageConversation;
};

export const getDirectMessageRequestCount = async (): Promise<number> => {
  const res = await gqlClient.request<{ directMessageRequestCount: number }>(
    DIRECT_MESSAGE_REQUEST_COUNT_QUERY,
  );

  return res.directMessageRequestCount;
};

export const sendDirectMessageRequest = async ({
  userId,
  message,
}: {
  userId: string;
  message: string;
}): Promise<void> => {
  await gqlClient.request(SEND_DIRECT_MESSAGE_REQUEST_MUTATION, {
    userId,
    message,
  });
};

export const acceptDirectMessageRequest = async (
  userId: string,
): Promise<DirectMessageConversation> => {
  const res = await gqlClient.request<{
    acceptDirectMessageRequest: DirectMessageConversation;
  }>(ACCEPT_DIRECT_MESSAGE_REQUEST_MUTATION, { userId });

  return res.acceptDirectMessageRequest;
};

export const declineDirectMessageRequest = async (
  userId: string,
): Promise<void> => {
  await gqlClient.request(DECLINE_DIRECT_MESSAGE_REQUEST_MUTATION, { userId });
};
