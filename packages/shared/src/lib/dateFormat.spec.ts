import { addDays, subDays } from 'date-fns';
import {
  postDateFormat,
  commentDateFormat,
  getReadHistoryDateFormat,
  isDateOnlyEqual,
  getTodayTz,
} from './dateFormat';

const now = new Date(2020, 5, 1, 12, 0, 0);

export const getLabel = (toCompare: Date): string => {
  const today = new Date();

  if (isDateOnlyEqual(today, toCompare)) {
    return 'Today';
  }

  if (isDateOnlyEqual(today, addDays(toCompare, 1))) {
    return 'Yesterday';
  }

  return '';
};

describe('postDateFormat', () => {
  it('should return "Now" when less than a minute', () => {
    const expected = 'Now';
    const date = new Date(2020, 5, 1, 11, 59, 22);
    const actual = postDateFormat(date.toISOString(), now);
    expect(actual).toEqual(expected);
  });

  it('should return "Today" when less than 24 hours', () => {
    const expected = 'Today';
    const date = new Date(2020, 5, 1, 11, 43, 16);
    const actual = postDateFormat(date.toISOString(), now);
    expect(actual).toEqual(expected);
  });

  it('should return "Yesterday" when more than a day but still yesterday', () => {
    const expected = 'Yesterday';
    const date = new Date(2020, 4, 31, 6, 36, 46);
    const actual = postDateFormat(date.toISOString(), now);
    expect(actual).toEqual(expected);
  });

  it('should return formatted date when more than 2 days', () => {
    const expected = 'Oct 04, 2017';
    const date = new Date(2017, 9, 4, 12, 0, 0);
    const actual = postDateFormat(date.toISOString(), now);
    expect(actual).toEqual(expected);
  });
});

describe('commentDateFormat', () => {
  it('should return "Now" when less than a minute', () => {
    const expected = 'Now';
    const date = new Date(2020, 5, 1, 11, 59, 22);
    const actual = commentDateFormat(date.toISOString(), now);
    expect(actual).toEqual(expected);
  });

  it('should return time ago in minutes when less than an hour', () => {
    const expected = '17 mins';
    const date = new Date(2020, 5, 1, 11, 43, 16);
    const actual = commentDateFormat(date.toISOString(), now);
    expect(actual).toEqual(expected);
  });

  it('should return time ago in hours when less than a day', () => {
    const expected = '11 hrs';
    const date = new Date(2020, 5, 1, 1, 23, 45);
    const actual = commentDateFormat(date.toISOString(), now);
    expect(actual).toEqual(expected);
  });

  it('should return formatted date when more than 1 day without the year', () => {
    const expected = 'Feb 6';
    const date = new Date(2020, 1, 6, 6, 37, 22);
    const actual = commentDateFormat(date.toISOString(), now);
    expect(actual).toEqual(expected);
  });

  it('should return formatted date when more than one year', () => {
    const expected = 'Oct 4, 2017';
    const date = new Date(2017, 9, 4, 12, 0, 0);
    const actual = commentDateFormat(date.toISOString(), now);
    expect(actual).toEqual(expected);
  });
});

describe('getReadHistoryDateFormat', () => {
  it('should return formatted date for the same day', () => {
    const expected = 'Today';
    const date = new Date();
    const actual = getReadHistoryDateFormat(date);
    expect(actual).toEqual(expected);
  });

  it('should return formatted date for the day before', () => {
    const expected = 'Yesterday';
    const date = subDays(new Date(), 1);
    const actual = getReadHistoryDateFormat(date);
    expect(actual).toEqual(expected);
  });

  it('should return formatted date for the same year', () => {
    const year = new Date().getFullYear();
    const date = new Date(`${year}-03-31 07:15:51.247`);

    const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][
      date.getDay()
    ];
    const expected = getLabel(date) || `${weekday}, 31 Mar`;
    const actual = getReadHistoryDateFormat(date);
    expect(actual).toEqual(expected);
  });

  it('should return formatted date with a different year from today', () => {
    const expected = 'Sat, 31 Mar 2018';
    const date = new Date('2018-03-31 07:15:51.247');
    const actual = getReadHistoryDateFormat(date);
    expect(actual).toEqual(expected);
  });
});

describe('getTodayTz', () => {
  const mockDate = new Date('2024-01-01T00:00:00Z');

  it('should return the current date in New York timezone', () => {
    const date = getTodayTz('America/New_York', mockDate);
    expect(date).toEqual(new Date('2023-12-31T19:00:00'));
  });

  it('should return the correct date in Berlin timezone', () => {
    const date = getTodayTz('Europe/Berlin', mockDate);
    expect(date).toEqual(new Date('2024-01-01T01:00:00'));
  });

  it('should return the correct date in India timezone', () => {
    const date = getTodayTz('Asia/Kolkata', mockDate);
    expect(date).toEqual(new Date('2024-01-01T05:30:00'));
  });

  it('should return the current date in UTC timezone', () => {
    const date = getTodayTz('UTC', mockDate);
    expect(date).toEqual(new Date('2024-01-01T00:00:00'));
  });

  it('should return the correct date in New York timezone during daylight saving time', () => {
    const date = getTodayTz(
      'America/New_York',
      new Date('2024-03-11T00:00:00Z'),
    );
    expect(date).toEqual(new Date('2024-03-10T20:00:00'));
  });

  it('should return the correct date in Berlin timezone during daylight saving time', () => {
    const date = getTodayTz('Europe/Berlin', new Date('2024-04-01T00:00:00Z'));
    expect(date).toEqual(new Date('2024-04-01T02:00:00'));
  });

  it('should return same date as today if second argument is not supplied', () => {
    const dateNow = new Date();
    const date = getTodayTz(Intl.DateTimeFormat().resolvedOptions().timeZone);
    expect(date.toISOString().slice(0, 10)).toEqual(
      dateNow.toISOString().slice(0, 10),
    );
  });

  it('should throw an error for invalid timezone', () => {
    expect(() => getTodayTz('Invalid/Timezone')).toThrow();
  });
});
