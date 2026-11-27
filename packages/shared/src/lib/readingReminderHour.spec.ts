import {
  formatReminderHour,
  getOfferedReminderHour,
  getReminderHourChoices,
} from './readingReminderHour';

describe('readingReminderHour', () => {
  it('should offer 9 AM late at night and the current hour otherwise', () => {
    expect(getOfferedReminderHour(0)).toBe(9);
    expect(getOfferedReminderHour(4)).toBe(9);
    expect(getOfferedReminderHour(5)).toBe(5);
    expect(getOfferedReminderHour(20)).toBe(20);
  });

  it('should put the offered hour in place of the nearest preset', () => {
    expect(getReminderHourChoices(20)).toEqual([9, 13, 20]);
    expect(getReminderHourChoices(2)).toEqual([9, 13, 20]);
    expect(getReminderHourChoices(17)).toEqual([9, 13, 17]);
    expect(getReminderHourChoices(6)).toEqual([6, 13, 20]);
  });

  it('should format hours on a 12-hour clock', () => {
    expect(formatReminderHour(0)).toBe('12 AM');
    expect(formatReminderHour(12)).toBe('12 PM');
    expect(formatReminderHour(20)).toBe('8 PM');
  });
});
