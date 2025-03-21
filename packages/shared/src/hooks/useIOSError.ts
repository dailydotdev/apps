import { useEffect } from 'react';
import { isIOSNative, promisifyEventListener } from '../lib/func';
import { useToastNotification } from './useToastNotification';

export type GenericIOSError = {
  error: string;
  description?: string;
};

export const useIOSError = (): void => {
  const { displayToast } = useToastNotification();
  const eventName = 'generic-error';

  useEffect(() => {
    if (!isIOSNative()) {
      return () => {};
    }

    promisifyEventListener<void, GenericIOSError>(
      eventName,
      ({ detail }) => {
        if (detail.description) {
          displayToast(detail.description);
        }
      },
      { once: false },
    );

    return () => {
      globalThis?.eventControllers?.[eventName]?.abort();
    };
  }, [displayToast]);
};
