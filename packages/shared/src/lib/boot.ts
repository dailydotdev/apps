import { IFlags } from 'flagsmith';
import { AnonymousUser, LoggedUser } from './user';
import { apiUrl } from './config';
import { Alerts } from '../graphql/alerts';
import { RemoteSettings } from '../graphql/settings';
import { Post } from '../graphql/posts';

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
  settings: RemoteSettings;
  postData?: PostBootData;
};

export type BootCacheData = Pick<
  Boot,
  'user' | 'alerts' | 'settings' | 'flags' | 'postData'
> & { lastModifier?: string };

export async function getBootData(app: string, url?: string): Promise<Boot> {
  const appRoute = app === 'companion' ? '/companion' : '';
  const params = url ? new URLSearchParams({ url }) : '';
  const res = await fetch(`${apiUrl}/boot${appRoute}?${params}`, {
    method: 'GET',
    credentials: 'include',
    headers: { app, 'Content-Type': 'application/json' },
  });
  return res.json();
}
