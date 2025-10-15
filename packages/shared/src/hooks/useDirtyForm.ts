import { useEffect, useRef, useCallback } from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';
import { useRouter } from 'next/router';
import { useLazyModal } from './useLazyModal';
import { LazyModal } from '../components/modals/common/types';

export interface UseDirtyFormOptions {
  preventNavigation?: boolean;
  onSave?: () => Promise<boolean> | boolean;
  onDiscard?: () => void;
  successUrl?: string | (() => string);
}

export const useDirtyForm = <TFieldValues extends FieldValues = FieldValues>(
  formMethods: UseFormReturn<TFieldValues>,
  options: UseDirtyFormOptions = {},
) => {
  const { preventNavigation = true, onSave, onDiscard, successUrl } = options;

  const router = useRouter();
  const { openModal } = useLazyModal();
  const allowNavigationRef = useRef(false);
  const pendingUrlRef = useRef<string | null>(null);
  const isModalSaveRef = useRef(false);

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

    isModalSaveRef.current = true;
    const isValid = await formMethods.trigger();

    if (!isValid) {
      isModalSaveRef.current = false;
      return;
    }

    const currentValues = formMethods.getValues();
    const saveResult = await onSave();

    if (saveResult) {
      formMethods.reset(currentValues);
      allowNavigationRef.current = true;

      // navigate to intercepted URL for modal saves
      if (pendingUrlRef.current) {
        router.push(pendingUrlRef.current);
        pendingUrlRef.current = null;
      }
    }

    isModalSaveRef.current = false;
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
      // this throw is necessary to stop the route change.
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
        // for old browsers, this is required for the dialogue to appear if they try to refresh or close tab.
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [preventNavigation, checkShouldPrevent]);

  // Direct save from form (not modal)
  const save = useCallback(async () => {
    if (!onSave) {
      return false;
    }

    const isValid = await formMethods.trigger();

    if (!isValid) {
      return false;
    }

    const currentValues = formMethods.getValues();
    const saveResult = await onSave();

    if (saveResult) {
      formMethods.reset(currentValues);
      allowNavigationRef.current = true;

      // Navigate to success URL for direct saves
      if (successUrl) {
        const url =
          typeof successUrl === 'function' ? successUrl() : successUrl;
        router.push(url);
      }
    }

    return saveResult;
  }, [onSave, formMethods, router, successUrl]);

  return {
    allowNavigation: () => {
      allowNavigationRef.current = true;
    },
    isNavigationPrevented: checkShouldPrevent,
    save,
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
