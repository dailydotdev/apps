import nodeFetch from 'node-fetch';
import { apiUrl, graphqlUrl } from './config';
import {
  PROFILE_V2_EXTRA_QUERY,
  ProfileV2,
  USER_BY_ID_STATIC_FIELDS_QUERY,
} from '../graphql/users';
import type { Company } from './userCompany';
import type { ContentPreference } from '../graphql/contentPreference';
import type { TopReader } from '../components/badges/TopReaderBadge';

export enum Roles {
  Moderator = 'moderator',
}

export interface AnonymousUser {
  id: string;
  firstVisit?: string;
  referrer?: string;
  isFirstVisit?: boolean;
  referralId?: string;
  referralOrigin?: string;
  email?: string; // Needed for users that need to verify
  shouldVerify?: boolean;
}

export interface PublicProfile {
  id: string;
  name: string;
  username?: string;
  twitter?: string;
  github?: string;
  hashnode?: string;
  portfolio?: string;
  roadmap?: string;
  threads?: string;
  codepen?: string;
  reddit?: string;
  stackoverflow?: string;
  youtube?: string;
  linkedin?: string;
  mastodon?: string;
  bio?: string;
  createdAt: string;
  premium: boolean;
  image: string;
  reputation: number;
  permalink: string;
  cover?: string;
  readmeHtml?: string;
  readme?: string;
  companies?: Company[];
  contentPreference?: ContentPreference;
}

export enum UserExperienceLevel {
  LESS_THAN_1_YEAR = 'Aspiring engineer (<1 year)',
  MORE_THAN_1_YEAR = 'Entry-level (1 year)',
  MORE_THAN_2_YEARS = 'Mid-level (2-3 years)',
  MORE_THAN_4_YEARS = 'Experienced (4-5 years)',
  MORE_THAN_6_YEARS = 'Highly experienced (6-10 years)',
  MORE_THAN_10_YEARS = `I've suffered enough (10+ years)`,
  NOT_ENGINEER = `I'm not an engineer`,
}

export interface UserProfile {
  name: string;
  email?: string;
  username?: string;
  company?: string;
  title?: string;
  twitter?: string;
  github?: string;
  hashnode?: string;
  roadmap?: string;
  threads?: string;
  codepen?: string;
  reddit?: string;
  stackoverflow?: string;
  youtube?: string;
  linkedin?: string;
  mastodon?: string;
  portfolio?: string;
  bio?: string;
  acceptedMarketing?: boolean;
  notificationEmail?: boolean;
  timezone?: string;
  cover?: string;
  experienceLevel?: keyof typeof UserExperienceLevel;
  language?: ContentLanguage;
  followingEmail?: boolean;
  followNotifications?: boolean;
}

export interface UserShortProfile
  extends Pick<
    PublicProfile,
    'id' | 'name' | 'image' | 'bio' | 'createdAt' | 'reputation' | 'companies'
  > {
  username: string;
  permalink: string;
  contentPreference?: ContentPreference;
  topReader?: Partial<TopReader>;
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
  canSubmitArticle?: boolean;
  password?: string;
  acquisitionChannel?: string;
  experienceLevel?: keyof typeof UserExperienceLevel;
  isTeamMember?: boolean;
  isPlus?: boolean;
  companies?: Company[];
  contentPreference?: ContentPreference;
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

export async function logout(reason: string): Promise<void> {
  const urlParams = reason ? `?${new URLSearchParams({ reason })}` : '';
  await fetch(`${apiUrl}/v1/users/logout${urlParams}`, {
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

const getProfileRequest = async (method = fetch, id: string) => {
  const userRes = await method(graphqlUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: USER_BY_ID_STATIC_FIELDS_QUERY,
      variables: {
        id,
      },
    }),
    credentials: 'include',
  });
  if (userRes.status === 404) {
    throw new Error('not found');
  }

  const response = await userRes.json();
  return response?.data?.user;
};

const getProfileV2ExtraRequest = async (
  method = fetch,
  id: string,
): Promise<Omit<ProfileV2, 'user'>> => {
  const userRes = await method(graphqlUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: PROFILE_V2_EXTRA_QUERY,
      variables: {
        id,
      },
    }),
    credentials: 'include',
  });
  if (userRes.status === 404) {
    throw new Error('not found');
  }

  const response = await userRes.json();
  return response?.data;
};

export async function getProfileSSR(id: string): Promise<PublicProfile> {
  return await getProfileRequest(nodeFetch, id);
}

export async function getProfile(id: string): Promise<PublicProfile> {
  return await getProfileRequest(fetch, id);
}

export async function getProfileV2ExtraSSR(
  id: string,
): Promise<Omit<ProfileV2, 'user'>> {
  return await getProfileV2ExtraRequest(nodeFetch, id);
}

export enum ReferralOriginKey {
  Squad = 'squad',
}

export enum LogoutReason {
  IncomleteOnboarding = 'incomplete onboarding',
  ManualLogout = 'manual logout',
  KratosSessionAlreadyAvailable = `kratos session already available`,
}

export enum ContentLanguage {
  English = 'en',
  Spanish = 'es',
  German = 'de',
  French = 'fr',
  Italian = 'it',
  ChineseSimplified = 'zh-Hans',
  PortugueseBrazil = 'pt-BR',
  PortuguesePortugal = 'pt-PT',
  Japanese = 'ja',
  Korean = 'ko',
}

export const contnetLanguageToLabelMap = {
  [ContentLanguage.English]: 'English - Default',
  [ContentLanguage.Spanish]: 'Spanish',
  [ContentLanguage.German]: 'German',
  [ContentLanguage.French]: 'French',
  [ContentLanguage.Italian]: 'Italian',
  [ContentLanguage.ChineseSimplified]: 'Chinese (Simplified)',
  [ContentLanguage.PortugueseBrazil]: 'Portuguese (Brazil)',
  [ContentLanguage.PortuguesePortugal]: 'Portuguese (Portugal)',
  [ContentLanguage.Japanese]: 'Japanese',
  [ContentLanguage.Korean]: 'Korean',
};

export const isSpecialUser = ({
  userId,
  loggedUserId,
}: {
  userId: string;
  loggedUserId: string | null;
}): boolean => {
  return !!userId && ['404', loggedUserId].includes(userId);
};
