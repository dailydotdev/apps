/**
 * Shared route mappings for markdown versions of pages.
 *
 * These routes are used in next.config.ts rewrites to map .md URLs
 * (e.g., /sources.md → /api/md/sources), enabling explicit markdown access
 * for AI agents without Accept-header content negotiation.
 */

export const MARKDOWN_ROUTES: Record<string, string> = {
  '/agents/arena': '/api/md/agents-arena',
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
