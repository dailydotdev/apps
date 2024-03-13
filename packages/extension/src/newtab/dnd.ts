import { isBrave } from '@dailydotdev/shared/src/lib/constants';
import { addDays, addHours, addMinutes } from 'date-fns';

export type TimeFormat =
  | 'HALF_HOUR'
  | 'ONE_HOUR'
  | 'TWO_HOURS'
  | 'TOMORROW'
  | 'CUSTOM';

export enum CustomTime {
  HOURS = 'Hours',
  DAYS = 'Days',
}

const DEFAULT_URL = 'https://www.google.com';
const CHROME_DEFAULT_URL = 'chrome://new-tab-page';
const BRAVE_DEFAULT_URL = 'chrome://new-tab-page';

const browserTest = () =>
  process.env.TARGET_BROWSER === 'chrome' ? CHROME_DEFAULT_URL : DEFAULT_URL;
export const getDefaultLink = (): string =>
  isBrave() ? BRAVE_DEFAULT_URL : browserTest();
interface DndOption<T extends TimeFormat> {
  value: number;
  label: string;
  getExpiration: T extends 'CUSTOM'
    ? (time: CustomTime, value: number) => Date
    : () => Date;
}

export const dndOption: { [K in TimeFormat]: DndOption<K> } = {
  HALF_HOUR: {
    value: 30,
    label: '30 minutes',
    getExpiration(): Date {
      return addMinutes(new Date(), this.value);
    },
  },
  ONE_HOUR: {
    value: 1,
    label: '1 hour',
    getExpiration(): Date {
      return addHours(new Date(), this.value);
    },
  },
  TWO_HOURS: {
    value: 2,
    label: '2 hours',
    getExpiration(): Date {
      return addHours(new Date(), this.value);
    },
  },
  TOMORROW: {
    value: 1,
    label: 'Tomorrow',
    getExpiration(): Date {
      return addDays(new Date(), this.value);
    },
  },
  CUSTOM: {
    value: 0,
    label: 'Custom...',
    getExpiration(time: CustomTime, value: number): Date {
      const exp = new Date();

      if (time === CustomTime.DAYS) {
        return addDays(exp, value);
      }

      if (time === CustomTime.HOURS) {
        return addHours(exp, value);
      }

      return addMinutes(exp, value);
    },
  },
};
