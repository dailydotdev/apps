import 'content-scripts-register-polyfill';
import { browser, ContentScripts } from 'webextension-polyfill-ts';
import { RequestContentScripts } from '@dailydotdev/shared/src/hooks/useExtensionPermission';
import { useContext } from 'react';
import AnalyticsContext from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import { useQuery, useQueryClient } from 'react-query';
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
  onPermission,
) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { trackEvent } = useContext(AnalyticsContext);
  const client = useQueryClient();

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

      if (onPermission) {
        await onPermission(true);
      } else {
        window.open(companionPermissionGrantedLink, '_blank');
      }
    } else {
      trackEvent({
        event_name: 'decline content scripts',
        extra: JSON.stringify({ origin }),
      });

      if (onPermission) onPermission(false);
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
