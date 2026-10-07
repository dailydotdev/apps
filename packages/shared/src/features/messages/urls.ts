import { webappUrl } from '../../lib/constants';

export const getMessagesUrl = (
  peerId?: string,
  { commentId }: { commentId?: string } = {},
): string => {
  const path = `${webappUrl}messages${peerId ? `/${peerId}` : ''}`;

  return commentId ? `${path}?comment=${encodeURIComponent(commentId)}` : path;
};
