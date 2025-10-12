import { useEffect, useRef } from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { useLazyModal } from './useLazyModal';
import { LazyModal } from '../components/modals/common/types';

type UseHookFormProps = {
  defaultValues: FieldValues;
  preventNavigation?: boolean;
  onSubmit?: (
    data: FieldValues,
    methods: UseFormReturn<FieldValues>,
  ) => void | Promise<void>;
};

const useHookForm = ({
  defaultValues,
  preventNavigation = false,
  onSubmit,
}: UseHookFormProps) => {
  // Keep the typeof.
  const methods = useForm<typeof defaultValues>({
    defaultValues,
  });

  const router = useRouter();
  const { openModal, closeModal } = useLazyModal();
  const allowNavigationRef = useRef(false);
  const pendingUrlRef = useRef<string | null>(null);

  // Handle navigation interception when form is dirty
  useEffect(() => {
    if (!preventNavigation) {
      return undefined;
    }

    const handleRouteChangeStart = (url: string) => {
      // Allow navigation if flag is set or form is not dirty
      if (
        allowNavigationRef.current ||
        !methods.formState.isDirty ||
        url === router.asPath
      ) {
        allowNavigationRef.current = false;
        return;
      }

      // Store the pending URL and show modal
      pendingUrlRef.current = url;
      openModal({
        type: LazyModal.DirtyForm,
        props: {
          onDiscard: () => {
            methods.reset();
            closeModal();
            allowNavigationRef.current = true;
            if (pendingUrlRef.current) {
              router.push(pendingUrlRef.current);
            }
          },
          onSave: onSubmit
            ? async () => {
                // Use handleSubmit to trigger validation and submission
                await methods.handleSubmit((data) => onSubmit(data, methods))();
                closeModal();
                allowNavigationRef.current = true;
                if (pendingUrlRef.current) {
                  router.push(pendingUrlRef.current);
                }
              }
            : undefined,
        },
      });

      // Abort the navigation
      router.events.emit('routeChangeError');
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw 'Route change aborted.';
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
    };
  }, [preventNavigation, methods, router, openModal, closeModal, onSubmit]);

  // Handle browser beforeunload when form is dirty
  useEffect(() => {
    if (!preventNavigation) {
      return undefined;
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (methods.formState.isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [preventNavigation, methods.formState.isDirty]);

  return {
    methods,
    handleSubmit: onSubmit
      ? methods.handleSubmit((data) => onSubmit(data, methods))
      : methods.handleSubmit(() => {}),
  };
};

export default useHookForm;
