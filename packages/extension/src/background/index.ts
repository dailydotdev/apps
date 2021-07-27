import { browser, Runtime } from 'webextension-polyfill-ts';
import { getLoggedUser } from '@dailydotdev/shared/src/lib/user';

const cacheAmplitudeDeviceId = async ({
  reason,
}: Runtime.OnInstalledDetailsType): Promise<void> => {
  if (reason === 'install') {
    const user = await getLoggedUser('extension');
    if (user.ampStorage) {
      localStorage.setItem(
        `amp_${process.env.NEXT_PUBLIC_AMPLITUDE.slice(0, 6)}`,
        user.ampStorage,
      );
    }
  }
};

browser.browserAction.onClicked.addListener(() => {
  const url = browser.extension.getURL('index.html?source=button');
  browser.tabs.create({ url, active: true });
});

browser.runtime.onInstalled.addListener(async (details) => {
  await Promise.all([
    cacheAmplitudeDeviceId(details),
    browser.runtime.setUninstallURL('https://daily.dev/uninstall'),
  ]);
});
