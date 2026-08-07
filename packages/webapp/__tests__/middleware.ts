/** @jest-environment node */

import { NextRequest } from 'next/server';
import { middleware } from '../middleware';
import { resolveLayoutV2 } from '../lib/layoutVariantMiddleware';

jest.mock('../lib/layoutVariantMiddleware', () => ({
  resolveLayoutV2: jest.fn(),
}));

const createRequest = (accept = 'text/html'): NextRequest =>
  new NextRequest('https://app.daily.dev/posts/test-post?ref=test', {
    headers: { accept },
  });

describe('post middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(resolveLayoutV2).mockResolvedValue(false);
  });

  it('rewrites enabled HTML requests to the layout v2 post page', async () => {
    jest.mocked(resolveLayoutV2).mockResolvedValue(true);

    const response = await middleware(createRequest());

    expect(response.headers.get('x-middleware-rewrite')).toBe(
      'https://app.daily.dev/layout-v2/posts/test-post?ref=test',
    );
  });

  it('keeps disabled HTML requests on the original post page', async () => {
    const response = await middleware(createRequest());

    expect(response.headers.get('x-middleware-next')).toBe('1');
  });

  it('keeps markdown negotiation ahead of layout resolution', async () => {
    const response = await middleware(createRequest('text/markdown'));

    expect(response.headers.get('x-middleware-rewrite')).toBe(
      'https://app.daily.dev/api/md/posts/test-post?ref=test',
    );
    expect(resolveLayoutV2).not.toHaveBeenCalled();
  });
});
