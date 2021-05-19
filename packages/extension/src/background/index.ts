import { browser } from 'webextension-polyfill-ts';

// TODO: migrate existing data

browser.browserAction.onClicked.addListener(() => {
  const url = browser.extension.getURL('index.html?source=button');
  browser.tabs.create({ url, active: true });
});

browser.runtime.onInstalled.addListener(async () => {
  await Promise.all([
    // saveFirstInstall(),
    browser.runtime.setUninstallURL('https://daily.dev/uninstall'),
  ]);
});
