/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { LAYOUT_VARIANT_COOKIE } from '@dailydotdev/shared/src/lib/layoutVariant';
import { getLayoutVariantResponse } from '../proxy';

jest.mock('../lib/serverPageRequestLog', () => ({
  logServerPageRequest: jest.fn(),
}));
jest.mock('../lib/agentMarkdownAccess', () => ({
  evaluateAgentSignupWall: jest.fn(),
  getAgentSignupRequiredBody: jest.fn(),
  hasValidAgentMarkdownToken: jest.fn(),
  trackAgentSignupWallAllocation: jest.fn(),
}));

const request = (
  pathname: string,
  { cookie = 'v2', isData = false }: { cookie?: string; isData?: boolean } = {},
): NextRequest =>
  new NextRequest(`https://app.daily.dev${pathname}`, {
    headers: {
      cookie: `${LAYOUT_VARIANT_COOKIE}=${cookie}`,
      ...(isData && { 'x-nextjs-data': '1' }),
    },
  });

const rewrittenTo = (req: NextRequest): string | undefined =>
  getLayoutVariantResponse(req)?.headers.get('x-middleware-rewrite') ??
  undefined;

describe('getLayoutVariantResponse', () => {
  it('serves the mirror to a recorded v2 session', () => {
    expect(rewrittenTo(request('/posts/abc123'))).toBe(
      'https://app.daily.dev/layout-v2/posts/abc123',
    );
  });

  // Next normalises a data request's pathname to the page path, so without
  // the header check a soft navigation would be answered with the mirror's
  // route and move the client onto a route it never asked for.
  it('leaves a soft navigation alone', () => {
    expect(rewrittenTo(request('/posts/abc123', { isData: true }))).toBe(
      undefined,
    );
  });

  it('leaves a session without the cookie alone', () => {
    expect(rewrittenTo(request('/posts/abc123', { cookie: 'v1' }))).toBe(
      undefined,
    );
  });

  it('leaves a reserved post feed page alone', () => {
    expect(rewrittenTo(request('/posts/best-of'))).toBe(undefined);
  });
});
