import { IFlags } from 'flagsmith';
import { AnonymousUser, LoggedUser } from './user';
import { apiUrl } from './config';
import { Alerts } from '../graphql/alerts';
import { RemoteSettings } from '../graphql/settings';
import { Post } from '../graphql/posts';

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
  | 'upvoted'
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
>;

export enum BootApp {
  Webapp = 'webapp',
  Companion = 'companion',
  Extension = 'extension',
  Test = 'test',
}

export interface CompanionBootData {
  postData: PostBootData;
}
export type AccessToken = { token: string; expiresIn: string };
export type Visit = { sessionId: string; visitId: string };
export type Boot = {
  user: LoggedUser | AnonymousUser;
  accessToken: AccessToken;
  alerts: Alerts;
  visit: Visit;
  flags: IFlags;
  notifications: NotificationsBootData;
  settings: RemoteSettings;
  postData?: PostBootData;
  isLegacyLogout?: boolean;
};

export type BootCacheData = Pick<
  Boot,
  'user' | 'alerts' | 'settings' | 'flags' | 'postData' | 'notifications'
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
  return res.json();
}
