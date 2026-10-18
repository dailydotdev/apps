/**
 * Single-segment `/posts/<x>` routes that are feed pages rather than posts.
 * Mirrors the non-dynamic files in pages/posts/.
 */
export const RESERVED_POST_SLUGS = [
  'best-of',
  'discussed',
  'latest',
  'upvoted',
];

/** The post page itself: one segment, no sub-route, no `.md` suffix. */
export const isPostPermalinkPath = (pathname: string): boolean => {
  const match = /^\/posts\/([^/?#]+)$/.exec(pathname);
  return (
    !!match &&
    !match[1].endsWith('.md') &&
    !RESERVED_POST_SLUGS.includes(match[1])
  );
};
