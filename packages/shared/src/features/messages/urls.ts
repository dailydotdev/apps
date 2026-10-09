import { webappUrl } from '../../lib/constants';

// Where a messages link was opened from. Logged with the open events, then
// dropped from the URL so a reload or a shared link doesn't count it again.
// Sidebar rows stay without one: a row dragged into the dock saves its path.
export enum DmOrigin {
  Profile = 'profile',
  UserCard = 'user card',
  Comment = 'comment',
  NewMessage = 'new message',
  Inbox = 'inbox',
  Requests = 'requests',
  Header = 'header',
  YouPage = 'you page',
}

const dmOrigins = new Set<string>(Object.values(DmOrigin));

export const parseDmOrigin = (value: unknown): DmOrigin | undefined =>
  typeof value === 'string' && dmOrigins.has(value)
    ? (value as DmOrigin)
    : undefined;

export const getMessagesUrl = (
  peerId?: string,
  {
    commentId,
    requests,
    origin,
  }: { commentId?: string; requests?: boolean; origin?: DmOrigin } = {},
): string => {
  const path = `${webappUrl}messages${peerId ? `/${peerId}` : ''}`;
  const params = new URLSearchParams();

  if (requests) {
    params.set('tab', 'requests');
  }

  if (commentId) {
    params.set('comment', commentId);
  }

  if (origin) {
    params.set('origin', origin);
  }

  const query = params.toString();

  return query ? `${path}?${query}` : path;
};
