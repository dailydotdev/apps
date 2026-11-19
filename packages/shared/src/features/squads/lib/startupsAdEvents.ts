import type { PixelsContextData } from '../../../contexts/PixelsContext';
import type { Squad } from '../../../graphql/sources';
import { SourceMemberRole } from '../../../graphql/sources';
import { storageWrapper } from '../../../lib/storageWrapper';
import { STARTUPS_X_EVENTS } from './startupsXEvents';

type TrackEvent = PixelsContextData['trackEvent'];

const DAY_MS = 24 * 60 * 60 * 1000;
// An agent creates the page through the API, so the founder's first visit
// within this window stands in for the moment it was created
export const NEW_COMPANY_PAGE_DAYS = 7;
// Matches the free first-post boost window in daily-api
export const COMPANY_PAGE_FIRST_POST_DAYS = 30;

const isWithinDays = (date: Date | string | undefined, days: number) =>
  !!date && Date.now() - new Date(date).getTime() < days * DAY_MS;

// Marks a key so an event fires once per browser; false when it already had
const markOnce = (key: string): boolean => {
  if (storageWrapper.getItem(key)) {
    return false;
  }

  storageWrapper.setItem(key, '1');
  return true;
};

interface StartupsSignupProps {
  userId: string;
  email?: string;
  plan?: string;
}

/**
 * The founder's Startups registration: Meta CompleteRegistration and the X
 * "Startups signup" event, once per founder. The checkout's company step and
 * a new company page (form or agent) both count, under one key and event id.
 */
export const trackStartupsSignup = (
  trackEvent: TrackEvent,
  { userId, email, plan }: StartupsSignupProps,
): void => {
  if (!markOnce(`startups_signup_tracked:${userId}`)) {
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

type CompanyPage = Pick<Squad, 'id' | 'flags' | 'createdAt' | 'currentMember'>;

export const isNewCompanyPageAdmin = (squad?: CompanyPage): boolean =>
  !!squad?.flags?.company &&
  squad.currentMember?.role === SourceMemberRole.Admin &&
  isWithinDays(squad.createdAt, NEW_COMPANY_PAGE_DAYS);

/**
 * The first post on a company page, which starts its free boost: Meta
 * StartTrial, once per page. The page's
 * post count isn't reliable right after posting, so the first post seen in
 * this browser during the page's first month counts.
 */
export const trackCompanyPageFirstPost = (
  trackEvent: TrackEvent,
  squad: CompanyPage,
  email?: string,
): void => {
  const isEligible =
    !!squad.flags?.company &&
    isWithinDays(squad.createdAt, COMPANY_PAGE_FIRST_POST_DAYS);

  if (!isEligible || !markOnce(`startups_first_post_tracked:${squad.id}`)) {
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
