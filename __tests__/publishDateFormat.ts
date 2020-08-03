import publishDateFormat from '../lib/publishDateFormat';

const now = new Date(2020, 5, 1, 12, 0, 0);

it('should return "Now" when less than a minute', () => {
  const expected = 'Now';
  const date = new Date(2020, 5, 1, 11, 59, 22);
  const actual = publishDateFormat(date.toISOString(), now);
  expect(actual).toEqual(expected);
});

it('should return "Today" when less than 24 hours', () => {
  const expected = 'Today';
  const date = new Date(2020, 5, 1, 11, 43, 16);
  const actual = publishDateFormat(date.toISOString(), now);
  expect(actual).toEqual(expected);
});

it('should return "Yesterday" when more than a day but still yesterday', () => {
  const expected = 'Yesterday';
  const date = new Date(2020, 4, 31, 6, 36, 46);
  const actual = publishDateFormat(date.toISOString(), now);
  expect(actual).toEqual(expected);
});

it('should return formatted date when more than 2 days', () => {
  const expected = 'Oct 04, 2017';
  const date = new Date(2017, 9, 4, 12, 0, 0);
  const actual = publishDateFormat(date.toISOString(), now);
  expect(actual).toEqual(expected);
});
