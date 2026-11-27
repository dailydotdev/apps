import { dailyClientHeader } from '../graphql/common';
import { getDailyClientPlatform } from './func';

export const getAdRequestHeaders = (
  platform?: string,
): Record<string, string> => ({
  [dailyClientHeader]: getDailyClientPlatform(platform),
  ...(process.env.CURRENT_VERSION && {
    'X-Daily-Version': process.env.CURRENT_VERSION,
    'X-App-Version': process.env.CURRENT_VERSION,
  }),
});
