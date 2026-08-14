import type { NextRequest } from 'next/server';
import { after, NextResponse } from 'next/server';
import { acceptsMarkdown } from './lib/contentNegotiation';
import {
  MARKDOWN_ROUTES,
  POST_MARKDOWN_PATH,
  RESERVED_POST_SLUGS,
} from './lib/markdownRoutes';
import {
  getAgentSignupRequiredBody,
  hasValidAgentMarkdownToken,
  evaluateAgentSignupWall,
  trackAgentSignupWallAllocation,
} from './lib/agentMarkdownAccess';
import { logServerPageRequest } from './lib/serverPageRequestLog';

const POSTS_PREFIX = '/posts/';
const MARKDOWN_PAGE_PATHS = Object.keys(MARKDOWN_ROUTES).map(
  (path) => `${path}.md`,
);
const TRACKING_ID_ALPHABET =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const TRACKING_ID_LENGTH = 21;

const generateTrackingId = (): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(TRACKING_ID_LENGTH));
  return Array.from(
    bytes,
    (byte) => TRACKING_ID_ALPHABET[byte % TRACKING_ID_ALPHABET.length],
  ).join('');
};

export const config = {
  matcher: [
    // markdown routes live under `/api`, which the pattern below skips
    '/api/md/:path*',
    // every other request, minus:
    // - `api`: JSON endpoints, never documents
    // - `_next/static`, `_next/image`: build output and the image optimizer
    // - trailing extensions: `public/` assets (icons, fonts, sw.js, robots, sitemap)
    // All three have to stay in one pattern: matcher entries are OR'd, so a
    // separate entry per group would re-admit what the others skip.
    '/((?!api|_next/static|_next/image|.*\\.(?:avif|css|eot|gif|ico|jpe?g|js|json|map|mp4|otf|png|svg|ttf|txt|wasm|webm|webp|woff2?|xml)$).*)',
  ],
};

const getMarkdownResponse = (req: NextRequest): NextResponse => {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith(POSTS_PREFIX)) {
    return NextResponse.next();
  }

  const id = pathname.slice(POSTS_PREFIX.length);

  // `.md` URLs are handled by the beforeFiles rewrite, which runs after
  // proxy. Rewriting here too would pass the id along with its suffix.
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
};

const handleMarkdownRequest = async (
  req: NextRequest,
): Promise<NextResponse> => {
  const deviceId = req.cookies.get('da2')?.value ?? generateTrackingId();
  const wall = await evaluateAgentSignupWall(deviceId);
  const { allocation } = wall;
  if (allocation) {
    after(async () => {
      await trackAgentSignupWallAllocation(deviceId, allocation);
    });
  }
  if (!wall.enabled) {
    return getMarkdownResponse(req);
  }

  const hasToken = await hasValidAgentMarkdownToken(
    req.headers.get('authorization'),
  );
  if (hasToken) {
    return getMarkdownResponse(req);
  }

  return new NextResponse(getAgentSignupRequiredBody(), {
    status: 401,
    headers: {
      'cache-control': 'private, no-store',
      'content-type': 'text/markdown; charset=utf-8',
    },
  });
};

const isMarkdownRequest = (req: NextRequest): boolean => {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith('/api/md/') ||
    MARKDOWN_PAGE_PATHS.includes(pathname)
  ) {
    return true;
  }

  if (!pathname.startsWith(POSTS_PREFIX)) {
    return false;
  }

  const id = pathname.slice(POSTS_PREFIX.length);

  return (
    !!id &&
    !id.includes('/') &&
    (id.endsWith('.md') || acceptsMarkdown(req.headers.get('accept')))
  );
};

export async function proxy(req: NextRequest): Promise<NextResponse> {
  const isMarkdown = isMarkdownRequest(req);

  after(async () => {
    await logServerPageRequest(req, isMarkdown ? 'markdown' : 'html');
  });

  if (isMarkdown) {
    return handleMarkdownRequest(req);
  }

  return NextResponse.next();
}
