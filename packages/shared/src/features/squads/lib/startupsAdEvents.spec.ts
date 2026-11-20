import type { Squad } from '../../../graphql/sources';
import { SourceMemberRole } from '../../../graphql/sources';
import { isNewCompanyPageAdmin, trackStartupsSignup } from './startupsAdEvents';
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
  it('is the admin of a company page created in the last two days', () => {
    expect(isNewCompanyPageAdmin(companyPage())).toBe(true);
  });

  it.each([
    ['a moderator', { currentMember: { role: SourceMemberRole.Moderator } }],
    ['a page older than two days', { createdAt: daysAgo(3) }],
    ['a community squad', { flags: {} }],
  ])('is not %s', (_, overrides) => {
    expect(
      isNewCompanyPageAdmin(companyPage(overrides as Partial<Squad>)),
    ).toBe(false);
  });
});
