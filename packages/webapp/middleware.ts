import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { acceptsMarkdown } from './lib/contentNegotiation';
import { POST_MARKDOWN_PATH, RESERVED_POST_SLUGS } from './lib/markdownRoutes';

const POSTS_PREFIX = '/posts/';

export const config = {
  matcher: '/posts/:id',
};

export function middleware(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;
  const id = pathname.slice(POSTS_PREFIX.length);

  // `.md` URLs are handled by the beforeFiles rewrite, which runs after
  // middleware. Rewriting here too would pass the id along with its suffix.
  if (
    !id ||
    id.endsWith('.md') ||
    RESERVED_POST_SLUGS.includes(id) ||
    !acceptsMarkdown(req.headers.get('accept'))
  ) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = `${POST_MARKDOWN_PATH}/${id}`;

  return NextResponse.rewrite(url);
}
