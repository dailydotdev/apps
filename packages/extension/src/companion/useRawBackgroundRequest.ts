import { useEffect } from 'react';
import { browser } from 'webextension-polyfill-ts';

export const useRawBackgroundRequest = (
  command: (params: unknown) => void,
): void => {
  useEffect(() => {
    const handler = ({ queryKey, ...args }) => {
      if (!queryKey) {
        return;
      }

      command({ queryKey, ...args });
    };

    browser.runtime.onMessage.addListener(handler);

    return () => {
      browser.runtime.onMessage.removeListener(handler);
    };
  }, [command]);
};
