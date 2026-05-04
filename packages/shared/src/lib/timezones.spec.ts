import { getTimeZoneOptions, getTimezoneOffsetLabel } from './timezones';

describe('timezones', () => {
  it('formats quarter-hour offsets using minutes', () => {
    expect(getTimeZoneOptions()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          value: 'Asia/Katmandu',
          label: '(UTC +5:45) Kathmandu',
        }),
      ]),
    );
  });

  it('formats half-hour offsets using minutes', () => {
    expect(getTimeZoneOptions()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          value: 'Pacific/Marquesas',
          label: '(UTC -9:30) Marquesas Islands',
        }),
      ]),
    );
  });

  it('formats timezone labels without decimal hours', () => {
    expect(getTimezoneOffsetLabel('Asia/Katmandu')).toBe(
      '(UTC +5:45) Asia/Katmandu',
    );
  });
});
