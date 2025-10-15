import { useEffect, useRef, useCallback } from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';
import { useRouter } from 'next/router';
import { useLazyModal } from './useLazyModal';
import { LazyModal } from '../components/modals/common/types';

export interface UseDirtyFormOptions {
  preventNavigation?: boolean;
  onSave?: () => Promise<boolean> | boolean;
  onDiscard?: () => void;
}

export const useDirtyForm = <TFieldValues extends FieldValues = FieldValues>(
  formMethods: UseFormReturn<TFieldValues>,
  options: UseDirtyFormOptions = {},
) => {
  const { preventNavigation = true, onSave, onDiscard } = options;

  const router = useRouter();
  const { openModal } = useLazyModal();
  const allowNavigationRef = useRef(false);
  const pendingUrlRef = useRef<string | null>(null);

  const checkShouldPrevent = useCallback(() => {
    if (!preventNavigation) {
      return false;
    }
    return formMethods.formState.isDirty;
  }, [preventNavigation, formMethods.formState.isDirty]);

  const handleSave = useCallback(async () => {
    if (!onSave) {
      return;
    }

    const isValid = await formMethods.trigger();

    if (!isValid) {
      return;
    }

    const currentValues = formMethods.getValues();
    const saveResult = await onSave();

    if (saveResult) {
      formMethods.reset(currentValues);
      allowNavigationRef.current = true;

      if (pendingUrlRef.current) {
        router.push(pendingUrlRef.current);
        pendingUrlRef.current = null;
      }
    }
  }, [onSave, formMethods, router]);

  const handleDiscard = useCallback(() => {
    if (onDiscard) {
      onDiscard();
    } else {
      formMethods.reset();
    }

    allowNavigationRef.current = true;

    if (pendingUrlRef.current) {
      router.push(pendingUrlRef.current);
      pendingUrlRef.current = null;
    }
  }, [onDiscard, formMethods, router]);

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
          onSave: onSave ? handleSave : undefined,
        },
      });

      router.events.emit('routeChangeError');
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
    handleSave,
    onSave,
  ]);

  useEffect(() => {
    if (!preventNavigation) {
      return undefined;
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (checkShouldPrevent()) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [preventNavigation, checkShouldPrevent]);

  return {
    allowNavigation: () => {
      allowNavigationRef.current = true;
    },
    isNavigationPrevented: checkShouldPrevent,
    showDirtyFormModal: (targetUrl?: string) => {
      if (targetUrl) {
        pendingUrlRef.current = targetUrl;
      }

      openModal({
        type: LazyModal.DirtyForm,
        props: {
          onDiscard: handleDiscard,
          onSave: onSave ? handleSave : undefined,
        },
      });
    },
  };
};
