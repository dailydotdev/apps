import type { Post } from '../../graphql/posts';

// Where you are, as far as Patchy's menu cares: what he can offer depends on
// it. Pure, from the URL and the post you have open.
export type PatchyContext =
  | { kind: 'post'; post: Partial<Post>; tag?: string }
  | { kind: 'forYou' }
  | { kind: 'feed' }
  | { kind: 'tag'; tag: string }
  | { kind: 'source'; source: string }
  | { kind: 'bookmarks' }
  | { kind: 'search'; query?: string }
  | { kind: 'other' };

const FEED_PATHS = ['/popular', '/upvoted', '/posts', '/following', '/feeds'];

const firstValue = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

interface PatchyContextInput {
  // The route path without the query, e.g. /tags/rust.
  path: string;
  query: Record<string, string | string[] | undefined>;
  // The post you have open (modal or page), if any.
  post?: Partial<Post> | null;
}

export const getPatchyContext = ({
  path,
  query,
  post,
}: PatchyContextInput): PatchyContext => {
  // A post modal opens over any page, so the post wins.
  if (post?.id) {
    return { kind: 'post', post, tag: post.tags?.[0] };
  }
  const [, first, second, third] = path.split('?')[0].split('/');
  if (!first || first === 'my-feed') {
    return { kind: 'forYou' };
  }
  if (first === 'tags' && second) {
    return { kind: 'tag', tag: decodeURIComponent(second).toLowerCase() };
  }
  if (first === 'sources' && second) {
    return { kind: 'source', source: decodeURIComponent(second) };
  }
  if (first === 'bookmarks') {
    return { kind: 'bookmarks' };
  }
  if (first === 'search') {
    return { kind: 'search', query: firstValue(query.q)?.trim() || undefined };
  }
  // /posts/best-of and friends are lists of posts too; /posts/<id> without
  // an open post (still loading) falls back to a feed.
  if (FEED_PATHS.includes(`/${first}`) && third === undefined) {
    return { kind: 'feed' };
  }
  return { kind: 'other' };
};

// The line under his face in the Streak panel.
export const getPatchyContextLine = (context: PatchyContext): string | null => {
  switch (context.kind) {
    case 'post':
      return context.tag
        ? `Reading about #${context.tag}? Here’s what I can do.`
        : 'Reading something good? Here’s what I can do.';
    case 'forYou':
      return 'Your feed, your rules. Need a hand?';
    case 'tag':
      return `Looking at #${context.tag}.`;
    case 'source':
      return 'Checking out a source.';
    case 'bookmarks':
      return 'Your read-it-later pile. I can pick one.';
    case 'search':
      return context.query
        ? `Looking for “${context.query}”?`
        : 'Looking for something?';
    default:
      return null;
  }
};
