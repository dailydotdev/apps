import { daysAgo, hoursAgo, minutesAgo, mockNow } from './mockClock';

const anHour = 1000 * 60 * 60;

/** 2026-08-10T14:37:12.345Z — a time that is nowhere near an hour boundary. */
const midHour = Date.UTC(2026, 7, 10, 14, 37, 12, 345);

const at = (instant: number) =>
  jest.spyOn(Date, 'now').mockReturnValue(instant);

afterEach(() => jest.restoreAllMocks());

/**
 * Every mock timestamp is measured from the top of the hour, and that is the
 * whole point: the mocks used to measure from `Date.now()`, so the server built
 * one set of timestamps and the browser built another a few seconds later, and
 * every relative time in the tree hydrated as a mismatch.
 */
describe('mockNow', () => {
  it('is the top of the hour, never the instant it was asked at', () => {
    at(midHour);

    expect(mockNow()).toBe(Date.UTC(2026, 7, 10, 14, 0, 0, 0));
    expect(mockNow() % anHour).toBe(0);
  });

  // The hydration guarantee itself: the server renders, a few seconds pass, the
  // browser renders, and the two have to agree on what "now" was.
  it('agrees with itself across the gap between render and hydrate', () => {
    at(midHour);
    const onTheServer = minutesAgo(7);

    at(midHour + 1000 * 9);
    const inTheBrowser = minutesAgo(7);

    expect(inTheBrowser).toBe(onTheServer);
  });

  it('still moves with the clock rather than freezing at a written date', () => {
    at(midHour);
    const thisHour = mockNow();

    at(midHour + anHour);

    expect(mockNow()).toBe(thisHour + anHour);
  });

  it('floors rather than rounds, so it is never a moment in the future', () => {
    at(midHour + 1000 * 60 * 59);

    expect(mockNow()).toBeLessThanOrEqual(Date.now());
  });
});

describe('the relative helpers', () => {
  beforeEach(() => at(midHour));

  it('count back from the hour, not from the instant', () => {
    expect(minutesAgo(42)).toBe('2026-08-10T13:18:00.000Z');
    expect(hoursAgo(2)).toBe('2026-08-10T12:00:00.000Z');
    expect(daysAgo(1)).toBe('2026-08-09T14:00:00.000Z');
  });

  it('agree with each other about the same distance back', () => {
    expect(daysAgo(1)).toBe(hoursAgo(24));
    expect(hoursAgo(1)).toBe(minutesAgo(60));
  });

  it('hand back an ISO string the date helpers can parse', () => {
    expect(new Date(minutesAgo(5)).toISOString()).toBe(minutesAgo(5));
  });

  it('treat zero as the hour itself', () => {
    expect(minutesAgo(0)).toBe(new Date(mockNow()).toISOString());
  });
});

/**
 * The invariant on the data rather than on the helper. Every mock timestamp is
 * frozen at module load, so a module that reaches for `Date.now()` directly —
 * the way these all used to — puts the server's set of timestamps and the
 * browser's a few seconds apart, and every relative time in the tree hydrates as
 * a mismatch.
 */
describe('the mock data itself', () => {
  const loadMocks = () => {
    let loaded = '';

    jest.isolateModules(() => {
      /* eslint-disable global-require, @typescript-eslint/no-var-requires */
      const { mockConversation } = require('./chat');
      const { mockFeedItems } = require('./mockFeed');
      const { mockInterest, mockAgentPosts } = require('./mock');
      /* eslint-enable global-require, @typescript-eslint/no-var-requires */

      loaded = JSON.stringify({
        mockConversation,
        mockFeedItems,
        mockInterest,
        mockAgentPosts,
      });
    });

    return loaded;
  };

  it('reads the same on the server and in the browser nine seconds later', () => {
    at(midHour);
    const onTheServer = loadMocks();

    // Non-vacuous: the mocks really are stamped from the clock, so there is
    // something in there that could have drifted.
    expect(onTheServer).toContain('2026-08-10T');

    at(midHour + 1000 * 9);

    expect(loadMocks()).toBe(onTheServer);
  });
});
