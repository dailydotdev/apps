import 'content-scripts-register-polyfill';
import { browser } from 'webextension-polyfill-ts';
import { getBootData } from '@dailydotdev/shared/src/lib/boot';
import { apiUrl } from '@dailydotdev/shared/src/lib/config';
import request from 'graphql-request';
import { UPDATE_USER_SETTINGS_MUTATION } from '@dailydotdev/shared/src/graphql/settings';
import {
  BOOT_LOCAL_KEY,
  getLocalBootData,
} from '@dailydotdev/shared/src/contexts/BootProvider';
import { getOrGenerateDeviceId } from '@dailydotdev/shared/src/hooks/analytics/useDeviceId';

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

  const url = sender?.tab?.url?.split('?')[0];

  const [deviceId, { postData, settings, flags, user, alerts, visit }] =
    await Promise.all([getOrGenerateDeviceId(), getBootData('companion', url)]);

  let settingsOutput = settings;
  if (!cacheData?.user || !('providers' in cacheData?.user)) {
    settingsOutput = { ...settingsOutput, ...cacheData?.settings };
  }
  await browser.tabs.sendMessage(sender?.tab?.id, {
    deviceId,
    url,
    postData,
    settings: settingsOutput,
    flags,
    user,
    alerts,
    visit,
  });
};

async function handleMessages(message, sender) {
  const permissions = await browser.permissions.contains({
    origins: ['*://*/*'],
  });
  if (permissions) {
    await browser.contentScripts.register({
      matches: ['<all_urls>'],
      css: [{ file: 'css/daily-companion-app.css' }],
      js: [
        { file: 'js/content.bundle.js' },
        { file: 'js/companion.bundle.js' },
      ],
    });
  }

  if (message.type === 'CONTENT_LOADED') {
    sendBootData(message, sender);
    return null;
  }

  if (message.type === 'GRAPHQL_REQUEST') {
    const { queryKey, ...variables } = message.variables || {};
    const req = request(message.url, message.document, variables);
    const key = queryKey || message.queryKey;

    if (!key) {
      return req;
    }

    const url = sender?.tab?.url?.split('?')[0];
    const [deviceId, res] = await Promise.all([getOrGenerateDeviceId(), req]);

    return browser.tabs.sendMessage(sender?.tab?.id, {
      deviceId,
      url,
      res,
      req: { variables },
      queryKey: key,
    });
  }

  if (message.type === 'FETCH_REQUEST') {
    return fetch(message.url, { ...message.args });
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
