/**
 * Shared route mappings for markdown versions of pages.
 *
 * These routes are used in next.config.ts rewrites to map .md URLs
 * (e.g., /sources.md → /api/md/sources), giving agents that cannot set an
 * Accept header an explicit markdown URL. Header-based negotiation for post
 * pages lives in middleware.ts.
 */

export const MARKDOWN_ROUTES: Record<string, string> = {
  '/sources': '/api/md/sources',
  '/tags': '/api/md/tags',
  '/squads/discover': '/api/md/squads',
  '/deals': '/api/md/deals',
} as const;

export const POST_MARKDOWN_PATH = '/api/md/posts';

export const DEAL_MARKDOWN_PATH = '/api/md/deals';

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
 * Get the .md URL rewrite source patterns for next.config.ts
 */
export const getMarkdownRewrites = (): Array<{
  source: string;
  destination: string;
}> => [
  ...Object.entries(MARKDOWN_ROUTES).map(([path, destination]) => ({
    source: `${path}.md`,
    destination,
  })),
  {
    source: '/posts/:id.md',
    destination: `${POST_MARKDOWN_PATH}/:id`,
  },
  {
    source: '/deals/:slug.md',
    destination: `${DEAL_MARKDOWN_PATH}/:slug`,
  },
];
