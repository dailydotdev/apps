import 'content-scripts-register-polyfill';
import { browser, Runtime, Tabs } from 'webextension-polyfill-ts';
import { getBootData } from '@dailydotdev/shared/src/lib/boot';
import { apiUrl } from '@dailydotdev/shared/src/lib/config';
import { parseOrDefault } from '@dailydotdev/shared/src/lib/func';
import request from 'graphql-request';
import { UPDATE_USER_SETTINGS_MUTATION } from '@dailydotdev/shared/src/graphql/settings';
import {
  BOOT_LOCAL_KEY,
  getLocalBootData,
} from '@dailydotdev/shared/src/contexts/BootProvider';
import { getOrGenerateDeviceId } from '@dailydotdev/shared/src/hooks/analytics/useDeviceId';
import { getContentScriptPermissionAndRegister } from '../companion/useExtensionPermission';

const excludedCompanionOrigins = [
  'http://localhost',
  'http://app.daily.dev',
  'https://twitter.com',
  'https://www.google.com',
  'https://stackoverflow.com',
  'https://mail.google.com',
  'https://meet.google.com',
  'https://calendar.google.com',
  'chrome-extension://',
  'moz-extension://',
  'https://api.daily.dev',
];

const isExcluded = (origin: string) => {
  if (!origin) return false;
  return excludedCompanionOrigins.some((e) => origin.includes(e));
};

const sendBootData = async (_, tab: Tabs.Tab) => {
  const { origin, pathname, search } = new URL(tab.url);
  if (isExcluded(origin)) {
    return;
  }

  const cacheData = getLocalBootData();
  if (cacheData.settings?.optOutCompanion) {
    return;
  }

  const href = origin + pathname + search;

  const [
    deviceId,
    { postData, settings, flags, user, alerts, visit, accessToken },
  ] = await Promise.all([
    getOrGenerateDeviceId(),
    getBootData('companion', href),
  ]);

  let settingsOutput = settings;
  if (!cacheData?.user || !('providers' in cacheData?.user)) {
    settingsOutput = { ...settingsOutput, ...cacheData?.settings };
  }
  await browser.tabs.sendMessage(tab?.id, {
    deviceId,
    url: href,
    postData,
    settings: settingsOutput,
    flags,
    user,
    alerts,
    visit,
    accessToken,
  });
};

const sendRequestResponse = async (
  requestKey: string,
  req: Promise<unknown>,
  sender: Runtime.MessageSender,
  variables,
) => {
  const key = parseOrDefault(requestKey);
  const url = sender?.tab?.url?.split('?')[0];
  const [deviceId, res] = await Promise.all([getOrGenerateDeviceId(), req]);

  return browser.tabs.sendMessage(sender?.tab?.id, {
    deviceId,
    url,
    res,
    req: { variables },
    key,
  });
};

async function handleMessages(message, sender: Runtime.MessageSender) {
  await getContentScriptPermissionAndRegister();

  if (message.type === 'CONTENT_LOADED') {
    sendBootData(message, sender.tab);
    return null;
  }

  if (message.type === 'GRAPHQL_REQUEST') {
    const { requestKey } = message.headers || {};
    const req = request(message.url, message.document, message.variables);

    if (!requestKey) {
      return req;
    }

    return sendRequestResponse(requestKey, req, sender, message.variables);
  }

  if (message.type === 'FETCH_REQUEST') {
    const { requestKey } = message.args.headers || {};
    const req = await fetch(message.url, { ...message.args });

    if (!requestKey) {
      return req;
    }

    return sendRequestResponse(requestKey, req.json(), sender, message.body);
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

browser.runtime.onInstalled.addListener(async (details) => {
  await Promise.all([
    browser.runtime.setUninstallURL('https://daily.dev/uninstall'),
  ]);

  if (details.reason === 'update') {
    await getContentScriptPermissionAndRegister();
  }
});

browser.runtime.onStartup.addListener(async () => {
  await getContentScriptPermissionAndRegister();
});
