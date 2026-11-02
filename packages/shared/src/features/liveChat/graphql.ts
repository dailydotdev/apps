import { gql } from 'graphql-request';
import { gqlClient } from '../../graphql/common';

export enum ChatRoomStatus {
  Active = 'active',
  Closed = 'closed',
}

export type ChatRoom = {
  id: string;
  status: ChatRoomStatus;
  // The room's XMPP address; null until the chat server created it.
  jid: string | null;
  title: string;
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
    status
    jid
    title
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

export const getLiveChatRooms = async (first: number): Promise<ChatRoom[]> => {
  const res = await gqlClient.request<{ liveChatRooms: ChatRoom[] }>(
    LIVE_CHAT_ROOMS_QUERY,
    { first },
  );

  return res.liveChatRooms;
};
