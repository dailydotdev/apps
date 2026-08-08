import type { NextRequest } from 'next/server';
import { getServerFeatureValue } from '@dailydotdev/shared/src/lib/serverFeatureValue';
import { featureLayoutV2 } from '@dailydotdev/shared/src/lib/serverFeatures';
import { RESERVED_POST_SLUGS } from './markdownRoutes';

const TRACKING_COOKIE = 'da2';
const AUTH_SESSION_COOKIES = ['__Secure-dast', 'dast'];
const MOBILE_USER_AGENT =
  /Android|iPhone|iPad|iPod|IEMobile|Opera Mini|Mobile/i;
const PROFILE_SECTIONS = new Set([
  'achievements',
  'certification',
  'education',
  'opensource',
  'posts',
  'project',
  'replies',
  'upvoted',
  'volunteering',
  'work',
]);
const RESERVED_PROFILE_SLUGS = new Set([
  '404',
  'activate',
  'agent',
  'agents',
  'analytics',
  'api',
  'backoffice',
  'bookmarks',
  'briefing',
  'callback',
  'cores',
  'daily',
  'daily-quests',
  'dev',
  'discussed',
  'embed',
  'error',
  'explore',
  'feed-by-ids',
  'feeds',
  'following',
  'game-center',
  'gear',
  'giveback',
  'hackathon',
  'helloworld',
  'highlights',
  'history',
  'image-generator',
  'isr',
  'jobs',
  'join',
  'layout-v2',
  'my-feed',
  'notifications',
  'onboarding',
  'pay',
  'plus',
  'popular',
  'popup',
  'posts',
  'quiz',
  'recruiter',
  'recruiter-spam-to-cores',
  'reset-password',
  'scheduled',
  'search',
  'settings',
  'sources',
  'squads',
  'standups',
  'tags',
  'team',
  'upvoted',
  'users',
  'verification',
  'wallet',
  'watercooler',
  'welcome',
  'world',
]);
const ARCHIVE_PATH =
  /^\/(?:posts|tags\/[^/]+|sources\/[^/]+)\/best-of(?:\/\d{4}(?:\/\d{1,2})?)?$/;
const PUBLIC_STATIC_PATHS = new Set([
  '/gear',
  '/giveback',
  '/hackathon',
  '/jobs',
  '/jobs/how-it-works',
  '/quiz/ai-fluency',
]);

export const isLayoutV2EligiblePath = (pathname: string): boolean => {
  if (PUBLIC_STATIC_PATHS.has(pathname) || ARCHIVE_PATH.test(pathname)) {
    return true;
  }

  const postId = pathname.match(/^\/posts\/([^/]+)$/)?.[1];
  if (
    (postId &&
      !postId.endsWith('.md') &&
      !RESERVED_POST_SLUGS.includes(postId)) ||
    /^\/jobs\/[^/]+$/.test(pathname) ||
    /^\/standups\/[^/]+$/.test(pathname) ||
    /^\/squads\/discover\/[^/]+$/.test(pathname)
  ) {
    return true;
  }

  const squad = pathname.match(/^\/squads\/([^/]+)$/)?.[1];
  if (squad && !['create', 'discover', 'moderate', 'new'].includes(squad)) {
    return true;
  }

  const [, userId, section] = pathname.split('/');
  return (
    !!userId &&
    !userId.includes('.') &&
    !RESERVED_PROFILE_SLUGS.has(userId) &&
    (!section || PROFILE_SECTIONS.has(section)) &&
    pathname.split('/').length <= 3
  );
};

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
