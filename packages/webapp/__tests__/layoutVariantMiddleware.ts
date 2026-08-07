/** @jest-environment node */

import { NextRequest } from 'next/server';
import { getServerFeatureValue } from '@dailydotdev/shared/src/lib/serverFeatureValue';
import {
  isDesktopRequest,
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
        feature: expect.objectContaining({
          defaultValue: true,
          id: 'layout_v2',
        }),
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
