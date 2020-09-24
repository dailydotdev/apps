import nodeFetch from 'node-fetch';
import { IncomingMessage, ServerResponse } from 'http';
import { apiUrl } from './config';

export enum Roles {
  Moderator = 'moderator',
}

export interface AnonymousUser {
  id: string;
}

export interface PublicProfile {
  id: string;
  name: string;
  username?: string;
  twitter?: string;
  github?: string;
  portfolio?: string;
  bio?: string;
  createdAt: string;
  premium: boolean;
  image: string;
  reputation: number;
}

export interface UserProfile {
  name: string;
  email: string;
  username?: string;
  company?: string;
  title?: string;
  twitter?: string;
  github?: string;
  portfolio?: string;
  bio?: string;
}

export interface LoggedUser extends UserProfile {
  id: string;
  image: string;
  infoConfirmed?: boolean;
  premium?: boolean;
  providers: string[];
  acceptedMarketing?: boolean;
  roles?: Roles[];
  createdAt: string;
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

interface BaseError {
  error: true;
  message: string;
}

interface BadRequestError extends BaseError {
  code: 1;
  field: string;
  reason: string;
}

export type APIError = BaseError | BadRequestError;

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

export async function logout(): Promise<void> {
  await fetch(`${apiUrl}/v1/users/logout`, {
    method: 'POST',
    credentials: 'include',
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

export async function changeProfileImage(file: File): Promise<LoggedUser> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${apiUrl}/v1/users/me/image`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  const data = await res.json();
  if (res.status === 200) {
    return data;
  }
  throw new Error('Unexpected response');
}

export async function getProfile(id: string): Promise<PublicProfile> {
  const userRes = await nodeFetch(`${apiUrl}/v1/users/${id}`);
  if (userRes.status === 404) {
    throw new Error('not found');
  }
  return userRes.json();
}

export async function getUserProps(
  params: GetUserParams,
): Promise<{ user?: LoggedUser; trackingId: string }> {
  const userRes = await getUser(params);
  return {
    user: userRes.isLoggedIn ? (userRes.user as LoggedUser) : null,
    trackingId: userRes.user.id,
  };
}
