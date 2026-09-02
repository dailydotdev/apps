import { RESERVED_POST_SLUGS } from './markdownRoutes';

const POSTS_PREFIX = '/posts/';

// Written by the client once the layout experiment has resolved (see
// `useLayoutVariantCookie`), so the proxy can pick the shell without an
// edge GrowthBook round trip — and without having to re-derive a bucket it
// cannot reproduce, since the client hashes on the logged-in user id while
// the edge only has the device cookie.
export const LAYOUT_VARIANT_COOKIE = 'dl_v';

// Only the post page is mirrored under `/layout-v2`. It is the prerendered
// page users hard-navigate to most, and every mirrored route doubles its
// ISR cache entries.
export const isLayoutVariantEligiblePath = (pathname: string): boolean => {
  if (!pathname.startsWith(POSTS_PREFIX)) {
    return false;
  }

  const id = pathname.slice(POSTS_PREFIX.length);

  return (
    !!id &&
    !id.includes('/') &&
    !id.endsWith('.md') &&
    !RESERVED_POST_SLUGS.includes(id)
  );
};
