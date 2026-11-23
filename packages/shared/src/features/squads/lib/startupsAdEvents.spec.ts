import type { Squad } from '../../../graphql/sources';
import { SourceMemberRole } from '../../../graphql/sources';
import {
  getUnreadyPageKey,
  trackCompanyPageFirstPost,
  trackCompanyPageReady,
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
    image: 'https://media.daily.dev/acme.png',
    website: 'https://acme.dev',
    description: 'Acme makes the fastest build cache for monorepos.',
    ...overrides,
  }) as Squad;

const founder = { id: 'u1', email: 'founder@acme.dev' };

beforeEach(() => localStorage.clear());

describe('trackStartupsSignup', () => {
  it('reports the Startups registration once per founder', () => {
    const trackEvent = jest.fn();
    const props = { userId: 'u1', email: 'founder@acme.dev', plan: 'free' };

    trackStartupsSignup(trackEvent, props);
    trackStartupsSignup(trackEvent, { ...props, plan: 'starter' });

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

describe('trackCompanyPageReady', () => {
  it('reports a page made ready in the last 48 hours', () => {
    const trackEvent = jest.fn();

    trackCompanyPageReady(trackEvent, companyPage(), founder);

    expect(trackEvent).toHaveBeenCalledWith(
      'CompleteRegistration',
      expect.anything(),
      expect.objectContaining({ eventId: 'startups-signup-u1' }),
    );
  });

  it('waits for the page to be ready', () => {
    const trackEvent = jest.fn();

    trackCompanyPageReady(
      trackEvent,
      companyPage({ website: undefined }),
      founder,
    );

    expect(trackEvent).not.toHaveBeenCalled();
  });

  it('reports an older page once this browser saw it get ready', () => {
    const trackEvent = jest.fn();
    const older = { createdAt: daysAgo(5) };

    trackCompanyPageReady(trackEvent, companyPage(older), founder);
    expect(trackEvent).not.toHaveBeenCalled();

    trackCompanyPageReady(
      trackEvent,
      companyPage({ ...older, image: undefined }),
      founder,
    );
    trackCompanyPageReady(trackEvent, companyPage(older), founder);

    expect(trackEvent).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem(getUnreadyPageKey('acme'))).toBeNull();
  });

  it.each([
    ['a moderator', { currentMember: { role: SourceMemberRole.Moderator } }],
    ['a community squad', { flags: {} }],
  ])('skips %s', (_, overrides) => {
    const trackEvent = jest.fn();

    trackCompanyPageReady(
      trackEvent,
      companyPage(overrides as Partial<Squad>),
      founder,
    );

    expect(trackEvent).not.toHaveBeenCalled();
  });
});

describe('trackCompanyPageFirstPost', () => {
  it('reports the first post on a ready company page once', () => {
    const trackEvent = jest.fn();

    trackCompanyPageFirstPost(trackEvent, companyPage(), 'founder@acme.dev');
    trackCompanyPageFirstPost(trackEvent, companyPage(), 'founder@acme.dev');

    expect(trackEvent).toHaveBeenCalledTimes(1);
    expect(trackEvent).toHaveBeenCalledWith(
      'StartTrial',
      { content_name: 'startups first post', content_category: 'free' },
      {
        eventId: 'startups-first-post-acme',
        xEventId: STARTUPS_X_EVENTS.firstPost,
        email: 'founder@acme.dev',
      },
    );
  });

  it.each([
    ['a page that is not ready', { description: 'Acme' }],
    ['a page older than a month', { createdAt: daysAgo(31) }],
    ['a community squad', { flags: {} }],
  ])('skips %s', (_, overrides) => {
    const trackEvent = jest.fn();

    trackCompanyPageFirstPost(
      trackEvent,
      companyPage(overrides as Partial<Squad>),
    );

    expect(trackEvent).not.toHaveBeenCalled();
  });
});
