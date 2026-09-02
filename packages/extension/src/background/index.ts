import type { Runtime, Tabs } from 'webextension-polyfill';
import browser from 'webextension-polyfill';
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
import { frameEmbeddingPermissionBridgeTiming } from '@dailydotdev/shared/src/features/extensionEmbed/pagePermissionBridge';
import type { PermissionGrantResponse } from '@dailydotdev/shared/src/features/extensionEmbed/pagePermissionBridge';
import {
  getContentScriptPermissionAndRegister,
  registerEmbedTargetReadyContentScript,
} from '../lib/extensionScripts';
import {
  clearFrameEmbeddingSessionRules,
  disableFrameEmbeddingForTab,
  enableFrameEmbeddingForTab,
} from '../lib/frameEmbedding';
import { requestFrameEmbeddingPermissions } from '../lib/frameEmbeddingPermissions';

type ChromeRuntimeMessageSender = Runtime.MessageSender;
type ChromeSendResponse = (response?: unknown) => void;
type ChromeRuntimeApi = {
  onMessage: {
    addListener: (
      callback: (
        message: Record<string, unknown> & { type?: ExtensionMessageType },
        sender: ChromeRuntimeMessageSender,
        sendResponse: ChromeSendResponse,
      ) => boolean,
    ) => void;
  };
};

const errorLog = (...args: unknown[]): void => {
  // eslint-disable-next-line no-console
  console.error(...args);
};

const chromeRuntime = (
  globalThis as typeof globalThis & {
    chrome?: { runtime?: ChromeRuntimeApi };
  }
).chrome?.runtime;

const getTargetTabId = async (
  sender: Runtime.MessageSender,
): Promise<number> => {
  if (sender.tab?.id) {
    return sender.tab.id;
  }

  const [activeTab] = await browser.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });

  if (!activeTab?.id) {
    throw new Error('Expected active tab ID for frame embedding');
  }

  return activeTab.id;
};

const client = new GraphQLClient(graphqlUrl, { fetch: globalThis.fetch });

// Once-off signal set when the activation primer opens chrome://newtab. The
// new tab page consumes it on load to route a logged-out user into onboarding
// a single time. Kept in memory (no `storage` permission in prod) — the
// service worker stays alive across the brief open-tab → tab-load handoff; if
// it doesn't, the new tab simply falls back to its normal behavior.
let activateOnboardingPending = false;

