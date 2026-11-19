import { webappUrl } from '../../lib/constants';
import type { ChatRoom } from './graphql';
import { ChatRoomType } from './graphql';

// A "Join" row outside the post page links to the post with this on it, so
// landing there seats the viewer and joins in one go instead of asking again.
export const LIVE_CHAT_JOIN_PARAM = 'chat';
export const LIVE_CHAT_JOIN_VALUE = 'join';

export const withJoinIntent = (href: string): string => {
  try {
    const url = new URL(href);
    url.searchParams.set(LIVE_CHAT_JOIN_PARAM, LIVE_CHAT_JOIN_VALUE);
    return url.toString();
  } catch {
    const separator = href.includes('?') ? '&' : '?';
    return `${href}${separator}${LIVE_CHAT_JOIN_PARAM}=${LIVE_CHAT_JOIN_VALUE}`;
  }
};

// The chat page of a topic room; a post room lives on its post.
export const getChatRoomPath = (roomId: string): string => `/chat/${roomId}`;

// Where a row about the room sends the reader: a topic room to its own page,
// a post room to the post, joining on landing. Undefined for a post room
// whose post is not known, which has nowhere to go.
export const getChatRoomHref = (
  room: Pick<ChatRoom, 'id' | 'type'> & {
    post?: { commentsPermalink?: string } | null;
  },
): string | undefined => {
  if (room.type === ChatRoomType.Topic) {
    return `${webappUrl}${getChatRoomPath(room.id).slice(1)}`;
  }

  return room.post?.commentsPermalink
    ? withJoinIntent(room.post.commentsPermalink)
    : undefined;
};

// Where the daily.dev team opens a chat on a topic. Absolute, like the
// room links, since the widget renders in the extension too.
export const getNewChatHref = (): string => `${webappUrl}chat/new`;
