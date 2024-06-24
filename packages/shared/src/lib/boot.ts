import { FeatureDefinition } from '@growthbook/growthbook';
import { AnonymousUser, LoggedUser } from './user';
import { apiUrl } from './config';
import { Alerts } from '../graphql/alerts';
import { RemoteSettings } from '../graphql/settings';
import { Post } from '../graphql/posts';
import { Squad } from '../graphql/sources';
import { decrypt } from '../components/crypto';
import { MarketingCta } from '../components/marketingCta/common';
import { Feed } from '../graphql/feed';

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
  isLegacyLogout?: boolean;
  exp?: {
    f: string;
    e: string[];
    a: string[];
    features?: Record<string, FeatureDefinition>;
  };
  marketingCta?: MarketingCta | null;
  feeds: Feed[];
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
> & { lastModifier?: string };

export async function getBootData(app: string, url?: string): Promise<Boot> {
  const appRoute = app === 'companion' ? '/companion' : '';
  const params = new URLSearchParams();
  params.append('v', process.env.CURRENT_VERSION);
  if (url) {
    params.append('url', url);
  }

  const res = await fetch(`${apiUrl}/boot${appRoute}?${params}`, {
    method: 'GET',
    credentials: 'include',
    headers: { app, 'Content-Type': 'application/json' },
  });
  const result = await res.json();

  const features = await decrypt(
    result.exp.f,
    process.env.NEXT_PUBLIC_EXPERIMENTATION_KEY,
    'AES-CBC',
    128,
  );

  result.exp.features = JSON.parse(features);

  return result;
}
