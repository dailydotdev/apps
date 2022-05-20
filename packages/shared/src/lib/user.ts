import nodeFetch from 'node-fetch';
import { apiUrl } from './config';

export enum Roles {
  Moderator = 'moderator',
}

export interface AnonymousUser {
  id: string;
  firstVisit?: string;
  referrer?: string;
  isFirstVisit?: boolean;
}

export interface PublicProfile {
  id: string;
  name: string;
  username?: string;
  twitter?: string;
  github?: string;
  hashnode?: string;
  portfolio?: string;
  bio?: string;
  createdAt: string;
  premium: boolean;
  image: string;
  reputation: number;
  permalink: string;
}

export interface UserProfile {
  name: string;
  email: string;
  username?: string;
  company?: string;
  title?: string;
  twitter?: string;
  github?: string;
  hashnode?: string;
  portfolio?: string;
  bio?: string;
  acceptedMarketing?: boolean;
  timezone?: string;
}

export interface UserShortProfile
  extends Pick<PublicProfile, 'id' | 'name' | 'image' | 'bio'> {
  username: string;
  permalink: string;
}

export interface LoggedUser extends UserProfile, AnonymousUser {
  image: string;
  infoConfirmed?: boolean;
  premium?: boolean;
  providers: string[];
  roles?: Roles[];
  createdAt: string;
  reputation?: number;
  permalink: string;
  username: string;
  timezone?: string;
  referralLink?: string;
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

export async function logout(): Promise<void> {
  await fetch(`${apiUrl}/v1/users/logout`, {
    method: 'POST',
    credentials: 'include',
  });
}

export async function deleteAccount(): Promise<void> {
  await fetch(`${apiUrl}/v1/users/me`, {
    method: 'DELETE',
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

export function loggedUserToProfile(user: LoggedUser): UserProfile {
  return {
    name: user.name,
    email: user.email,
    username: user.username,
    company: user.company,
    title: user.title,
    twitter: user.twitter,
    github: user.github,
    portfolio: user.github,
    bio: user.bio,
    acceptedMarketing: user.acceptedMarketing,
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

export async function getProfileSSR(id: string): Promise<PublicProfile> {
  const userRes = await nodeFetch(`${apiUrl}/v1/users/${id}`);
  if (userRes.status === 404) {
    throw new Error('not found');
  }
  return userRes.json();
}

export async function getProfile(id: string): Promise<PublicProfile> {
  const res = await fetch(`${apiUrl}/v1/users/${id}`, {
    credentials: 'include',
  });
  return res.json();
}

export async function getLoggedUser(
  app: string,
): Promise<AnonymousUser | LoggedUser> {
  const res = await fetch(`${apiUrl}/v1/users/me`, {
    credentials: 'include',
    headers: { app },
  });
  return res.json();
}

export const getUserPermalink = (username: string): string =>
  `${process.env.NEXT_PUBLIC_WEBAPP_URL}${username}`;
