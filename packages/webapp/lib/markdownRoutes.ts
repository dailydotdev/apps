/**
 * Shared route mappings for markdown versions of pages.
 *
 * These routes are used in next.config.ts for:
 * 1. Rewrites: Maps .md URLs (e.g., /sources.md → /api/md/sources)
 *    This allows direct access via URL like https://app.daily.dev/sources.md
 *
 * 2. Redirects: Content negotiation for Accept: text/markdown header
 *    When clients send Accept: text/markdown (without text/html), they get
 *    redirected to the markdown API endpoint.
 *
 * Both approaches follow the llms.txt specification for AI agent discoverability.
 */

export const MARKDOWN_ROUTES: Record<string, string> = {
  '/sources': '/api/md/sources',
  '/tags': '/api/md/tags',
  '/squads/discover': '/api/md/squads',
} as const;

/**
 * Get the .md URL rewrite source patterns for next.config.ts
 */
export const getMarkdownRewrites = (): Array<{
  source: string;
  destination: string;
}> => {
  return Object.entries(MARKDOWN_ROUTES).map(([path, destination]) => ({
    source: `${path}.md`,
    destination,
  }));
};
