/**
 * Shared route mappings for markdown versions of pages.
 *
 * These routes are used in two places:
 * 1. next.config.ts rewrites: Maps .md URLs (e.g., /sources.md → /api/md/sources)
 *    This allows direct access via URL like https://app.daily.dev/sources.md
 *
 * 2. middleware.ts: Content negotiation for Accept: text/markdown header
 *    This allows clients to request markdown by sending Accept: text/markdown
 *    to the regular URL (e.g., /sources with Accept: text/markdown → /api/md/sources)
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
