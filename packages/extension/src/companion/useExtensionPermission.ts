import 'content-scripts-register-polyfill';
import { useContext, useMemo } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { browser, ContentScripts } from 'webextension-polyfill-ts';
import { companionPermissionGrantedLink } from '@dailydotdev/shared/src/lib/constants';
import AnalyticsContext from '@dailydotdev/shared/src/contexts/AnalyticsContext';

interface UseExtensionPermission {
  isFetched?: boolean;
  contentScriptGranted: boolean;
  requestContentScripts: () => Promise<boolean>;
}

const registerBrowserContentScripts =
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

interface UseExtensionPermissionProps {
  origin: string;
}

export const useExtensionPermission = ({
  origin,
}: UseExtensionPermissionProps): UseExtensionPermission => {
  const client = useQueryClient();
  const { trackEvent } = useContext(AnalyticsContext);
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

  const requestContentScripts = async () => {
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
    }

    return granted;
  };

  return useMemo(
    () => ({ contentScriptGranted, requestContentScripts, isFetched }),
    [contentScriptGranted, isFetched],
  );
};
