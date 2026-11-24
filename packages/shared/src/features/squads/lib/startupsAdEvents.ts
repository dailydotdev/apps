import type { PixelsContextData } from '../../../contexts/PixelsContext';
import type { Squad } from '../../../graphql/sources';
import { SourceMemberRole } from '../../../graphql/sources';
import { storageWrapper } from '../../../lib/storageWrapper';
import { STARTUPS_X_EVENTS } from './startupsXEvents';
import { isCompanyPageReady } from './readiness';

// The browser copies of the company page ad events that daily-api sends from
// the server (src/workers/startupsAdEvents.ts). Both use the same event ids,
// so Meta counts each conversion once. The pixel adds what the server often
// lacks: the ad click id and the browser it happened in.

type TrackEvent = PixelsContextData['trackEvent'];

const HOUR_MS = 60 * 60 * 1000;
// Meta dedupes a browser event against the server one within 48 hours. A page
// seen ready only after that would count twice, so the browser stays out.
export const NEW_COMPANY_PAGE_HOURS = 48;
// Matches FIRST_POST_PAGE_DAYS in daily-api
export const COMPANY_PAGE_FIRST_POST_HOURS = 30 * 24;

const isWithinHours = (date: Date | string | undefined, hours: number) =>
  !!date && Date.now() - new Date(date).getTime() < hours * HOUR_MS;

const hasKey = (key: string): boolean => {
  try {
    return !!storageWrapper.getItem(key);
  } catch {
    return false;
  }
};

const setKey = (key: string): void => {
  try {
    storageWrapper.setItem(key, '1');
  } catch {
    // Storage blocked: the server event still counts
  }
};

const removeKey = (key: string): void => {
  try {
    storageWrapper.removeItem(key);
  } catch {
    // Storage blocked
  }
};

// Marks a key so an event fires once per browser; false when it already had
const markOnce = (key: string): boolean => {
  if (hasKey(key)) {
    return false;
  }

  setKey(key);
  return true;
};

export const getSignupTrackedKey = (userId: string): string =>
  `startups_signup_tracked:${userId}`;
export const getUnreadyPageKey = (squadId: string): string =>
  `startups_page_unready:${squadId}`;
export const getFirstPostTrackedKey = (squadId: string): string =>
  `startups_first_post_tracked:${squadId}`;

interface StartupsSignupProps {
  userId: string;
  email?: string;
  plan?: string;
}

/**
 * The founder's Startups registration: Meta CompleteRegistration and the X
 * "Startups signup" event, once per founder.
 */
export const trackStartupsSignup = (
  trackEvent: TrackEvent,
  { userId, email, plan }: StartupsSignupProps,
): void => {
  if (!markOnce(getSignupTrackedKey(userId))) {
    return;
  }

  trackEvent(
    'CompleteRegistration',
    { content_name: 'startups', content_category: plan },
    {
      eventId: `startups-signup-${userId}`,
      xEventId: STARTUPS_X_EVENTS.signup,
      email,
    },
  );
};

export type CompanyPage = Pick<
  Squad,
  | 'id'
  | 'flags'
  | 'createdAt'
  | 'currentMember'
  | 'image'
  | 'website'
  | 'description'
>;

// As on the server, only a ready page that jev kept counts, so the campaigns
// learn from pages for developers
export const isCompanyPageConversion = (squad?: CompanyPage): boolean =>
  !!squad?.flags?.companyPageReviewed && isCompanyPageReady(squad);

const isCompanyPageAdmin = (squad?: CompanyPage): squad is CompanyPage =>
  !!squad?.id &&
  !!squad.flags?.company &&
  squad.currentMember?.role === SourceMemberRole.Admin;

/**
 * Called when the admin sees their company page. The page counts as a
 * registration once it is ready and jev kept it, as on the server. The browser reports it only
 * when the page just got ready: it was made in the last 48 hours, or this
 * browser saw it unready before.
 */
export const trackCompanyPageReady = (
  trackEvent: TrackEvent,
  squad: CompanyPage | undefined,
  user?: { id: string; email?: string },
): void => {
  if (!user || !isCompanyPageAdmin(squad)) {
    return;
  }

  const unreadyKey = getUnreadyPageKey(squad.id as string);
  if (!isCompanyPageConversion(squad)) {
    if (isWithinHours(squad.createdAt, COMPANY_PAGE_FIRST_POST_HOURS)) {
      setKey(unreadyKey);
    }
    return;
  }

  const justReady =
    isWithinHours(squad.createdAt, NEW_COMPANY_PAGE_HOURS) ||
    hasKey(unreadyKey);
  removeKey(unreadyKey);
  if (!justReady) {
    return;
  }

  trackStartupsSignup(trackEvent, {
    userId: user.id,
    email: user.email,
    plan: 'free',
  });
};

/**
 * A post to a ready company page in its first month: Meta StartTrial, once
 * per page. The server sends the same event for the page's first post.
 */
export const trackCompanyPageFirstPost = (
  trackEvent: TrackEvent,
  squad: CompanyPage,
  email?: string,
): void => {
  const isEligible =
    !!squad.id &&
    !!squad.flags?.company &&
    isCompanyPageConversion(squad) &&
    isWithinHours(squad.createdAt, COMPANY_PAGE_FIRST_POST_HOURS);

  if (!isEligible || !markOnce(getFirstPostTrackedKey(squad.id as string))) {
    return;
  }

  trackEvent(
    'StartTrial',
    { content_name: 'startups first post', content_category: 'free' },
    {
      eventId: `startups-first-post-${squad.id}`,
      xEventId: STARTUPS_X_EVENTS.firstPost,
      email,
    },
  );
};
