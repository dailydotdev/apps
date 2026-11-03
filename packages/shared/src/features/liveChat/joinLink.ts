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
