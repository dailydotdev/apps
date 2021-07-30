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

export const getDefaultLink = (): string =>
  process.env.TARGET_BROWSER === 'chrome' ? CHROME_DEFAULT_URL : DEFAULT_URL;
interface DndOption {
  value: number;
  label: string;
  format: TimeFormat;
  getExpiration: (time: CustomTime, value: number) => Date;
}

export const dndOption: { [k: string]: DndOption } = {
  halfHour: {
    value: 30,
    label: '30 minutes',
    format: TimeFormat.HALF_HOUR,
    getExpiration(): Date {
      return getExpiration(CustomTime.MINUTES, this.value);
    },
  },
  oneHour: {
    value: 1,
    label: '1 hour',
    format: TimeFormat.ONE_HOUR,
    getExpiration(): Date {
      return getExpiration(CustomTime.HOURS, this.value);
    },
  },
  twoHour: {
    value: 2,
    label: '2 hours',
    format: TimeFormat.TWO_HOURS,
    getExpiration(): Date {
      return getExpiration(CustomTime.HOURS, this.value);
    },
  },
  tomorrow: {
    value: 1,
    label: 'Tomorrow',
    format: TimeFormat.CUSTOM,
    getExpiration(): Date {
      return getExpiration(CustomTime.DAYS, this.value);
    },
  },
  custom: {
    value: 0,
    label: 'Custom...',
    format: TimeFormat.CUSTOM,
    getExpiration(time: CustomTime, value: number): Date {
      return getExpiration(time, value);
    },
  },
};
