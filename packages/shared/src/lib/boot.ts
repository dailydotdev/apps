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
  data?;
};

export type BootCacheData = Pick<
  Boot,
  'user' | 'alerts' | 'settings' | 'flags' | 'data'
>;

export async function getBootData(app: string, url?: string): Promise<Boot> {
  const res = await fetch(`${apiUrl}/boot`, {
    method: url ? 'POST' : 'GET',
    ...(url && { body: JSON.stringify({ url }) }),
    credentials: 'include',
    headers: { app, 'Content-Type': 'application/json' },
  });
  return res.json();
}
