import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
import postPages from '../../history/postPages.json';

// The posts every variation is built from: real public posts as
// POST_BY_ID_QUERY returned them from api.daily.dev (the History review's
// set). The page's post is one of them, and the feed under it is the rest,
// ranked against it the way a "more like this" query would: shared tags
// first, then the same source, then whatever is most discussed.

const all = Object.values(postPages as unknown as Record<string, Post>);

export const posts: Post[] = all;

export const postById = (id: string): Post | undefined =>
  all.find((post) => post.id === id);

/** The post every variation opens on: an article with a cover and tags. */
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

export const reasonCopy = (reason: Reason): string => {
  switch (reason.kind) {
    case 'tag':
      return `Also about #${reason.tag}`;
    case 'source':
      return `More from ${reason.name}`;
    case 'discussed':
      return 'Most discussed this week';
    default:
      return 'From your feed';
  }
};

/** Shelves: rows of posts that share one reason, in the order a reader cares. */
export interface Shelf {
  id: string;
  title: string;
  lead: string;
  posts: Post[];
}

export const shelvesFor = (host: Post): Shelf[] => {
  const ranked = rankFor(host);
  const used = new Set<string>();
  const take = (list: Post[], count = 10): Post[] => {
    const picked = list.filter((post) => !used.has(post.id)).slice(0, count);
    picked.forEach((post) => used.add(post.id));
    return picked;
  };
  const shelves: Shelf[] = [];
  (host.tags ?? []).slice(0, 2).forEach((tag) => {
    const list = take(
      ranked.filter(({ post }) => post.tags?.includes(tag)).map((r) => r.post),
    );
    if (list.length >= 3) {
      shelves.push({
        id: `tag-${tag}`,
        title: `More on #${tag}`,
        lead: 'Same topic as the post you just read',
        posts: list,
      });
    }
  });
  const fromSource = take(
    ranked
      .filter(({ post }) => post.source?.id === host.source?.id)
      .map((r) => r.post),
  );
  if (fromSource.length >= 3) {
    shelves.push({
      id: 'source',
      title: `More from ${host.source?.name}`,
      lead: 'The source you are reading',
      posts: fromSource,
    });
  }
  shelves.push({
    id: 'discussed',
    title: 'Developers are talking about',
    lead: 'The most discussed posts this week',
    posts: take(
      [...all]
        .filter((post) => post.id !== host.id && feedable(post))
        .sort((a, b) => (b.numComments ?? 0) - (a.numComments ?? 0))
        .map((post) => post),
    ),
  });
  const videos = take(
    all.filter(
      (post) => post.type === PostType.VideoYouTube && post.id !== host.id,
    ),
  );
  if (videos.length >= 3) {
    shelves.push({
      id: 'videos',
      title: 'Watch next',
      lead: 'Videos from your feed',
      posts: videos,
    });
  }
  shelves.push({
    id: 'feed',
    title: 'From your feed',
    lead: 'Everything else picked for you',
    posts: take(
      ranked.map((r) => r.post),
      12,
    ),
  });
  return shelves;
};

/** "1.7K", "23K": decimal only under ten, the feed's number rule. */
export const compact = (value = 0): string => {
  if (value < 1000) {
    return `${value}`;
  }
  const thousands = value / 1000;
  if (thousands < 10) {
    return `${Math.floor(thousands * 10) / 10}K`;
  }
  if (thousands < 1000) {
    return `${Math.floor(thousands)}K`;
  }
  return `${Math.floor(thousands / 100) / 10}M`;
};

/** Cover for a card: the post's, the shared post's, or nothing. */
export const coverOf = (post: Post): string | undefined =>
  post.image || post.sharedPost?.image || undefined;

export const titleOf = (post: Post): string =>
  post.title || post.sharedPost?.title || `Post by ${post.source?.name}`;
