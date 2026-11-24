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
  // Messages the viewer hasn't read yet.
  unreadCount: number;
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
    unreadCount
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

const DIRECT_MESSAGE_UNREAD_COUNT_QUERY = gql`
  query DirectMessageUnreadCount {
    directMessageUnreadCount
  }
`;

const MARK_DIRECT_MESSAGE_SENT_MUTATION = gql`
  mutation MarkDirectMessageSent($userId: ID!, $preview: String) {
    markDirectMessageSent(userId: $userId, preview: $preview) {
      _
    }
  }
`;

const MARK_DIRECT_MESSAGES_READ_MUTATION = gql`
  mutation MarkDirectMessagesRead($userId: ID!) {
    markDirectMessagesRead(userId: $userId) {
      _
    }
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

// How many conversations have messages the viewer hasn't read.
export const getDirectMessageUnreadCount = async (): Promise<number> => {
  const res = await gqlClient.request<{ directMessageUnreadCount: number }>(
    DIRECT_MESSAGE_UNREAD_COUNT_QUERY,
  );

  return res.directMessageUnreadCount;
};

// Messages never pass through the API, so the sender reports each one the
// chat server acked; that's what the peer's unread count is built from. The
// preview is what the peer's push notification shows.
export const markDirectMessageSent = async (
  userId: string,
  preview?: string,
): Promise<void> => {
  await gqlClient.request(MARK_DIRECT_MESSAGE_SENT_MUTATION, {
    userId,
    preview,
  });
};

export const markDirectMessagesRead = async (userId: string): Promise<void> => {
  await gqlClient.request(MARK_DIRECT_MESSAGES_READ_MUTATION, { userId });
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

// A company page's support group chat: the page's admins and the daily.dev
// team in one members-only room.
export type CompanySupportChat = {
  id: string;
  // Null until the chat server has created the room.
  jid: string | null;
  unreadCount: number;
  lastMessageAt: string | null;
  createdAt: string;
  source: {
    id: string;
    name: string;
    handle: string;
    image: string;
    permalink: string;
  };
  members: Pick<
    UserShortProfile,
    'id' | 'name' | 'username' | 'image' | 'permalink'
  >[];
};

const COMPANY_SUPPORT_CHAT_FRAGMENT = gql`
  fragment CompanySupportChatFragment on CompanySupportChat {
    id
    jid
    unreadCount
    lastMessageAt
    createdAt
    source {
      id
      name
      handle
      image
      permalink
    }
    members {
      id
      name
      username
      image
      permalink
    }
  }
`;

const COMPANY_SUPPORT_CHATS_QUERY = gql`
  query CompanySupportChats($first: Int, $after: String) {
    companySupportChats(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          ...CompanySupportChatFragment
        }
      }
    }
  }
  ${COMPANY_SUPPORT_CHAT_FRAGMENT}
`;

const COMPANY_SUPPORT_CHAT_QUERY = gql`
  query CompanySupportChat($id: ID!) {
    companySupportChat(id: $id) {
      ...CompanySupportChatFragment
    }
  }
  ${COMPANY_SUPPORT_CHAT_FRAGMENT}
`;

const OPEN_COMPANY_SUPPORT_CHAT_MUTATION = gql`
  mutation OpenCompanySupportChat($sourceId: ID!) {
    openCompanySupportChat(sourceId: $sourceId) {
      ...CompanySupportChatFragment
    }
  }
  ${COMPANY_SUPPORT_CHAT_FRAGMENT}
`;

const MARK_COMPANY_SUPPORT_MESSAGE_SENT_MUTATION = gql`
  mutation MarkCompanySupportMessageSent($id: ID!, $preview: String) {
    markCompanySupportMessageSent(id: $id, preview: $preview) {
      _
    }
  }
`;

const MARK_COMPANY_SUPPORT_CHAT_READ_MUTATION = gql`
  mutation MarkCompanySupportChatRead($id: ID!) {
    markCompanySupportChatRead(id: $id) {
      _
    }
  }
`;

// The daily.dev team is in every company's chat, so their list runs long and
// is read page by page.
const supportChatsPageSize = 100;
const maxSupportChatPages = 10;

export const getCompanySupportChats = async (): Promise<
  CompanySupportChat[]
> => {
  const chats: CompanySupportChat[] = [];
  let after: string | undefined;

  for (let page = 0; page < maxSupportChatPages; page += 1) {
    // eslint-disable-next-line no-await-in-loop
    const res = await gqlClient.request<{
      companySupportChats: Connection<CompanySupportChat>;
    }>(COMPANY_SUPPORT_CHATS_QUERY, { first: supportChatsPageSize, after });
    const { edges, pageInfo } = res.companySupportChats;
    chats.push(...edges.map(({ node }) => node));

    if (!pageInfo?.hasNextPage || !pageInfo.endCursor) {
      break;
    }
    after = pageInfo.endCursor;
  }

  return chats;
};

export const getCompanySupportChat = async (
  id: string,
): Promise<CompanySupportChat | null> => {
  const res = await gqlClient.request<{
    companySupportChat: CompanySupportChat | null;
  }>(COMPANY_SUPPORT_CHAT_QUERY, { id });

  return res.companySupportChat;
};

export const openCompanySupportChat = async (
  sourceId: string,
): Promise<CompanySupportChat> => {
  const res = await gqlClient.request<{
    openCompanySupportChat: CompanySupportChat;
  }>(OPEN_COMPANY_SUPPORT_CHAT_MUTATION, { sourceId });

  return res.openCompanySupportChat;
};

// The group counterpart of markDirectMessageSent: bumps every other member's
// unread count and pushes them.
export const markCompanySupportMessageSent = async (
  id: string,
  preview?: string,
): Promise<void> => {
  await gqlClient.request(MARK_COMPANY_SUPPORT_MESSAGE_SENT_MUTATION, {
    id,
    preview,
  });
};

export const markCompanySupportChatRead = async (id: string): Promise<void> => {
  await gqlClient.request(MARK_COMPANY_SUPPORT_CHAT_READ_MUTATION, { id });
};
