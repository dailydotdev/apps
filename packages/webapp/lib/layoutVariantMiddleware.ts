import type { NextRequest } from 'next/server';
import { getServerFeatureValue } from '@dailydotdev/shared/src/lib/serverFeatureValue';
import { featureLayoutV2 } from '@dailydotdev/shared/src/lib/serverFeatures';

const TRACKING_COOKIE = 'da2';
const AUTH_SESSION_COOKIES = ['__Secure-dast', 'dast'];
const MOBILE_USER_AGENT =
  /Android|iPhone|iPad|iPod|IEMobile|Opera Mini|Mobile/i;

export const isDesktopRequest = (req: NextRequest): boolean => {
  const clientHint = req.headers.get('sec-ch-ua-mobile');

  if (clientHint === '?1') {
    return false;
  }

  return !MOBILE_USER_AGENT.test(req.headers.get('user-agent') ?? '');
};

export const resolveLayoutV2 = async (req: NextRequest): Promise<boolean> => {
  const identifier = req.cookies.get(TRACKING_COOKIE)?.value;

  // The client only evaluates layout v2 on laptop+. Missing hints can produce
  // false positives, so recognizable mobile requests stay on the v1 route.
  if (!identifier || !isDesktopRequest(req)) {
    return false;
  }

  return getServerFeatureValue({
    attributes: {
      deviceId: identifier,
      loggedIn: AUTH_SESSION_COOKIES.some((cookie) => req.cookies.has(cookie)),
      mobile: false,
      platform: 'webapp',
      url: req.url,
      userId: identifier,
      version: process.env.CURRENT_VERSION,
    },
    clientKey: process.env.GROWTHBOOK_CLIENT_KEY,
    feature: featureLayoutV2,
  });
};
