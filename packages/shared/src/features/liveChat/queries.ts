import { queryOptions } from '@tanstack/react-query';
import type { LoggedUser } from '../../lib/user';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import type { ChatRoom } from './graphql';
import {
  getChatRoom,
  getChatRoomPresence,
  getLiveChatRooms,
  getPostChatRoom,
} from './graphql';

type QueryUser = Pick<LoggedUser, 'id'> | undefined;

// The API caches the occupant count for 15s, so asking more often than this
// only repeats the cached answer.
export const LIVE_CHAT_ROOM_REFRESH_MS = 30 * 1000;

// The API caps a page at 20; rooms are team picks, so one page is all of them.
export const LIVE_CHAT_ROOMS_PAGE = 20;

export const postChatRoomQueryKey = (user: QueryUser, postId: string) =>
  generateQueryKey(RequestKey.ChatRooms, user, 'post', postId);

// The room open on a post, polled while the surface showing it is mounted so
// the occupant count and the room's end stay current.
export const postChatRoomQueryOptions = (user: QueryUser, postId: string) =>
  queryOptions<ChatRoom | null>({
    queryKey: postChatRoomQueryKey(user, postId),
    queryFn: () => getPostChatRoom(postId),
    staleTime: StaleTime.Default,
    refetchInterval: LIVE_CHAT_ROOM_REFRESH_MS,
    enabled: !!postId,
  });

export const chatRoomQueryKey = (user: QueryUser, roomId: string) =>
  generateQueryKey(RequestKey.ChatRooms, user, 'room', roomId);

// A room by id, for the chat page; polled like the post's room so the
// occupant count and the room's end stay current.
export const chatRoomQueryOptions = (user: QueryUser, roomId: string) =>
  queryOptions<ChatRoom | null>({
    queryKey: chatRoomQueryKey(user, roomId),
    queryFn: () => getChatRoom(roomId),
    staleTime: StaleTime.Default,
    refetchInterval: LIVE_CHAT_ROOM_REFRESH_MS,
    enabled: !!roomId,
  });

// The API answers for at most this many users per call.
export const LIVE_CHAT_PRESENCE_MAX_USERS = 100;

// Which users the API was asked about, and which of them are in the room
// (null when the chat server couldn't say, or the viewer holds no seat yet).
export type ChatRoomPresence = {
  userIds: string[];
  present: string[] | null;
};

// Polled like the room itself (the API caches the room's list for 15s). The
// key is the room alone and the senders are read when the poll runs, so a
// new speaker waits for the next tick instead of every reader asking at
// once; they just spoke, so they show as here meanwhile anyway.
export const chatRoomPresenceQueryOptions = (
  user: QueryUser,
  roomId: string | undefined,
  getUserIds: () => string[],
) =>
  queryOptions<ChatRoomPresence>({
    queryKey: generateQueryKey(RequestKey.ChatRooms, user, 'presence', roomId),
    queryFn: async () => {
      const userIds = getUserIds();
      const present = userIds.length
        ? await getChatRoomPresence(roomId as string, userIds)
        : [];

      return { userIds, present };
    },
    staleTime: StaleTime.Default,
    refetchInterval: LIVE_CHAT_ROOM_REFRESH_MS,
    enabled: !!user && !!roomId,
  });

export const liveChatRoomsQueryOptions = (user: QueryUser) =>
  queryOptions<ChatRoom[]>({
    queryKey: generateQueryKey(RequestKey.ChatRooms, user, 'live'),
    queryFn: () => getLiveChatRooms(LIVE_CHAT_ROOMS_PAGE),
    staleTime: StaleTime.Default,
    refetchInterval: LIVE_CHAT_ROOM_REFRESH_MS,
  });
