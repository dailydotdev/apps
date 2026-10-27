import { queryOptions } from '@tanstack/react-query';
import type { LoggedUser } from '../../lib/user';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import type { ChatRoom } from './graphql';
import { getLiveChatRooms, getPostChatRoom } from './graphql';

type QueryUser = Pick<LoggedUser, 'id'> | undefined;

// The API caches the occupant count for 15s, so asking more often than this
// only repeats the cached answer.
export const LIVE_CHAT_ROOM_REFRESH_MS = 30 * 1000;

// The API caps a page at 20; only trending posts get rooms, so one page is all of them.
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

export const liveChatRoomsQueryOptions = (user: QueryUser) =>
  queryOptions<ChatRoom[]>({
    queryKey: generateQueryKey(RequestKey.ChatRooms, user, 'live'),
    queryFn: () => getLiveChatRooms(LIVE_CHAT_ROOMS_PAGE),
    staleTime: StaleTime.Default,
    refetchInterval: LIVE_CHAT_ROOM_REFRESH_MS,
  });