const excludedCompanionOrigins = [
  'http://127.0.0.1:5002',
  'http://localhost',
  'https://daily.dev',
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

const sendBootData = async (_: unknown, tab?: Tabs.Tab) => {
  if (!tab?.url || !tab.id) {
    return;
  }

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
    getBootData({ app: 'companion', url: href }),
  ]);

  let settingsOutput = boot.settings;
  if (!cacheData?.user || !('providers' in cacheData?.user)) {
    settingsOutput = { ...settingsOutput, ...cacheData?.settings };
  }
  await browser.tabs.sendMessage(tab.id, {
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
  variables: unknown,
) => {
  if (!sender.tab?.id) {
    throw new Error('Expected sender tab ID for extension response');
  }

  const key = parseOrDefault(requestKey);
  const url = sender?.tab?.url?.split('?')[0];
  const [deviceId, res] = await Promise.all([getOrGenerateDeviceId(), req]);

  return browser.tabs.sendMessage(sender.tab.id, {
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
  // Handle frame-embedding messages first so they are not blocked by
  // the optional companion permission flow below.
  if (message.type === ExtensionMessageType.EnableFrameEmbeddingForTab) {
    const tabId = await getTargetTabId(sender);
    const result = await enableFrameEmbeddingForTab(tabId);

    if (!result.enabled) {
      return result;
    }

    try {
      await registerEmbedTargetReadyContentScript();
      return result;
    } catch (error) {
      errorLog('[frame-embed] failed to register target-ready script:', error);
      await disableFrameEmbeddingForTab(tabId).catch(() => undefined);
      return {
        ...result,
        enabled: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to register target-ready content script',
      };
    }
  }

  if (message.type === ExtensionMessageType.DisableFrameEmbeddingForTab) {
    const tabId = await getTargetTabId(sender);
    return disableFrameEmbeddingForTab(tabId);
  }

  if (message.type === ExtensionMessageType.PingFrameEmbeddingReady) {
    // Lightweight liveness check used by the content script to detect when
    // the service worker is back online after the post-grant runtime.reload.
    return { ready: true };
  }

  if (message.type === ExtensionMessageType.RequestOpenNewTab) {
    // Open a real new tab so Chrome shows the new-tab override-confirmation
    // bubble. The literal `chrome://newtab` URL is required —
    // `chrome.runtime.getURL('index.html')` loads the override page directly
    // via `chrome-extension://` and does NOT register as an NTP visit. We also
    // arm the once-off onboarding signal so the new tab can route a logged-out
    // user straight into onboarding a single time.
    try {
      activateOnboardingPending = true;
      await browser.tabs.create({ url: 'chrome://newtab', active: true });
      return { triggered: true };
    } catch (error) {
      activateOnboardingPending = false;
      return {
        triggered: false,
        error:
          error instanceof Error ? error.message : 'Failed to open new tab',
      };
    }
  }

  if (message.type === ExtensionMessageType.ConsumeActivateOnboarding) {
    // The new tab page asks once on load whether it should route into
    // onboarding. Reset immediately so this only ever fires for the tab the
    // primer just opened.
    const pending = activateOnboardingPending;
    activateOnboardingPending = false;
    return { pending };
  }

  if (message.type === ExtensionMessageType.RequestFrameEmbeddingPermissions) {
    // Relay path so the daily.dev page can drive chrome.permissions.request
    // without losing the user gesture. chrome.permissions.request is only
    // callable from extension pages, so the content script forwards here and
    // the user gesture from the originating click is preserved via the
    // Runtime.MessageSender.userGesture flag.
    try {
      const granted = await requestFrameEmbeddingPermissions();
      if (granted) {
        // Chromium needs a fresh extension context to pick up the just-granted
        // optional host permission for declarativeNetRequest — without it the
        // DNR session-rule call from frame.html hangs. Schedule the reload
        // on the next tick so the response can be delivered first; the
        // content script then polls until the new worker is up before
        // resolving the grant Promise on the page.
        globalThis.setTimeout(() => {
          browser.runtime.reload();
        }, frameEmbeddingPermissionBridgeTiming.reloadDelayMs);
      }
      const response: PermissionGrantResponse = {
        granted,
        willReload: granted,
      };
      return response;
    } catch (error) {
      const response: PermissionGrantResponse = {
        granted: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to request frame embedding permissions',
      };
      return response;
    }
  }

  await getContentScriptPermissionAndRegister();

  if (message.type === ExtensionMessageType.ContentLoaded) {
    await sendBootData(message, sender.tab);
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

if (!chromeRuntime?.onMessage) {
  throw new Error('Expected chrome.runtime.onMessage to be available');
}

// Keep the Chromium callback-style listener here because the frame embedding
// flow relies on responses surviving service-worker timing edge cases.
chromeRuntime.onMessage.addListener(
  (
    message: Record<string, unknown> & { type?: ExtensionMessageType },
    sender: ChromeRuntimeMessageSender,
    sendResponse: ChromeSendResponse,
  ) => {
    handleMessages(
      message as Record<string, unknown> & { type: ExtensionMessageType },
      sender,
    )
      .then((result) => sendResponse(result))
      .catch((error) => {
        errorLog('[bg] message handling failed:', error);
        sendResponse({
          enabled: false,
          error:
            error instanceof Error ? error.message : 'Unknown background error',
        });
      });

    return true;
  },
);

// since we are using V2 on FF / V3 on Chrome,
// we need to support both action (V3) & browserAction (V2) APIs
(browser.action || browser.browserAction).onClicked.addListener(() => {
  const url = browser.runtime.getURL('index.html?source=button');
  browser.tabs.create({ url, active: true });
});

browser.runtime.onInstalled.addListener(async (details) => {
  await browser.runtime.setUninstallURL(uninstall);

  if (details.reason === 'update') {
    await getContentScriptPermissionAndRegister();
  }

  if (details.reason === 'install') {
    browser.tabs.create({
      url: install,
      active: true,
    });
  }
});

browser.runtime.onStartup.addListener(async () => {
  await getContentScriptPermissionAndRegister();
});

browser.permissions.onRemoved.addListener(() => {
  clearFrameEmbeddingSessionRules().catch(() => undefined);
});

browser.tabs.onRemoved.addListener((tabId) => {
  disableFrameEmbeddingForTab(tabId).catch(() => undefined);
});

if (typeof browser.runtime.requestUpdateCheck === 'undefined') {
  browser.runtime.onUpdateAvailable.addListener(() => {
    browser.runtime.reload();
  });
}
