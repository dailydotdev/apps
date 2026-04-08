import browser from 'webextension-polyfill';
import { graphqlUrl } from '@dailydotdev/shared/src/lib/config';
import { GraphQLClient } from 'graphql-request';
import { UPDATE_USER_SETTINGS_MUTATION } from '@dailydotdev/shared/src/graphql/settings';
import { getLocalBootData } from '@dailydotdev/shared/src/contexts/BootProvider';
import { install, uninstall } from '@dailydotdev/shared/src/lib/constants';
import { BOOT_LOCAL_KEY } from '@dailydotdev/shared/src/contexts/common';
import { ExtensionMessageType } from '@dailydotdev/shared/src/lib/extension';
import { storageWrapper as storage } from '@dailydotdev/shared/src/lib/storageWrapper';

/**
 * Safari background worker — new tab only.
 * No companion, content scripts, or frame embedding.
 *
 * Auth happens directly on the extension's new tab page, so cookies
 * are in the extension's cookie jar and credentials: 'include' works.
 */

const client = new GraphQLClient(graphqlUrl, { fetch: globalThis.fetch });

async function handleMessages(
  message: Record<string, unknown> & { type: ExtensionMessageType },
) {
  if (message.type === ExtensionMessageType.GraphQLRequest) {
    return client.request(
      message.document as string,
      message.variables as Record<string, unknown>,
    );
  }

  if (message.type === ExtensionMessageType.FetchRequest) {
    const args = message.args as RequestInit & {
      headers?: Record<string, string>;
    };
    const res = await fetch(message.url as string, {
      ...args,
      credentials: 'include',
    });
    // 204/304 responses must not have a body
    const body =
      res.status === 204 || res.status === 304 ? '' : await res.text();
    return {
      status: res.status,
      headers: Object.fromEntries(res.headers.entries()),
      body,
    };
  }

  if (message.type === ExtensionMessageType.DisableCompanion) {
    const cacheData = getLocalBootData();
    const settings = { ...cacheData?.settings, optOutCompanion: true };
    storage.setItem(
      BOOT_LOCAL_KEY,
      JSON.stringify({ ...cacheData, settings, lastModifier: 'companion' }),
    );
    return client.request(UPDATE_USER_SETTINGS_MUTATION, {
      data: { optOutCompanion: true },
    });
  }

  if (message.type === ExtensionMessageType.RequestUpdate) {
    return { status: 'no_update' };
  }

  return null;
}

browser.runtime.onMessage.addListener(
  (message: Record<string, unknown> & { type?: ExtensionMessageType }) => {
    return handleMessages(
      message as Record<string, unknown> & { type: ExtensionMessageType },
    );
  },
);

(browser.action || browser.browserAction).onClicked.addListener(() => {
  const url = browser.runtime.getURL('index.html?source=button');
  browser.tabs.create({ url, active: true });
});

browser.runtime.onInstalled.addListener(async (details) => {
  await browser.runtime.setUninstallURL(uninstall);

  if (details.reason === 'install') {
    browser.tabs.create({ url: install, active: true });
  }
});
