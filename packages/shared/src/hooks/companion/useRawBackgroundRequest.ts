import { useEffect, useState } from 'react';
import { Browser } from 'webextension-polyfill';
import { EmptyObjectLiteral } from '../../lib/kratos';
import { useRequestProtocol } from '../useRequestProtocol';

export const useRawBackgroundRequest = (
  command: (params: EmptyObjectLiteral) => void,
): void => {
  const { isCompanion } = useRequestProtocol();
  const [browser, setBrowser] = useState<Browser>();

  useEffect(() => {
    if (!isCompanion) {
      return;
    }

    import('webextension-polyfill').then((mod) => setBrowser(mod.default));
  }, [isCompanion]);

  useEffect(() => {
    if (!browser) {
      return undefined;
    }

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
  }, [command, browser]);
};
