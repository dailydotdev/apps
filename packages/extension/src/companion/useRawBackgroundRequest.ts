import { useEffect } from 'react';
import { browser } from 'webextension-polyfill-ts';

export const useRawBackgroundRequest = (
  command: (params: unknown) => void,
): void => {
  useEffect(() => {
    const handler = ({ key, ...args }) => {
      if (!key) {
        return;
      }

      command({ key, ...args });
    };

    browser.runtime.onMessage.addListener(handler);

    return () => {
      browser.runtime.onMessage.removeListener(handler);
    };
  }, [command]);
};
