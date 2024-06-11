import browser, { Runtime, Tabs } from 'webextension-polyfill';
import { getBootData } from '@dailydotdev/shared/src/lib/boot';
import { graphqlUrl } from '@dailydotdev/shared/src/lib/config';
import { parseOrDefault } from '@dailydotdev/shared/src/lib/func';
import { GraphQLClient } from 'graphql-request';
import { UPDATE_USER_SETTINGS_MUTATION } from '@dailydotdev/shared/src/graphql/settings';
import { getLocalBootData } from '@dailydotdev/shared/src/contexts/BootProvider';
import { getOrGenerateDeviceId } from '@dailydotdev/shared/src/hooks/log/useDeviceId';
import { install, uninstall } from '@dailydotdev/shared/src/lib/constants';
import { BOOT_LOCAL_KEY } from '@dailydotdev/shared/src/contexts/common';
import { ExtensionMessageType } from '@dailydotdev/shared/src/lib/extension';
import { storageWrapper as storage } from '@dailydotdev/shared/src/lib/storageWrapper';
import { getContentScriptPermissionAndRegister } from '../lib/extensionScripts';

const client = new GraphQLClient(graphqlUrl, { fetch: globalThis.fetch });

const excludedCompanionOrigins = [
  'http://127.0.0.1:5002',
  'http://localhost',
  'https://app.daily.dev',
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
  if (!origin) {
    return false;
  }
  return excludedCompanionOrigins.some((e) => origin.includes(e));
};

const sendBootData = async (_, tab: Tabs.Tab) => {
  const { origin, pathname, search } = new URL(tab.url);
  if (isExcluded(origin)) {
    return;
  }

  const cacheData = getLocalBootData();
  if (cacheData?.settings?.optOutCompanion) {
    return;
  }

  const href = origin + pathname + search;

  const [deviceId, boot] = await Promise.all([
    getOrGenerateDeviceId(),
    getBootData('companion', href),
  ]);

  let settingsOutput = boot.settings;
  if (!cacheData?.user || !('providers' in cacheData?.user)) {
    settingsOutput = { ...settingsOutput, ...cacheData?.settings };
  }
  await browser.tabs.sendMessage(tab?.id, {
    ...boot,
    deviceId,
    url: href,
    settings: settingsOutput,
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

async function handleMessages(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  message: Record<string, any> & {
    type: ExtensionMessageType;
  },
  sender: Runtime.MessageSender,
) {
  await getContentScriptPermissionAndRegister();

  if (message.type === ExtensionMessageType.ContentLoaded) {
    sendBootData(message, sender.tab);
    return null;
  }

  if (message.type === ExtensionMessageType.GraphQLRequest) {
    const { requestKey } = message.headers || {};
    const req = client.request(message.document, message.variables);

    if (!requestKey) {
      return req;
    }

    return sendRequestResponse(requestKey, req, sender, message.variables);
  }

  if (message.type === ExtensionMessageType.FetchRequest) {
    const { requestKey } = message.args.headers || {};
    const req = await fetch(message.url, { ...message.args });

    if (!requestKey) {
      return req;
    }

    return sendRequestResponse(requestKey, req.json(), sender, message.body);
  }

  if (message.type === ExtensionMessageType.DisableCompanion) {
    const cacheData = getLocalBootData();
    const settings = { ...cacheData?.settings, optOutCompanion: true };
    storage.setItem(
      BOOT_LOCAL_KEY,
      JSON.stringify({ ...cacheData, settings, lastModifier: 'companion' }),
    );
    return client.request(UPDATE_USER_SETTINGS_MUTATION, {
      data: {
        optOutCompanion: true,
      },
    });
  }

  if (message.type === ExtensionMessageType.RequestUpdate) {
    if (typeof browser.runtime.requestUpdateCheck === 'function') {
      const [status] = await browser.runtime.requestUpdateCheck();

      if (status === 'update_available') {
        browser.runtime.reload();
      }

      return { status };
    }

    return { status: 'no_update' };
  }

  return null;
}

browser.runtime.onMessage.addListener(handleMessages);

// since we are using V2 on FF / V3 on Chrome,
// we need to support both action (V3) & browserAction (V2) APIs
(browser.action || browser.browserAction).onClicked.addListener(() => {
  const url = browser.runtime.getURL('index.html?source=button');
  browser.tabs.create({ url, active: true });
});

browser.runtime.onInstalled.addListener(async (details) => {
  await Promise.all([browser.runtime.setUninstallURL(uninstall)]);

  if (details.reason === 'update') {
    await getContentScriptPermissionAndRegister();
  }

  if (details.reason === 'install') {
    browser.tabs.create({ url: install, active: true });
  }
});

browser.runtime.onStartup.addListener(async () => {
  await getContentScriptPermissionAndRegister();
});

if (typeof browser.runtime.requestUpdateCheck === 'undefined') {
  browser.runtime.onUpdateAvailable.addListener(() => {
    browser.runtime.reload();
  });
}
