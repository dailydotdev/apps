import { IFlags } from 'flagsmith';
import { AnonymousUser, LoggedUser } from './user';
import { apiUrl } from './config';

export type AccessToken = { token: string; expiresIn: string };
export type Visit = { ampStorage?: string; sessionId: string; visitId: string };
export type Boot = {
  user: LoggedUser | AnonymousUser;
  accessToken: AccessToken;
  visit: Visit;
  flags: IFlags;
};

export async function getBootData(app: string): Promise<Boot> {
  const res = await fetch(`${apiUrl}/boot`, {
    credentials: 'include',
    headers: { app },
  });
  return res.json();
}
