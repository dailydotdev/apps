import { useEffect } from 'react';
import { QueryKey } from 'react-query';
import { browser } from 'webextension-polyfill-ts';
import { isQueryKeySame } from '@dailydotdev/shared/src/graphql/common';

export const useBackgroundRequest = (
  queryKey: QueryKey,
  command: (params: unknown) => void,
): void => {
  useEffect(() => {
    const handler = ({ queryKey: key, ...args }) => {
      if (!key) {
        return;
      }

      if (!isQueryKeySame(key, queryKey)) {
        return;
      }

      command({ queryKey: key, ...args });
    };

    browser.runtime.onMessage.addListener(handler);

    return () => {
      browser.runtime.onMessage.removeListener(handler);
    };
  }, []);
};
