// "17h", "45m", "1m": how long a room has, as its header says it.
export const formatTimeLeft = (
  expiresAt: string,
  now: number = Date.now(),
): string => {
  const left = new Date(expiresAt).getTime() - now;
  if (left <= 0) {
    return '0m';
  }
  const minutes = Math.ceil(left / (60 * 1000));
  if (minutes < 60) {
    return `${minutes}m`;
  }

  return `${Math.round(minutes / 60)}h`;
};

// Fewer people than this is not a crowd worth announcing; the count stays
// off until it works for the room.
export const LIVE_CHAT_COUNT_FROM = 10;

// "23 here", or nothing for a room still filling up.
export const formatOccupants = (count?: number | null): string | undefined =>
  count != null && count >= LIVE_CHAT_COUNT_FROM ? `${count} here` : undefined;

// A far-off end is no reason to hurry; the clock shows once it is one.
export const LIVE_CHAT_ENDS_SOON_MS = 60 * 60 * 1000;

// "ends in 45m", or nothing while the room has hours ahead of it.
export const formatEndsIn = (
  expiresAt?: string | null,
  now: number = Date.now(),
): string | undefined => {
  if (!expiresAt) {
    return undefined;
  }
  const left = new Date(expiresAt).getTime() - now;
  if (left > LIVE_CHAT_ENDS_SOON_MS) {
    return undefined;
  }

  return `ends in ${formatTimeLeft(expiresAt, now)}`;
};
