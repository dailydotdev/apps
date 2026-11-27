import { BOOT_LOCAL_KEY } from '../contexts/common';
import { getAdRefreshPlatform } from '../features/monetization/refresh/adRefresh';
import { dailyClientHeader } from '../graphql/common';
import type { BootCacheData } from './boot';
import { getDailyClientPlatform } from './func';
import { storageWrapper as storage } from './storageWrapper';

const isAndroidApp = (): boolean => {
  const params = new URLSearchParams(globalThis.location?.search);
  if (params.get('android')) {
    return true;
  }

  try {
    const cached = storage.getItem(BOOT_LOCAL_KEY);
    const boot = cached ? (JSON.parse(cached) as BootCacheData | null) : null;
    return boot?.isAndroidApp === true;
  } catch {
    return false;
  }
};

export const getAdRequestHeaders = (): Record<string, string> => ({
  [dailyClientHeader]: getDailyClientPlatform(
    getAdRefreshPlatform(isAndroidApp()),
  ),
  ...(process.env.CURRENT_VERSION && {
    'X-Daily-Version': process.env.CURRENT_VERSION,
  }),
});
