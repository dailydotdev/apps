import { getLocalBootData } from '../contexts/BootProvider';
import { BOOT_LOCAL_KEY } from '../contexts/common';
import { storageWrapper as storage } from './storageWrapper';

export const initApp = (): void => {
  const params = new URLSearchParams(globalThis?.location?.search);
  if (params.get('android') === 'true') {
    const bootData = getLocalBootData();
    if (!bootData.isAndroidApp) {
      storage.setItem(
        BOOT_LOCAL_KEY,
        JSON.stringify({ ...bootData, isAndroidApp: true }),
      );
    }
  }
};

export const isAndroidApp = (): boolean => {
  const bootData = getLocalBootData();
  return bootData.isAndroidApp;
};
