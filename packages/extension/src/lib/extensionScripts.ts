import 'content-scripts-register-polyfill';
import { browser, ContentScripts } from 'webextension-polyfill-ts';
import { RequestContentScripts } from '@dailydotdev/shared/src/hooks';
import { useQuery } from 'react-query';
import { companionPermissionGrantedLink } from '@dailydotdev/shared/src/lib/constants';

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

const contentScriptKey = 'permission_key';

export const requestContentScripts: RequestContentScripts = (
  origin,
  client,
  trackEvent,
) => {
  return async () => {
    trackEvent({
      event_name: 'request content scripts',
      extra: JSON.stringify({ origin }),
    });

    const granted = await browser.permissions.request({
      origins: ['*://*/*'],
    });

    if (granted) {
      trackEvent({
        event_name: 'approve content scripts',
        extra: JSON.stringify({ origin }),
      });
      client.setQueryData(contentScriptKey, true);
      await registerBrowserContentScripts();

      window.open(companionPermissionGrantedLink, '_blank');
    } else {
      trackEvent({
        event_name: 'decline content scripts',
        extra: JSON.stringify({ origin }),
      });
    }

    return granted;
  };
};

export const useContentScriptStatus = (): {
  contentScriptGranted: boolean;
  isFetched: boolean;
} => {
  const { data: contentScriptGranted, isFetched } = useQuery(
    contentScriptKey,
    getContentScriptPermission,
    {
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      refetchIntervalInBackground: false,
    },
  );

  return { contentScriptGranted, isFetched };
};
