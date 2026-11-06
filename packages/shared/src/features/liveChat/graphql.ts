import { gql } from 'graphql-request';
import { gqlClient } from '../../graphql/common';

export enum ChatRoomType {
  // A temporary, open chat on a post the daily.dev team picked.
  PostLive = 'post_live',
  // A temporary, open chat on a topic the daily.dev team set; no post.
  Topic = 'topic',
}

export enum ChatRoomStatus {
  Active = 'active',
  Closed = 'closed',
}

export type ChatRoom = {
  id: string;
  type: ChatRoomType;
  status: ChatRoomStatus;
  // The room's XMPP address; null until the chat server created it.
  jid: string | null;
  title: string;
  // What a topic room is about; null on a post room.
  description?: string | null;
  post?: { id: string; title?: string; commentsPermalink?: string } | null;
  expiresAt: string | null;
  // Null when the chat server couldn't say.
  occupantCount: number | null;
  createdAt: string;
};

// What a feed card knows about a post's room: enough for the label.
export type PostChatRoom = Pick<ChatRoom, 'id' | 'occupantCount'>;

const CHAT_ROOM_FRAGMENT = gql`
  fragment ChatRoomFragment on ChatRoom {
    id
    type
    status
    jid
    title
    description
    post {
      id
      title
      commentsPermalink
    }
    expiresAt
    occupantCount
    createdAt
  }
`;

const POST_CHAT_ROOM_QUERY = gql`
  query PostChatRoom($postId: ID!) {
    postChatRoom(postId: $postId) {
      ...ChatRoomFragment
    }
  }
  ${CHAT_ROOM_FRAGMENT}
`;

const OPEN_POST_CHAT_ROOM_MUTATION = gql`
  mutation OpenPostChatRoom($postId: ID!) {
    openPostChatRoom(postId: $postId) {
      ...ChatRoomFragment
    }
  }
  ${CHAT_ROOM_FRAGMENT}
`;

const CHAT_ROOM_QUERY = gql`
  query ChatRoom($id: ID!) {
    chatRoom(id: $id) {
      ...ChatRoomFragment
    }
  }
  ${CHAT_ROOM_FRAGMENT}
`;

const OPEN_TOPIC_CHAT_ROOM_MUTATION = gql`
  mutation OpenTopicChatRoom($title: String!, $description: String) {
    openTopicChatRoom(title: $title, description: $description) {
      ...ChatRoomFragment
    }
  }
  ${CHAT_ROOM_FRAGMENT}
`;

const CHAT_ROOM_PRESENCE_QUERY = gql`
  query ChatRoomPresence($id: ID!, $userIds: [ID!]!) {
    chatRoom(id: $id) {
      id
      presentUserIds(userIds: $userIds)
    }
  }
`;

const LIVE_CHAT_ROOMS_QUERY = gql`
  query LiveChatRooms($first: Int) {
    liveChatRooms(first: $first) {
      ...ChatRoomFragment
    }
  }
  ${CHAT_ROOM_FRAGMENT}
`;

export const getPostChatRoom = async (
  postId: string,
): Promise<ChatRoom | null> => {
  const res = await gqlClient.request<{ postChatRoom: ChatRoom | null }>(
    POST_CHAT_ROOM_QUERY,
    { postId },
  );

  return res.postChatRoom;
};

export const openPostChatRoom = async (postId: string): Promise<ChatRoom> => {
  const res = await gqlClient.request<{ openPostChatRoom: ChatRoom }>(
    OPEN_POST_CHAT_ROOM_MUTATION,
    { postId },
  );

  return res.openPostChatRoom;
};

export const getChatRoom = async (id: string): Promise<ChatRoom | null> => {
  const res = await gqlClient.request<{ chatRoom: ChatRoom | null }>(
    CHAT_ROOM_QUERY,
    { id },
  );

  return res.chatRoom;
};

// The API caps a title and a description; the form mirrors them.
export const TOPIC_CHAT_ROOM_TITLE_MAX_LENGTH = 80;
export const TOPIC_CHAT_ROOM_DESCRIPTION_MAX_LENGTH = 280;

export const openTopicChatRoom = async (input: {
  title: string;
  description?: string;
}): Promise<ChatRoom> => {
  const res = await gqlClient.request<{ openTopicChatRoom: ChatRoom }>(
    OPEN_TOPIC_CHAT_ROOM_MUTATION,
    input,
  );

  return res.openTopicChatRoom;
};

export const getLiveChatRooms = async (first: number): Promise<ChatRoom[]> => {
  const res = await gqlClient.request<{ liveChatRooms: ChatRoom[] }>(
    LIVE_CHAT_ROOMS_QUERY,
    { first },
  );

  return res.liveChatRooms;
};

// Of the given users, those in the room right now. Null when the chat server
// couldn't say.
export const getChatRoomPresence = async (
  id: string,
  userIds: string[],
): Promise<string[] | null> => {
  const res = await gqlClient.request<{
    chatRoom: { presentUserIds: string[] | null } | null;
  }>(CHAT_ROOM_PRESENCE_QUERY, { id, userIds });

  return res.chatRoom?.presentUserIds ?? null;
};

const CLOSE_CHAT_ROOM_MUTATION = gql`
  mutation CloseChatRoom($id: ID!) {
    closeChatRoom(id: $id) {
      ...ChatRoomFragment
    }
  }
  ${CHAT_ROOM_FRAGMENT}
`;

const BAN_CHAT_ROOM_USER_MUTATION = gql`
  mutation BanChatRoomUser($id: ID!, $userId: ID!) {
    banChatRoomUser(id: $id, userId: $userId) {
      _
    }
  }
`;

// Ends the room early; the daily.dev team and moderators only.
export const closeChatRoom = async (id: string): Promise<ChatRoom> => {
  const res = await gqlClient.request<{ closeChatRoom: ChatRoom }>(
    CLOSE_CHAT_ROOM_MUTATION,
    { id },
  );

  return res.closeChatRoom;
};

// Removes the user from the room for good; the daily.dev team and
// moderators only.
export const banChatRoomUser = async (
  id: string,
  userId: string,
): Promise<void> => {
  await gqlClient.request(BAN_CHAT_ROOM_USER_MUTATION, { id, userId });
};
