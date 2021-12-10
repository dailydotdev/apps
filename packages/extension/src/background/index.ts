import { action, tabs, runtime, Runtime } from 'webextension-polyfill';
import { getBootData } from '@dailydotdev/shared/src/lib/boot';

const cacheAmplitudeDeviceId = async ({
  reason,
}: Runtime.OnInstalledDetailsType): Promise<void> => {
  if (reason === 'install') {
    const boot = await getBootData('extension');
    if (boot.visit.ampStorage) {
      localStorage.setItem(
        `amp_${process.env.NEXT_PUBLIC_AMPLITUDE.slice(0, 6)}`,
        boot.visit.ampStorage,
      );
    }
  }
};

action.onClicked.addListener(() => {
  const url = runtime.getURL('index.html?source=button');
  tabs.create({ url, active: true });
});

runtime.onInstalled.addListener(async (details) => {
  await Promise.all([
    cacheAmplitudeDeviceId(details),
    runtime.setUninstallURL('https://daily.dev/uninstall'),
  ]);
});
