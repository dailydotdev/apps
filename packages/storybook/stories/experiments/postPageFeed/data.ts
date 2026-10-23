import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
import postPages from '../../history/postPages.json';

// The posts the review is built from: real public posts as POST_BY_ID_QUERY
// returned them from api.daily.dev (the History review's set). The page's
// post is one of them, and the feed under it is the rest, ranked against it:
// shared tags first, then the same source, then the most discussed. (In
// production For you is the reader's own home feed; this stands in for it.)

const all = Object.values(postPages as unknown as Record<string, Post>);

export const posts: Post[] = all;

export const postById = (id: string): Post | undefined =>
  all.find((post) => post.id === id);

/** The post the review opens on: an article with a cover and tags. */
export const DEFAULT_POST_ID = 'mGfmauFls';

export type Reason =
  | { kind: 'tag'; tag: string }
  | { kind: 'source'; name: string }
  | { kind: 'discussed' }
  | { kind: 'feed' };

export interface Ranked {
  post: Post;
  reason: Reason;
  score: number;
}

const discussion = (post: Post): number =>
  (post.numComments ?? 0) * 3 + (post.numUpvotes ?? 0);

/** Types a feed card exists for; briefs and digests never reach a feed. */
const feedable = (post: Post): boolean =>
  ![PostType.Brief, PostType.Digest].includes(post.type);

/** Every other post, best match for `host` first, each with why it is here. */
export const rankFor = (host: Post): Ranked[] => {
  const hostTags = new Set(host.tags ?? []);
  const maxDiscussion = Math.max(1, ...all.map(discussion));
  return all
    .filter((post) => post.id !== host.id && feedable(post))
    .map((post): Ranked => {
      const shared = (post.tags ?? []).filter((tag) => hostTags.has(tag));
      const sameSource = post.source?.id === host.source?.id;
      const score =
        shared.length * 10 +
        (sameSource ? 6 : 0) +
        (discussion(post) / maxDiscussion) * 5;
      let reason: Reason = { kind: 'feed' };
      if (shared.length) {
        reason = { kind: 'tag', tag: shared[0] };
      } else if (sameSource) {
        reason = { kind: 'source', name: post.source?.name ?? '' };
      } else if (discussion(post) / maxDiscussion > 0.3) {
        reason = { kind: 'discussed' };
      }
      return { post, reason, score };
    })
    .sort((a, b) => b.score - a.score);
};
