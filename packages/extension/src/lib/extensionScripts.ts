import browser from 'webextension-polyfill';
import { contentScriptKey } from '@dailydotdev/shared/src/hooks';
import {
  companionPermissionGrantedLink,
  isProduction,
} from '@dailydotdev/shared/src/lib/constants';
import { LogEvent as LogEventName } from '@dailydotdev/shared/src/lib/log';
import type { QueryClient } from '@tanstack/react-query';
import type { LogEvent } from '@dailydotdev/shared/src/hooks/log/useLogQueue';

export type RequestContentScripts = (data: {
  origin: string;
  skipRedirect?: boolean;
}) => Promise<boolean>;

export type CreateRequestContentScripts = (
  client: QueryClient,
  logEvent: (e: LogEvent) => void,
) => RequestContentScripts;

export const HOST_PERMISSIONS = isProduction
  ? ['https://daily.dev/*', 'https://*.daily.dev/*']
  : ['https://local.fylla.dev/*', 'https://*.local.fylla.dev/*'];

let hasInjectedScripts = false;
let hasRegisteredEmbedTargetReadyScript = false;
const companionScriptId = 'daily-companion-app';
const embedTargetReadyScriptId = 'daily-embed-target-ready';

export const registerEmbedTargetReadyContentScript =
  async (): Promise<void> => {
    if (browser.scripting === undefined) {
      if (hasRegisteredEmbedTargetReadyScript) {
        return;
      }

      await browser.contentScripts.register({
        matches: ['*://*/*'],
        allFrames: true,
        runAt: 'document_start',
        js: [{ file: 'js/embedTargetReady.bundle.js' }],
      });
      hasRegisteredEmbedTargetReadyScript = true;
      return;
    }

    const registeredScripts =
      await browser.scripting.getRegisteredContentScripts({
        ids: [embedTargetReadyScriptId],
      });
    if (
      registeredScripts.some((script) => script.id === embedTargetReadyScriptId)
    ) {
      return;
    }

    await browser.scripting.registerContentScripts([
      {
        id: embedTargetReadyScriptId,
        matches: ['*://*/*'],
        allFrames: true,
        runAt: 'document_start',
        js: ['js/embedTargetReady.bundle.js'],
      },
    ]);
  };

export const registerBrowserContentScripts = async (): Promise<void> => {
  if (browser.scripting === undefined) {
    // TODO: this needs to be switched to browser.scripting when bumping FF to V3 as well
    await browser.contentScripts.register({
      matches: ['*://*/*'],
      allFrames: false,
      css: [{ file: 'css/daily-companion-app.css' }],
      js: [
        { file: 'js/content.bundle.js' },
        { file: 'js/companion.bundle.js' },
      ],
    });
    await registerEmbedTargetReadyContentScript();
  } else {
    const registeredScripts =
      await browser.scripting.getRegisteredContentScripts({
        ids: [companionScriptId, embedTargetReadyScriptId],
      });
    const registeredIds = new Set(registeredScripts.map((script) => script.id));

    type RegisteredScript = Parameters<
      typeof browser.scripting.registerContentScripts
    >[0][number];
    const scriptsToRegister: RegisteredScript[] = [];
    if (!registeredIds.has(companionScriptId)) {
      scriptsToRegister.push({
        id: companionScriptId,
        matches: ['*://*/*'],
        allFrames: false,
        css: ['css/daily-companion-app.css'],
        js: ['js/content.bundle.js', 'js/companion.bundle.js'],
      });
    }
    if (!registeredIds.has(embedTargetReadyScriptId)) {
      // Runs in every subframe so we can capture the cross-origin
      // `DOMContentLoaded` of an article that the reader modal embeds. The
      // script itself bails immediately unless the top ancestor is a daily.dev
      // surface — see `embedTargetReady/index.ts`.
      scriptsToRegister.push({
        id: embedTargetReadyScriptId,
        matches: ['*://*/*'],
        allFrames: true,
        runAt: 'document_start',
        js: ['js/embedTargetReady.bundle.js'],
      });
    }

    if (!scriptsToRegister.length) {
      return;
    }

    await browser.scripting.registerContentScripts(scriptsToRegister);
  }
};

export const getContentScriptPermission = (): Promise<boolean> =>
  browser.permissions.contains({
    origins: ['*://*/*'],
  });

export const getContentScriptPermissionAndRegister =
  async (): Promise<void> => {
    const permission = await getContentScriptPermission();

    if (permission && !hasInjectedScripts) {
      await registerBrowserContentScripts();
      hasInjectedScripts = true;
    }
  };

export const requestContentScripts: CreateRequestContentScripts = (
  client,
  logEvent,
) => {
  return async ({
    origin,
    skipRedirect,
  }: {
    origin: string;
    skipRedirect?: boolean;
  }) => {
    logEvent({
      event_name: LogEventName.RequestContentScripts,
      extra: JSON.stringify({ origin }),
    });

    const granted = await browser.permissions.request({
      origins: ['*://*/*'],
    });

    if (granted) {
      logEvent({
        event_name: LogEventName.ApproveContentScripts,
        extra: JSON.stringify({ origin }),
      });
      client.setQueryData(contentScriptKey, true);
      await registerBrowserContentScripts();

      if (!skipRedirect) {
        window.open(companionPermissionGrantedLink, '_blank');
      }
    } else {
      logEvent({
        event_name: LogEventName.DeclineContentScripts,
        extra: JSON.stringify({ origin }),
      });
    }

    return granted;
  };
};

export const getHostPermission = (): Promise<boolean> =>
  browser.permissions.contains({
    origins: HOST_PERMISSIONS,
  });

export const promptUninstallExtension = (): Promise<void> =>
  browser.management.uninstallSelf({
    showConfirmDialog: true,
  });
