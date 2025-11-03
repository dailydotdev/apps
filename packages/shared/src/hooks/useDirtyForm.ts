import { useEffect, useRef, useCallback } from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';
import { useRouter } from 'next/router';
import { useLazyModal } from './useLazyModal';
import { LazyModal } from '../components/modals/common/types';

export interface UseDirtyFormOptions {
  preventNavigation?: boolean;
  onSave: () => void;
  onDiscard?: () => void;
}

export const useDirtyForm = <TFieldValues extends FieldValues = FieldValues>(
  formMethods: UseFormReturn<TFieldValues>,
  options: UseDirtyFormOptions,
) => {
  const { preventNavigation = true, onSave, onDiscard } = options;

  const router = useRouter();
  const { openModal } = useLazyModal();
  const allowNavigationRef = useRef(false);
  const pendingUrlRef = useRef<string | null>(null);

  const checkShouldPrevent = useCallback(() => {
    return preventNavigation && formMethods.formState.isDirty;
  }, [preventNavigation, formMethods.formState.isDirty]);

  const handleDiscard = useCallback(() => {
    onDiscard?.();

    allowNavigationRef.current = true;

    if (pendingUrlRef.current) {
      router.push(pendingUrlRef.current);
      pendingUrlRef.current = null;
    }
  }, [onDiscard, router]);

  useEffect(() => {
    if (!preventNavigation) {
      return undefined;
    }

    const handleRouteChangeStart = (url: string) => {
      if (
        allowNavigationRef.current ||
        !checkShouldPrevent() ||
        url === router.asPath
      ) {
        allowNavigationRef.current = false;
        return;
      }

      pendingUrlRef.current = url;

      openModal({
        type: LazyModal.DirtyForm,
        props: {
          onDiscard: handleDiscard,
          onSave,
        },
      });

      router.events.emit('routeChangeError');
      // This error is necessary to abort the route change, and suggested approach. We don't want throw an actual error object.
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw 'Route change aborted.';
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
    };
  }, [
    preventNavigation,
    checkShouldPrevent,
    router,
    openModal,
    handleDiscard,
    onSave,
  ]);

  useEffect(() => {
    if (!preventNavigation) {
      return undefined;
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (checkShouldPrevent()) {
        e.preventDefault();
        // Legacy browser support to pop the alert when navigating away.
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [preventNavigation, checkShouldPrevent]);

  const navigateToPending = useCallback(() => {
    if (pendingUrlRef.current) {
      router.push(pendingUrlRef.current);
      pendingUrlRef.current = null;
    }
  }, [router]);

  return {
    allowNavigation: () => {
      allowNavigationRef.current = true;
    },
    blockNavigation: () => {
      allowNavigationRef.current = false;
    },
    resetNavigation: () => {
      allowNavigationRef.current = false;
      pendingUrlRef.current = null;
    },
    isNavigationBlocked: checkShouldPrevent,
    hasPendingNavigation: () => pendingUrlRef.current !== null,
    navigateToPending,
    save: onSave,
  };
};
