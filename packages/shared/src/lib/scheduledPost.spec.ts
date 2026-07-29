import { dateFormatInTimezone } from './timezones';
import {
  MAX_POST_SCHEDULE_DAYS,
  validatePostScheduledStart,
} from './scheduledPost';

const tz = 'Etc/UTC';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const toLocal = (date: Date): string =>
  dateFormatInTimezone(date, "yyyy-MM-dd'T'HH:mm", tz);

describe('validatePostScheduledStart', () => {
  it('returns an ISO string for a valid future time within the limit', () => {
    const future = new Date(Date.now() + 60 * 60 * 1000);
    const result = validatePostScheduledStart(toLocal(future), tz);

    expect('iso' in result).toBe(true);
    if ('iso' in result) {
      expect(new Date(result.iso).getTime()).toBeGreaterThan(Date.now());
    }
  });

  it('rejects empty input', () => {
    expect(validatePostScheduledStart('', tz)).toEqual({
      error: 'Scheduled time is invalid',
    });
  });

  it('rejects a time in the past', () => {
    const past = new Date(Date.now() - ONE_DAY_MS);

    expect(validatePostScheduledStart(toLocal(past), tz)).toEqual({
      error: 'Scheduled time must be in the future',
    });
  });

  it(`rejects a time more than ${MAX_POST_SCHEDULE_DAYS} days ahead`, () => {
    const tooFar = new Date(
      Date.now() + (MAX_POST_SCHEDULE_DAYS + 1) * ONE_DAY_MS,
    );

    expect(validatePostScheduledStart(toLocal(tooFar), tz)).toEqual({
      error: `Scheduled time must be within ${MAX_POST_SCHEDULE_DAYS} days`,
    });
  });
});
