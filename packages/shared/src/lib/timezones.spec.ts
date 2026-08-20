import { getTimezoneOffset } from 'date-fns-tz';
import {
  getTimeZoneOptions,
  getTimezoneOffsetLabel,
  getUserDefaultTimezone,
  TIME_ZONES,
} from './timezones';

const timezoneAuditDates = [
  new Date('2026-01-15T12:00:00Z'),
  new Date('2026-07-15T12:00:00Z'),
];

const auditedCityTimeZones: Record<string, string> = {
  Chihuahua: 'America/Chihuahua',
  Mazatlan: 'America/Mazatlan',
  'La Paz (Baja California Sur)': 'America/Mazatlan',
  'Ciudad Juarez': 'America/Ciudad_Juarez',
  Georgetown: 'America/Guyana',
  'La Paz (Bolivia)': 'America/La_Paz',
  Manaus: 'America/Manaus',
  Astrakhan: 'Europe/Astrakhan',
  Ulyanovsk: 'Europe/Ulyanovsk',
  Volgograd: 'Europe/Volgograd',
  Beijing: 'Asia/Shanghai',
  Chongqing: 'Asia/Chongqing',
  'Hong Kong SAR': 'Asia/Hong_Kong',
  Urumqi: 'Asia/Urumqi',
};

const getLabelCities = (label: string): string[] => {
  return label.split(',').map((city) => city.trim());
};

const mockDeviceTimezone = (timeZone: string): jest.SpyInstance => {
  const OriginalDateTimeFormat = Intl.DateTimeFormat;

  return jest.spyOn(Intl, 'DateTimeFormat').mockImplementation(((
    locales?: Intl.LocalesArgument,
    options?: Intl.DateTimeFormatOptions,
  ): Intl.DateTimeFormat => {
    const formatter = new OriginalDateTimeFormat(locales, options);

    if (typeof locales !== 'undefined' || typeof options !== 'undefined') {
      return formatter;
    }

    const resolvedOptions = formatter.resolvedOptions();

    return Object.assign(formatter, {
      resolvedOptions: () => ({
        ...resolvedOptions,
        timeZone,
      }),
    });
  }) as typeof Intl.DateTimeFormat);
};

describe('timezones', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

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

  it('returns the device IANA timezone when it is in the allowlist', () => {
    mockDeviceTimezone('America/Mazatlan');

    expect(getUserDefaultTimezone()).toBe('America/Mazatlan');
  });

  it('falls back to matching the device offset when its IANA timezone is absent', () => {
    mockDeviceTimezone('Europe/Trondheim');

    expect(getUserDefaultTimezone()).not.toBe('Europe/Trondheim');
    expect(
      TIME_ZONES.some(({ value }) => value === getUserDefaultTimezone()),
    ).toBeTruthy();
  });

  it('keeps audited city label offsets aligned with their IANA timezones', () => {
    TIME_ZONES.forEach(({ value, label }) => {
      getLabelCities(label).forEach((city) => {
        const cityTimeZone = auditedCityTimeZones[city];

        if (!cityTimeZone) {
          return;
        }

        timezoneAuditDates.forEach((date) => {
          expect(getTimezoneOffset(value, date)).toBe(
            getTimezoneOffset(cityTimeZone, date),
          );
        });
      });
    });
  });
});
