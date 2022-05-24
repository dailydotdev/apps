import { useQuery, useQueryClient } from 'react-query';
import { useEffect } from 'react';
import { browser } from 'webextension-polyfill-ts';
import { companionPermissionGrantedLink } from '@dailydotdev/shared/src/lib/constants';

interface UseExtensionPermission {
  contentScriptGranted: boolean;
  registerContentScripts: () => void;
}

const contentScriptKey = 'permission_key';
export const useExtensionPermission = (): UseExtensionPermission => {
  const client = useQueryClient();
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
    const granted = await browser.permissions.request({
      origins: ['*://*/*'],
    });

    if (granted) {
      client.setQueryData(contentScriptKey, true);
      await browser.contentScripts.register({
        matches: ['<all_urls>'],
        css: [{ file: 'css/daily-companion-app.css' }],
        js: [
          { file: 'js/content.bundle.js' },
          { file: 'js/companion.bundle.js' },
        ],
      });
      window.open(companionPermissionGrantedLink, '_blank');
    }

    return granted;
  };

  return { contentScriptGranted, registerContentScripts };
};
