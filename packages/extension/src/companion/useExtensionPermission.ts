import { useEffect, useState } from 'react';
import { browser } from 'webextension-polyfill-ts';

interface UseExtensionPermission {
  contentScriptGranted: boolean;
  registerContentScripts: () => void;
}

export const useExtensionPermission = (): UseExtensionPermission => {
  const [contentScriptGranted, setContentScriptGranted] = useState(false);

  useEffect(() => {
    const permissionCall = async () => {
      const permissions = await browser.permissions.contains({
        origins: ['*://*/*'],
      });
      if (permissions) {
        setContentScriptGranted(true);
      }
    };
    permissionCall();
  }, []);

  const registerContentScripts = async () => {
    const granted = await browser.permissions.request({
      origins: ['*://*/*'],
    });

    if (granted) {
      setContentScriptGranted(true);
      await browser.contentScripts.register({
        matches: ['<all_urls>'],
        css: [{ file: 'css/daily-companion-app.css' }],
        js: [
          { file: 'js/content.bundle.js' },
          { file: 'js/companion.bundle.js' },
        ],
      });
    }

    return granted;
  };

  return { contentScriptGranted, registerContentScripts };
};
