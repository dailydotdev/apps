import 'content-scripts-register-polyfill';
import browser, { ContentScripts } from 'webextension-polyfill';
import {
  CreateRequestContentScripts,
  contentScriptKey,
} from '@dailydotdev/shared/src/hooks';
import { companionPermissionGrantedLink } from '@dailydotdev/shared/src/lib/constants';
import { AnalyticsEvent } from '@dailydotdev/shared/src/lib/analytics';

export const registerBrowserContentScripts =
  (): Promise<ContentScripts.RegisteredContentScript> =>
    browser.contentScripts.register({
      matches: ['*://*/*'],
      css: [{ file: 'css/daily-companion-app.css' }],
      js: [
        { file: 'js/content.bundle.js' },
        { file: 'js/companion.bundle.js' },
      ],
    });

export const getContentScriptPermission = (): Promise<boolean> =>
  browser.permissions.contains({
    origins: ['*://*/*'],
  });

let hasInjectedScripts = false;
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
