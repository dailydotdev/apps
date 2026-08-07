import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { acceptsMarkdown } from './lib/contentNegotiation';
import {
  isLayoutV2EligiblePath,
  resolveLayoutV2,
} from './lib/layoutVariantMiddleware';
import { POST_MARKDOWN_PATH, RESERVED_POST_SLUGS } from './lib/markdownRoutes';

const POSTS_PREFIX = '/posts/';
const LAYOUT_V2_PREFIX = '/layout-v2';

export const config = {
  matcher: [
    '/posts/:path*',
    '/tags/:path*',
    '/sources/:path*',
    '/gear',
    '/jobs/:path*',
    '/standups/:path*',
    '/squads/:path*',
    '/giveback',
    '/hackathon',
    '/quiz/:path*',
    '/:userId',
    '/:userId/:section',
  ],
};

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;
  const postId = pathname.startsWith(POSTS_PREFIX)
    ? pathname.slice(POSTS_PREFIX.length)
    : undefined;

  // `.md` URLs are handled by the beforeFiles rewrite, which runs after
  // middleware. Rewriting here too would pass the id along with its suffix.
  const isPostPage =
    !!postId &&
    !postId.includes('/') &&
    !postId.endsWith('.md') &&
    !RESERVED_POST_SLUGS.includes(postId);

  if (postId && !postId.includes('/') && !isPostPage && postId !== 'best-of') {
    return NextResponse.next();
  }

  if (isPostPage && acceptsMarkdown(req.headers.get('accept'))) {
    const url = req.nextUrl.clone();
    url.pathname = `${POST_MARKDOWN_PATH}/${postId}`;

    return NextResponse.rewrite(url);
  }

  if (!isLayoutV2EligiblePath(pathname) || !(await resolveLayoutV2(req))) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = `${LAYOUT_V2_PREFIX}${pathname}`;
  return NextResponse.rewrite(url);
}
