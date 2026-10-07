import { webappUrl } from '../../lib/constants';

export const getMessagesUrl = (
  peerId?: string,
  { commentId, requests }: { commentId?: string; requests?: boolean } = {},
): string => {
  const path = `${webappUrl}messages${peerId ? `/${peerId}` : ''}`;
  const params = new URLSearchParams();

  if (requests) {
    params.set('tab', 'requests');
  }

  if (commentId) {
    params.set('comment', commentId);
  }

  const query = params.toString();

  return query ? `${path}?${query}` : path;
};
