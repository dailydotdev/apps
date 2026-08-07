/** @jest-environment node */

import { NextRequest } from 'next/server';
import { getServerFeatureValue } from '@dailydotdev/shared/src/lib/serverFeatureValue';
import { featureLayoutV2 } from '@dailydotdev/shared/src/lib/serverFeatures';
import {
  isDesktopRequest,
  isLayoutV2EligiblePath,
  resolveLayoutV2,
} from '../lib/layoutVariantMiddleware';

jest.mock('@dailydotdev/shared/src/lib/serverFeatureValue', () => ({
  getServerFeatureValue: jest.fn(),
}));

const createRequest = ({
  cookie = 'da2=tracking-id; __Secure-dast=session',
  mobile,
  userAgent,
}: {
  cookie?: string;
  mobile?: string;
  userAgent?: string;
} = {}): NextRequest =>
  new NextRequest('https://app.daily.dev/posts/test-post', {
    headers: {
      cookie,
      ...(mobile && { 'sec-ch-ua-mobile': mobile }),
      ...(userAgent && { 'user-agent': userAgent }),
    },
  });

describe('layout variant middleware resolver', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getServerFeatureValue).mockResolvedValue(false);
  });

  it.each([
    '/kramer',
    '/kramer/work',
    '/posts/best-of',
    '/posts/best-of/2025/8',
    '/tags/javascript/best-of/2025',
    '/sources/thenewstack/best-of',
    '/gear',
    '/jobs/test-job',
    '/standups/test-standup',
    '/squads/test-squad',
    '/squads/discover/featured-category',
    '/quiz/ai-fluency',
  ])('recognizes the v2 route %s', (pathname) => {
    expect(isLayoutV2EligiblePath(pathname)).toBe(true);
  });

  it.each([
    '/popular',
    '/favicon.ico',
    '/settings',
    '/kramer/unknown-section',
    '/posts/latest',
    '/posts/test.md',
    '/squads/new',
    '/tags/javascript',
  ])('leaves the non-v2 route %s unchanged', (pathname) => {
    expect(isLayoutV2EligiblePath(pathname)).toBe(false);
  });

  it('uses the tracking id for the same allocation attributes as the client', async () => {
    jest.mocked(getServerFeatureValue).mockResolvedValue(true);

    await expect(resolveLayoutV2(createRequest())).resolves.toBe(true);
    expect(getServerFeatureValue).toHaveBeenCalledWith(
      expect.objectContaining({
        attributes: expect.objectContaining({
          deviceId: 'tracking-id',
          loggedIn: true,
          userId: 'tracking-id',
        }),
        feature: featureLayoutV2,
      }),
    );
  });

  it('fails closed without a tracking id', async () => {
    await expect(resolveLayoutV2(createRequest({ cookie: '' }))).resolves.toBe(
      false,
    );
    expect(getServerFeatureValue).not.toHaveBeenCalled();
  });

  it('does not allocate the desktop-only layout to mobile requests', async () => {
    const request = createRequest({ mobile: '?1' });

    expect(isDesktopRequest(request)).toBe(false);
    await expect(resolveLayoutV2(request)).resolves.toBe(false);
    expect(getServerFeatureValue).not.toHaveBeenCalled();
  });
});
