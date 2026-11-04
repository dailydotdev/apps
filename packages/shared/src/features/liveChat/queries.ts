import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import type { LoggedUser } from '../../lib/user';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import type { ChatRoom } from './graphql';
import {
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

// The API answers for at most this many users per call.
export const LIVE_CHAT_PRESENCE_MAX_USERS = 100;

// Which of the given users are in the room, polled like the room itself (the
// API caches the room's list for 15s). The previous answer stays up while a
// new sender changes the key, so dots don't blink.
export const chatRoomPresenceQueryOptions = (
  user: QueryUser,
  roomId: string | undefined,
  userIds: string[],
) =>
  queryOptions<string[] | null>({
    queryKey: generateQueryKey(
      RequestKey.ChatRooms,
      user,
      'presence',
      roomId,
      userIds.join(','),
    ),
    queryFn: () => getChatRoomPresence(roomId as string, userIds),
    staleTime: StaleTime.Default,
    refetchInterval: LIVE_CHAT_ROOM_REFRESH_MS,
    placeholderData: keepPreviousData,
    enabled: !!user && !!roomId && userIds.length > 0,
  });

export const liveChatRoomsQueryOptions = (user: QueryUser) =>
  queryOptions<ChatRoom[]>({
    queryKey: generateQueryKey(RequestKey.ChatRooms, user, 'live'),
    queryFn: () => getLiveChatRooms(LIVE_CHAT_ROOMS_PAGE),
    staleTime: StaleTime.Default,
    refetchInterval: LIVE_CHAT_ROOM_REFRESH_MS,
  });
