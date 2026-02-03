import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * Middleware for content negotiation.
 * When a request includes `Accept: text/markdown` header,
 * rewrite to the corresponding markdown API route.
 */

const MARKDOWN_ROUTES: Record<string, string> = {
  '/sources': '/api/md/sources',
  '/tags': '/api/md/tags',
  '/squads/discover': '/api/md/squads',
};

export function middleware(request: NextRequest): NextResponse {
  const acceptHeader = request.headers.get('accept') || '';

  // Check if the client explicitly accepts markdown
  if (acceptHeader.includes('text/markdown')) {
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
