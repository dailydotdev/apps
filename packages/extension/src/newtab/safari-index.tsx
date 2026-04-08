import React from 'react';
import { createRoot } from 'react-dom/client';
import '@dailydotdev/shared/src/styles/globals.css';
import { getLocalBootData } from '@dailydotdev/shared/src/contexts/BootProvider';
import type { BootCacheData } from '@dailydotdev/shared/src/lib/boot';
import {
  applyTheme,
  themeModes,
} from '@dailydotdev/shared/src/contexts/SettingsContext';
import browser from 'webextension-polyfill';
import { ExtensionMessageType } from '@dailydotdev/shared/src/lib/extension';
import { apiUrl } from '@dailydotdev/shared/src/lib/config';
import SafariApp from './SafariApp';

declare global {
  interface Window {
    windowLoaded: boolean;
  }
}

/**
 * Proxy API fetch calls through the background service worker to avoid
 * CORS issues. Safari doesn't auto-grant host_permissions on install,
 * so direct fetch from the extension page gets blocked. The background
 * service worker is not subject to CORS restrictions.
 */
const originalFetch = globalThis.fetch;

function resolveUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') {
    return input;
  }

  if (input instanceof URL) {
    return input.toString();
  }

  return input.url;
}

function normalizeHeaders(
  raw: HeadersInit | undefined,
): Record<string, string> {
  const headers: Record<string, string> = {};

  if (!raw) {
    return headers;
  }

  if (raw instanceof Headers) {
    raw.forEach((v, k) => {
      headers[k] = v;
    });
  } else if (Array.isArray(raw)) {
    raw.forEach(([k, v]) => {
      headers[k] = v;
    });
  } else {
    Object.assign(headers, raw);
  }

  return headers;
}

globalThis.fetch = async (
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> => {
  const url = resolveUrl(input);

  if (!url.startsWith(apiUrl)) {
    return originalFetch(input, init);
  }

  const { method, body } = init || {};
  const headers = normalizeHeaders(init?.headers);

  try {
    const result = (await browser.runtime.sendMessage({
      type: ExtensionMessageType.FetchRequest,
      url,
      args: { method, body, headers },
    })) as { status: number; headers: Record<string, string>; body: string };

    const noBody = result.status === 204 || result.status === 304;
    return new Response(noBody ? null : result.body, {
      status: result.status,
      headers: result.headers,
    });
  } catch {
    return originalFetch(input, init);
  }
};

window.addEventListener(
  'load',
  () => {
    window.windowLoaded = true;
  },
  {
    once: true,
  },
);

const root = createRoot(document.getElementById('__next'));

const renderApp = (data?: BootCacheData) => {
  root.render(<SafariApp localBootData={data} />);
};

(() => {
  const data = getLocalBootData();

  if (data?.settings?.theme) {
    applyTheme(themeModes[data.settings.theme]);
  }

  renderApp(data);
})();
