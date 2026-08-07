import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { acceptsMarkdown } from './lib/contentNegotiation';
import { resolveLayoutV2 } from './lib/layoutVariantMiddleware';
import { POST_MARKDOWN_PATH, RESERVED_POST_SLUGS } from './lib/markdownRoutes';

const POSTS_PREFIX = '/posts/';
const LAYOUT_V2_POSTS_PREFIX = '/layout-v2/posts/';

export const config = {
  matcher: '/posts/:id',
};

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;
  const id = pathname.slice(POSTS_PREFIX.length);

  // `.md` URLs are handled by the beforeFiles rewrite, which runs after
  // middleware. Rewriting here too would pass the id along with its suffix.
  if (!id || id.endsWith('.md') || RESERVED_POST_SLUGS.includes(id)) {
    return NextResponse.next();
  }

  if (!acceptsMarkdown(req.headers.get('accept'))) {
    if (!(await resolveLayoutV2(req))) {
      return NextResponse.next();
    }

    const url = req.nextUrl.clone();
    url.pathname = `${LAYOUT_V2_POSTS_PREFIX}${id}`;

    return NextResponse.rewrite(url);
  }

  const url = req.nextUrl.clone();
  url.pathname = `${POST_MARKDOWN_PATH}/${id}`;

  return NextResponse.rewrite(url);
}
