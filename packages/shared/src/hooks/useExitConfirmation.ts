import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';

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

  useEffect(() => {
    if (!router.isReady) return null;

    const closeHandler = (e: BeforeUnloadEvent) => {
      if (!confirmRef.current || onValidateAction()) return;

      e.preventDefault();
      e.returnValue = message;
    };

    const routeHandler = () => {
      // eslint-disable-next-line no-restricted-globals,no-alert
      if (!confirmRef.current || onValidateAction() || confirm(message)) return;

      router.events.emit('routeChangeError');
      throw new Error('Cancelling navigation');
    };

    window.addEventListener('beforeunload', closeHandler);
    router.events.on('routeChangeStart', routeHandler);

    return () => {
      window.removeEventListener('beforeunload', closeHandler);
      router.events.off('routeChangeStart', routeHandler);
    };
  }, [confirmRef, onValidateAction, message, router]);

  return {
    onAskConfirmation: (value) => {
      confirmRef.current = value;
    },
  };
}
