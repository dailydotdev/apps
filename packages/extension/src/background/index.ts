import { browser, Runtime } from 'webextension-polyfill-ts';
import { getBootData } from '@dailydotdev/shared/src/lib/boot';
import { apiUrl } from '@dailydotdev/shared/src/lib/config';
import request from 'graphql-request';
import { UPDATE_USER_SETTINGS_MUTATION } from '@dailydotdev/shared/src/graphql/settings';
import {
  BOOT_LOCAL_KEY,
  getLocalBootData,
} from '@dailydotdev/shared/src/contexts/BootProvider';

const excludedCompanionOrigins = [
  'https://twitter.com',
  'https://www.google.com',
  'https://stackoverflow.com',
  'https://mail.google.com',
  'https://meet.google.com',
  'https://calendar.google.com',
  'chrome-extension://',
];

const isExcluded = (origin: string) =>
  excludedCompanionOrigins.some((e) => origin.includes(e));

const sendBootData = async (req, sender) => {
  if (isExcluded(sender?.origin)) {
    return;
  }
  const cacheData = getLocalBootData();
  if (cacheData.settings?.optOutCompanion) {
    return;
  }

  const { postData, settings } = await getBootData(
    'companion',
    sender?.tab?.url,
  );
  let settingsOutput = settings;
  if (!cacheData?.user || !('providers' in cacheData?.user)) {
    settingsOutput = { ...settingsOutput, ...cacheData?.settings };
  }
  await browser.tabs.sendMessage(sender?.tab?.id, {
    postData,
    settings: settingsOutput,
  });
};

function handleMessages(message, sender) {
  if (message.type === 'CONTENT_LOADED') {
    sendBootData(message, sender);
    return null;
  }

  if (message.type === 'GRAPHQL_REQUEST') {
    return request(message.url, message.document, message.variables);
  }

  if (message.type === 'DISABLE_COMPANION') {
    const cacheData = getLocalBootData();
    const settings = { ...cacheData.settings, optOutCompanion: true };
    localStorage.setItem(
      BOOT_LOCAL_KEY,
      JSON.stringify({ ...cacheData, settings, lastModifier: 'companion' }),
    );
    return request(`${apiUrl}/graphql`, UPDATE_USER_SETTINGS_MUTATION, {
      data: {
        optOutCompanion: true,
      },
    });
  }
  return null;
}

browser.runtime.onMessage.addListener(handleMessages);

browser.browserAction.onClicked.addListener(() => {
  const url = browser.extension.getURL('index.html?source=button');
  browser.tabs.create({ url, active: true });
});

browser.runtime.onInstalled.addListener(async () => {
  await Promise.all([
    browser.runtime.setUninstallURL('https://daily.dev/uninstall'),
  ]);
});
