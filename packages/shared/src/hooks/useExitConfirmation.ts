import { useRouter } from 'next/router';
import { useCallback, useEffect, useRef } from 'react';

interface ExitProps {
  message?: string;
  onValidateAction: () => boolean;
}

export interface UseExitConfirmation {
  onAskConfirmation: (value: boolean) => void;
}

export function useExitConfirmation({
  message = 'You have unsaved changes that will be lost if you leave the page',
  onValidateAction,
}: ExitProps): UseExitConfirmation {
  const confirmRef = useRef(true);
  const router = useRouter();

  const checkShouldAskConfirmation = useCallback(
    () => !confirmRef.current || onValidateAction(),
    [onValidateAction],
  );

  useEffect(() => {
    if (!router.isReady) {
      return undefined;
    }

    const closeHandler = (e: BeforeUnloadEvent) => {
      const shouldAskConfirmation = checkShouldAskConfirmation();

      if (shouldAskConfirmation) {
        return;
      }

      e.preventDefault();
      e.returnValue = message;
    };

    const routeHandler = () => {
      const shouldAskConfirmation = checkShouldAskConfirmation();

      // eslint-disable-next-line no-restricted-globals,no-alert
      if (shouldAskConfirmation || confirm(message)) {
        return;
      }

      router.events.emit('routeChangeError');
      throw new Error('Cancelling navigation');
    };

    window.addEventListener('beforeunload', closeHandler);
    router.events.on('routeChangeStart', routeHandler);

    return () => {
      window.removeEventListener('beforeunload', closeHandler);
      router.events.off('routeChangeStart', routeHandler);
    };
  }, [checkShouldAskConfirmation, message, router]);

  return {
    onAskConfirmation: (value) => {
      confirmRef.current = value;
    },
  };
}
