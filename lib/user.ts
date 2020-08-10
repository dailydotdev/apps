import nodeFetch from 'node-fetch';
import { IncomingMessage, ServerResponse } from 'http';
import { apiUrl } from './config';

export interface AnonymousUser {
  id: string;
}

export interface LoggedUser {
  id: string;
  name?: string;
  email?: string;
  image: string;
  infoConfirmed?: boolean;
  premium?: boolean;
  providers: string[];
  company?: string;
  title?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  company?: string;
  title?: string;
}

interface UserResponse {
  user: AnonymousUser | LoggedUser;
  isLoggedIn: boolean;
}

interface GetUserParams {
  req: IncomingMessage;
  res: ServerResponse;
}

interface AuthenticateParams {
  code: string;
  verifier: string;
}

interface APIError {
  error: true;
  code: number;
  message: string;
}

export async function authenticate({
  code,
  verifier,
}: AuthenticateParams): Promise<void> {
  await fetch(`${apiUrl}/v1/auth/authenticate`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ code, code_verifier: verifier }),
  });
}

export async function updateProfile(
  profile: UserProfile,
): Promise<LoggedUser | APIError> {
  const res = await fetch(`${apiUrl}/v1/users/me`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(profile),
  });
  const data = await res.json();
  if (res.status === 200) {
    return data;
  }
  if (res.status === 400) {
    return {
      error: true,
      ...data,
    };
  }
  throw new Error('Unexpected response');
}

export async function getUser({
  req,
  res,
}: GetUserParams): Promise<UserResponse> {
  const userRes = await nodeFetch(`${apiUrl}/v1/users/me`, {
    headers: req ? { cookie: req.headers.cookie } : undefined,
  });
  const body = await userRes.json();

  if (userRes.headers.get('set-cookie')) {
    res.setHeader('set-cookie', userRes.headers.get('set-cookie'));
  }

  return {
    user: body,
    isLoggedIn: !!body.providers,
  };
}
