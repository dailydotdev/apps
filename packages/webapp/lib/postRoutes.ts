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

/**
 * A post permalink or one of its sub-routes (`/share`, `/edit`, `/analytics`),
 * matched against a URL — query string and hash included. The post page keeps
 * client-side navigation to these while ads are live, because they re-enter
 * the same ad-carrying route; the reserved slugs above are list pages with no
 * slots, so navigating to them has to tear the ad globals down.
 */
export const isPostDetailPath = (url: string): boolean => {
  const match = /^\/posts\/([^/?#]+)(?:[/?#]|$)/.exec(url);
  return !!match && !RESERVED_POST_SLUGS.includes(match[1]);
};

/**
 * The post page itself, matched against a pathname: one segment, no
 * sub-route, no `.md` suffix.
 */
export const isPostPermalinkPath = (pathname: string): boolean => {
  const match = /^\/posts\/([^/?#]+)$/.exec(pathname);
  return (
    !!match &&
    !match[1].endsWith('.md') &&
    !RESERVED_POST_SLUGS.includes(match[1])
  );
};
