import type { Squad } from '../../../graphql/sources';
import { SourceMemberRole } from '../../../graphql/sources';
import {
  isNewCompanyPageAdmin,
  trackCompanyPageFirstPost,
  trackStartupsSignup,
} from './startupsAdEvents';
import { STARTUPS_X_EVENTS } from './startupsXEvents';

const daysAgo = (days: number) =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000);

const companyPage = (overrides: Partial<Squad> = {}) =>
  ({
    id: 'acme',
    flags: { company: true },
    createdAt: daysAgo(1),
    currentMember: { role: SourceMemberRole.Admin },
    ...overrides,
  }) as Squad;

beforeEach(() => localStorage.clear());

describe('trackStartupsSignup', () => {
  it('reports the Startups registration once per founder', () => {
    const trackEvent = jest.fn();
    const founder = { userId: 'u1', email: 'founder@acme.dev', plan: 'free' };

    trackStartupsSignup(trackEvent, founder);
    trackStartupsSignup(trackEvent, { ...founder, plan: 'starter' });

    expect(trackEvent).toHaveBeenCalledTimes(1);
    expect(trackEvent).toHaveBeenCalledWith(
      'CompleteRegistration',
      { content_name: 'startups', content_category: 'free' },
      {
        eventId: 'startups-signup-u1',
        xEventId: STARTUPS_X_EVENTS.signup,
        email: 'founder@acme.dev',
      },
    );
  });
});

describe('isNewCompanyPageAdmin', () => {
  it('is the admin of a company page created this week', () => {
    expect(isNewCompanyPageAdmin(companyPage())).toBe(true);
  });

  it.each([
    ['a moderator', { currentMember: { role: SourceMemberRole.Moderator } }],
    ['a page older than a week', { createdAt: daysAgo(8) }],
    ['a community squad', { flags: {} }],
  ])('is not %s', (_, overrides) => {
    expect(
      isNewCompanyPageAdmin(companyPage(overrides as Partial<Squad>)),
    ).toBe(false);
  });
});

describe('trackCompanyPageFirstPost', () => {
  it('reports the first post on a company page once', () => {
    const trackEvent = jest.fn();

    trackCompanyPageFirstPost(trackEvent, companyPage(), 'founder@acme.dev');
    trackCompanyPageFirstPost(trackEvent, companyPage(), 'founder@acme.dev');

    expect(trackEvent).toHaveBeenCalledTimes(1);
    expect(trackEvent).toHaveBeenCalledWith(
      'StartTrial',
      { content_name: 'startups first post', content_category: 'free' },
      { eventId: 'startups-first-post-acme', email: 'founder@acme.dev' },
    );
  });

  it.each([
    ['a community squad', { flags: {} }],
    ['a page older than a month', { createdAt: daysAgo(31) }],
  ])('skips %s', (_, overrides) => {
    const trackEvent = jest.fn();

    trackCompanyPageFirstPost(
      trackEvent,
      companyPage(overrides as Partial<Squad>),
    );

    expect(trackEvent).not.toHaveBeenCalled();
  });
});
