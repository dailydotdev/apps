import { IFlags } from 'flagsmith';
import { AnonymousUser, LoggedUser } from './user';
import { apiUrl } from './config';
import { Alerts } from '../graphql/alerts';
import { RemoteSettings } from '../graphql/settings';

export type AccessToken = { token: string; expiresIn: string };
export type Visit = { ampStorage?: string; sessionId: string; visitId: string };
export type Boot = {
  user: LoggedUser | AnonymousUser;
  accessToken: AccessToken;
  alerts: Alerts;
  visit: Visit;
  flags: IFlags;
  settings: RemoteSettings;
};

export type BootCacheData = Pick<
  Boot,
  'user' | 'alerts' | 'settings' | 'flags'
>;

export async function getBootData(app: string): Promise<Boot> {
  const res = await fetch(`${apiUrl}/boot`, {
    credentials: 'include',
    headers: { app },
  });
  return res.json();
}
