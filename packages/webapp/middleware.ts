import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { MARKDOWN_ROUTES } from './lib/markdownRoutes';

/**
 * Middleware for HTTP content negotiation (llms.txt spec).
 *
 * This middleware enables AI agents to request markdown by sending
 * `Accept: text/markdown` header to regular page URLs.
 *
 * Example: GET /sources with Accept: text/markdown → returns markdown
 *
 * Note: This is separate from the .md URL rewrites in next.config.ts which
 * handle direct URL access (e.g., /sources.md). Both approaches are valid
 * per the llms.txt specification and serve different use cases:
 * - .md URLs: Direct link sharing, bookmarking
 * - Accept header: Programmatic content negotiation by AI agents
 */

export function middleware(request: NextRequest): NextResponse {
  const acceptHeader = request.headers.get('accept') || '';

  // Check if the client explicitly prefers markdown over HTML
  // Don't rewrite if the client also accepts text/html (browser-like behavior)
  const prefersMarkdown =
    acceptHeader.includes('text/markdown') &&
    !acceptHeader.includes('text/html');

  if (prefersMarkdown) {
    const { pathname } = request.nextUrl;
    const markdownRoute = MARKDOWN_ROUTES[pathname];

    if (markdownRoute) {
      // Rewrite to the markdown API route
      const url = request.nextUrl.clone();
      url.pathname = markdownRoute;
      return NextResponse.rewrite(url);
    }
  }

  // Continue with normal request
  return NextResponse.next();
}

export const config = {
  matcher: ['/sources', '/tags', '/squads/discover'],
};
