import browser from 'webextension-polyfill';
import {
  CreateRequestContentScripts,
  contentScriptKey,
} from '@dailydotdev/shared/src/hooks';
import { companionPermissionGrantedLink } from '@dailydotdev/shared/src/lib/constants';
import { AnalyticsEvent } from '@dailydotdev/shared/src/lib/analytics';

export const HOST_PERMISSIONS = [
  'https://daily.dev/*',
  'https://*.daily.dev/*',
];

let hasInjectedScripts = false;

export const registerBrowserContentScripts = async (): Promise<void> => {
  if (hasInjectedScripts) {
    return null;
  }

  await browser.scripting.registerContentScripts([
    {
      id: `companion-${Date.now()}`,
      matches: ['*://*/*'],
      css: ['css/daily-companion-app.css'],
      js: ['js/content.bundle.js', 'js/companion.bundle.js'],
    },
  ]);

  hasInjectedScripts = true;

  return null;
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
  trackEvent,
) => {
  return async ({
    origin,
    skipRedirect,
  }: {
    origin: string;
    skipRedirect?: boolean;
  }) => {
    trackEvent({
      event_name: AnalyticsEvent.RequestContentScripts,
      extra: JSON.stringify({ origin }),
    });

    const granted = await browser.permissions.request({
      origins: ['*://*/*'],
    });

    if (granted) {
      trackEvent({
        event_name: AnalyticsEvent.ApproveContentScripts,
        extra: JSON.stringify({ origin }),
      });
      client.setQueryData(contentScriptKey, true);
      await registerBrowserContentScripts();

      if (!skipRedirect) {
        window.open(companionPermissionGrantedLink, '_blank');
      }
    } else {
      trackEvent({
        event_name: AnalyticsEvent.DeclineContentScripts,
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

export const getHostPermissionAndRegister = async (): Promise<boolean> => {
  const permission = await getHostPermission();

  if (!permission) {
    return await browser.permissions.request({ origins: HOST_PERMISSIONS });
  }

  return permission;
};
