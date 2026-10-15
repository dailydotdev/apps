import type { LfgPost } from '../types';
import { LfgPostStatus, LfgReachOutStatus } from '../types';

type StatusPost = Pick<
  LfgPost,
  'status' | 'isPaused' | 'pendingCount' | 'myReachOut'
> & { author: Pick<LfgPost['author'], 'id'> };

// The expiry cron can lag behind a post's expiresAt, so a lapsed post still
// reads as open until it runs.
export const withLapsedLfgStatus = <
  T extends Pick<LfgPost, 'status' | 'expiresAt'>,
>(
  post: T,
  now = new Date(),
): T =>
  post.status === LfgPostStatus.Open &&
  new Date(post.expiresAt).getTime() <= now.getTime()
    ? { ...post, status: LfgPostStatus.Expired }
    : post;

export const isLfgPostAuthor = (
  post: Pick<LfgPost, 'author'>,
  viewerId?: string,
): boolean => !!viewerId && post.author.id === viewerId;

export const canReachOutToLfgPost = (
  post: StatusPost,
  viewerId: string | undefined,
  isLaunched: boolean,
): boolean =>
  isLaunched &&
  !!viewerId &&
  post.author.id !== viewerId &&
  post.status === LfgPostStatus.Open &&
  !post.myReachOut &&
  !post.isPaused;

// The short state a board row leads with; nothing when the reader can
// simply reach out.
export const getLfgRowStatus = (
  post: StatusPost,
  viewerId: string | undefined,
  isLaunched: boolean,
): string | undefined => {
  const isMine = post.author.id === viewerId;

  if (!isLaunched) {
    return isMine ? 'Your post · goes live soon' : 'Opening soon';
  }

  if (isMine) {
    return post.pendingCount
      ? `Your post · ${post.pendingCount} waiting`
      : 'Your post';
  }

  if (post.myReachOut?.status === LfgReachOutStatus.Accepted) {
    return 'Accepted';
  }

  if (post.myReachOut) {
    return 'Requested';
  }

  if (post.isPaused) {
    return 'Paused';
  }

  return undefined;
};
