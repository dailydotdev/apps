export enum TimeFormat {
  HALF_HOUR = '30 minutes',
  ONE_HOUR = '1 hour',
  TWO_HOURS = '2 hours',
  TOMORROW = 'Tomorrow',
  CUSTOM = 'Custom...',
}

export enum CustomTime {
  MINUTES = 'Minutes',
  HOURS = 'Hours',
  DAYS = 'Days',
}

const DEFAULT_URL = 'https://www.google.com';
const CHROME_DEFAULT_URL = 'chrome-search://local-ntp/local-ntp.html';

export const getExpiration = (time: CustomTime, value: number): Date => {
  const exp = new Date();

  if (time === CustomTime.DAYS) {
    return new Date(exp.getFullYear(), exp.getMonth(), exp.getDate() + value);
  }

  if (time === CustomTime.MINUTES) exp.setMinutes(exp.getMinutes() + value);

  if (time === CustomTime.HOURS) exp.setHours(exp.getHours() + value);

  return exp;
};

export const getTimeFormatExpiration = (format: TimeFormat): Date => {
  const expiration = new Date();

  if (format === TimeFormat.CUSTOM) throw new Error('Unable to fetch value!');

  if (format === TimeFormat.TOMORROW) return getExpiration(CustomTime.DAYS, 1);

  if (format === TimeFormat.HALF_HOUR) {
    expiration.setMinutes(expiration.getMinutes() + 30);
    return expiration;
  }

  const value = format === TimeFormat.ONE_HOUR ? 1 : 2;

  expiration.setHours(expiration.getHours() + value);

  return expiration;
};

export const getDefaultLink = (): string =>
  process.env.TARGET_BROWSER === 'chrome' ? CHROME_DEFAULT_URL : DEFAULT_URL;
