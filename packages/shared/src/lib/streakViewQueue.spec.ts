import {
  isFinalViewRejection,
  isStreakViewCreditable,
} from './streakViewQueue';

const tz = 'Europe/Amsterdam';
// CET (UTC+1), no DST in January
const at = new Date('2026-01-12T21:30:00+01:00');

const graphqlError = (code?: string) => ({
  response: {
    data: null,
    errors: [{ message: 'no', ...(code && { extensions: { code } }) }],
  },
});

describe('isStreakViewCreditable', () => {
  it('should credit a view from the same local day', () => {
    expect(
      isStreakViewCreditable(at, new Date('2026-01-12T23:59:00+01:00'), tz),
    ).toBe(true);
  });

  it('should drop a view from the previous local day, even just after midnight', () => {
    // the API would credit the replay to 00:10, so the read would land on
    // the wrong day
    expect(
      isStreakViewCreditable(at, new Date('2026-01-13T00:10:00+01:00'), tz),
    ).toBe(false);
  });

  it('should drop a view older than a day', () => {
    expect(
      isStreakViewCreditable(at, new Date('2026-01-14T12:00:00+01:00'), tz),
    ).toBe(false);
  });

  it('should use the profile timezone for the day boundary', () => {
    // 14:30Z is 23:30 in Tokyo and 15:30 in Amsterdam; at 18:30Z Tokyo is on
    // the next day while Amsterdam is still on the same one
    expect(
      isStreakViewCreditable(
        new Date('2026-01-13T14:30:00Z'),
        new Date('2026-01-13T18:30:00Z'),
        'Asia/Tokyo',
      ),
    ).toBe(false);
    expect(
      isStreakViewCreditable(
        new Date('2026-01-13T14:30:00Z'),
        new Date('2026-01-13T18:30:00Z'),
        tz,
      ),
    ).toBe(true);
  });
});

describe('isFinalViewRejection', () => {
  it.each(['NOT_FOUND', 'FORBIDDEN', 'UNAUTHENTICATED'])(
    'should treat %s as final',
    (code) => {
      expect(isFinalViewRejection(graphqlError(code))).toBe(true);
    },
  );

  it.each(['RATE_LIMITED', 'UNEXPECTED', 'INTERNAL_SERVER_ERROR', undefined])(
    'should not treat a %s GraphQL error as final',
    (code) => {
      expect(isFinalViewRejection(graphqlError(code))).toBe(false);
    },
  );

  it('should not treat a network failure as final', () => {
    expect(isFinalViewRejection(new TypeError('Failed to fetch'))).toBe(false);
    expect(isFinalViewRejection(undefined)).toBe(false);
  });
});
