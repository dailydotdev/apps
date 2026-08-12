import type { NextRequest } from 'next/server';
import { after, NextResponse } from 'next/server';
import { acceptsMarkdown } from './lib/contentNegotiation';
import { POST_MARKDOWN_PATH, RESERVED_POST_SLUGS } from './lib/markdownRoutes';
import {
  getAgentSignupRequiredBody,
  hasValidAgentMarkdownToken,
  evaluateAgentSignupWall,
  trackAgentSignupWallAllocation,
} from './lib/agentMarkdownAccess';

const POSTS_PREFIX = '/posts/';
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
    '/posts/:id',
    '/sources.md',
    '/tags.md',
    '/squads/discover.md',
    '/api/md/:path*',
  ],
};

const getMarkdownResponse = (req: NextRequest): NextResponse => {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith(POSTS_PREFIX)) {
    return NextResponse.next();
  }

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

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;
  const isMarkdownRequest =
    pathname.startsWith('/api/md/') ||
    pathname.endsWith('.md') ||
    (pathname.startsWith(POSTS_PREFIX) &&
      acceptsMarkdown(req.headers.get('accept')));

  if (isMarkdownRequest) {
    return handleMarkdownRequest(req);
  }

  return NextResponse.next();
}
