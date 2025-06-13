import type { FeatureDefinition } from '@growthbook/growthbook';
import type { AnonymousUser, LoggedUser } from './user';
import { apiUrl } from './config';
import type { Alerts } from '../graphql/alerts';
import type { RemoteSettings } from '../graphql/settings';
import type { Post } from '../graphql/posts';
import type { Squad } from '../graphql/sources';
import { decrypt } from '../components/crypto';
import type { MarketingCta } from '../components/marketingCta/common';
import type { Feed } from '../graphql/feed';
import type { Continent } from './geo';

interface NotificationsBootData {
  unreadNotificationsCount: number;
}

export type PostBootData = Pick<
  Post,
  | 'id'
  | 'title'
  | 'commentsPermalink'
  | 'trending'
  | 'summary'
  | 'numUpvotes'
  | 'numComments'
  | 'bookmarked'
  | 'source'
  | 'image'
  | 'createdAt'
  | 'readTime'
  | 'tags'
  | 'permalink'
  | 'author'
  | 'scout'
  | 'commented'
  | 'type'
  | 'flags'
  | 'userState'
>;

export enum BootApp {
  Webapp = 'webapp',
  Companion = 'companion',
  Extension = 'extension',
  Test = 'test',
}

export type AccessToken = { token: string; expiresIn: string };
export type Visit = { sessionId: string; visitId: string };
export type Boot = {
  user: LoggedUser | AnonymousUser;
  accessToken: AccessToken;
  alerts: Alerts;
  visit: Visit;
  notifications: NotificationsBootData;
  settings: RemoteSettings;
  squads: Squad[];
  postData?: PostBootData;
  exp?: {
    f: string;
    e: string[];
    a: string[];
    features?: Record<string, FeatureDefinition>;
  };
  marketingCta?: MarketingCta | null;
  feeds: Feed[];
  language?: string;
  geo: {
    ip?: string;
    region?: string;
    continent?: Continent;
  };
  isAndroidApp?: boolean;
};

export type BootCacheData = Pick<
  Boot,
  | 'user'
  | 'alerts'
  | 'settings'
  | 'postData'
  | 'notifications'
  | 'squads'
  | 'exp'
  | 'feeds'
  | 'geo'
> & { lastModifier?: string; isAndroidApp?: boolean };

const getBootURL = (app: string, url?: string) => {
  const appRoute = app === 'companion' ? '/companion' : '';
  const params = new URLSearchParams();
  params.append('v', process.env.CURRENT_VERSION);
  if (url) {
    params.append('url', url);
  }

  return `${apiUrl}/boot${appRoute}?${params}`;
};

const enrichBootWithFeatures = async (boot: Boot): Promise<Boot> => {
  const features = await decrypt(
    boot.exp.f,
    process.env.NEXT_PUBLIC_EXPERIMENTATION_KEY,
    'AES-CBC',
    128,
  );

  return { ...boot, exp: { ...boot.exp, features: JSON.parse(features) } };
};

export async function getBootData(
  app: string,
  url?: string,
  options?: Record<'cookies', string>,
): Promise<Boot> {
  const bootURL = getBootURL(app, url);
  const res = await fetch(bootURL, {
    method: 'GET',
    credentials: 'include',
    headers: {
      app,
      'Content-Type': 'application/json',
      ...(options?.cookies && { Cookie: options.cookies }),
    },
  });
  const result = await res.json();
  return await enrichBootWithFeatures(result);
}
