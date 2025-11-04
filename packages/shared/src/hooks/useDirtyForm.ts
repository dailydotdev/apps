import { useEffect, useRef, useCallback } from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';
import { useRouter } from 'next/router';
import { useLazyModal } from './useLazyModal';
import { LazyModal } from '../components/modals/common/types';

export interface UseDirtyFormOptions {
  onSave: () => void;
  onDiscard?: () => void;
}

export const useDirtyForm = (
  formMethods: UseFormReturn<FieldValues>,
  options: UseDirtyFormOptions,
) => {
  const { onSave, onDiscard } = options;

  const router = useRouter();
  const { openModal } = useLazyModal();
  const allowNavigationRef = useRef(false);
  const pendingUrlRef = useRef<string | null>(null);

  const shouldPreventNavigation = useCallback(() => {
    return formMethods.formState.isDirty;
  }, [formMethods.formState.isDirty]);

  const handleDiscard = useCallback(() => {
    onDiscard?.();

    allowNavigationRef.current = true;

    if (pendingUrlRef.current) {
      router.push(pendingUrlRef.current);
      pendingUrlRef.current = null;
    }
  }, [onDiscard, router]);

  useEffect(() => {
    const handleRouteChangeStart = (url: string) => {
      if (
        allowNavigationRef.current ||
        !shouldPreventNavigation() ||
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
  }, [shouldPreventNavigation, router, openModal, handleDiscard, onSave]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (shouldPreventNavigation()) {
        e.preventDefault();
        // Legacy browser support to pop the alert when navigating away.
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [shouldPreventNavigation]);

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
    hasPendingNavigation: () => pendingUrlRef.current !== null,
    navigateToPending,
    save: onSave,
  };
};
