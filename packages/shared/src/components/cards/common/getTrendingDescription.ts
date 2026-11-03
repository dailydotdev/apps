import { LIVE_CHAT_COUNT_FROM } from '../../../features/liveChat/timeLeft';

export const HOT_DESCRIPTION_THRESHOLD = 30;

export const getTrendingDescription = (
  trending?: number,
): string | undefined => {
  if (!trending || trending <= 0) {
    return undefined;
  }
  if (trending >= HOT_DESCRIPTION_THRESHOLD) {
    return `${trending} devs read it last hour`;
  }
  return 'Trending now';
};

// The live label's own line: how many are in the chat right now, readers
// following along included (they hold seats too). A small number works
// against the room, so it only shows once it is a crowd.
export const getLiveChatDescription = (
  occupantCount?: number | null,
): string | undefined => {
  if (occupantCount == null || occupantCount < LIVE_CHAT_COUNT_FROM) {
    return undefined;
  }

  return `${occupantCount} in the chat`;
};
