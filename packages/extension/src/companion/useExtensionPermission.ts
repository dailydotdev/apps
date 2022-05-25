import { useQuery, useQueryClient } from 'react-query';
import { useContext, useEffect } from 'react';
import { browser, ContentScripts } from 'webextension-polyfill-ts';
import { companionPermissionGrantedLink } from '@dailydotdev/shared/src/lib/constants';
import AnalyticsContext from '@dailydotdev/shared/src/contexts/AnalyticsContext';

interface UseExtensionPermission {
  contentScriptGranted: boolean;
  registerContentScripts: () => Promise<boolean>;
}

export const registerBrowserContentScripts =
  (): Promise<ContentScripts.RegisteredContentScript> =>
    browser.contentScripts.register({
      matches: ['<all_urls>'],
      css: [{ file: 'css/daily-companion-app.css' }],
      js: [
        { file: 'js/content.bundle.js' },
        { file: 'js/companion.bundle.js' },
      ],
    });

const contentScriptKey = 'permission_key';

interface UseExtensionPermissionProps {
  origin?: string;
}

export const useExtensionPermission = ({
  origin,
}: UseExtensionPermissionProps = {}): UseExtensionPermission => {
  const client = useQueryClient();
  const { trackEvent } = useContext(AnalyticsContext);
  const { data: contentScriptGranted } = useQuery(
    contentScriptKey,
    () => false,
  );

  useEffect(() => {
    const permissionCall = async () => {
      const permissions = await browser.permissions.contains({
        origins: ['*://*/*'],
      });
      if (permissions) {
        client.setQueryData(contentScriptKey, true);
      }
    };
    permissionCall();
  }, []);

  const registerContentScripts = async () => {
    trackEvent({
      event_name: 'content scripts request',
      extra: JSON.stringify({ origin }),
    });
    const granted = await browser.permissions.request({
      origins: ['*://*/*'],
    });

    if (granted) {
      trackEvent({ event_name: 'content scripts granted' });
      client.setQueryData(contentScriptKey, true);
      await registerBrowserContentScripts();
      window.open(companionPermissionGrantedLink, '_blank');
    }

    return granted;
  };

  return { contentScriptGranted, registerContentScripts };
};
