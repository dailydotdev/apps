import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { ButtonProps } from '../components/buttons/Button';

type AnyFunction = (() => Promise<unknown>) | (() => unknown);

interface UseToastNotification {
  displayToast: (message: ReactNode, params?: NotifyOptionalProps) => void;
  dismissToast: () => void;
  subject?: ToastSubject;
}

export enum ToastSubject {
  Feed = 'feed',
  PostContent = 'post-content',
  OpportunityScreeningQuestions = 'opportunity-screening-questions',
}

// Semantic variant — drives the leading status icon + colour. Defaults to
// `Default` (neutral, no icon) so existing callers are unaffected.
export enum ToastType {
  Default = 'default',
  Success = 'success',
  Error = 'error',
  Warning = 'warning',
  Info = 'info',
  Loading = 'loading',
}

export interface ToastNotification {
  message: ReactNode;
  timer: number;
  // Named `variant` (not `type`) on purpose: a bare `type` field collides with
  // `MouseEvent.type` (string) and breaks callers that pass a copy/share
  // handler — which extends NotifyOptionalProps — directly as an onClick.
  variant?: ToastType;
  subject?: ToastSubject;
  persistent?: boolean;
  onClose?: AnyFunction;
  action?: {
    onClick: AnyFunction;
    buttonProps?: ButtonProps<'button'>;
    copy: string;
  };
}

export const TOAST_NOTIF_KEY = ['toast_notif'];

export type NotifyOptionalProps = Partial<
  Pick<
    ToastNotification,
    'timer' | 'variant' | 'subject' | 'persistent' | 'onClose' | 'action'
  >
>;

export const useToastNotification = (): UseToastNotification => {
  const client = useQueryClient();
  const { data: toast } = useQuery<ToastNotification | null>({
    queryKey: TOAST_NOTIF_KEY,
    queryFn: () =>
      client.getQueryData<ToastNotification | null>(TOAST_NOTIF_KEY) ?? null,
    initialData: () =>
      client.getQueryData<ToastNotification | null>(TOAST_NOTIF_KEY) ?? null,
  });
  const setToastNotification = (data: ToastNotification) =>
    client.setQueryData(TOAST_NOTIF_KEY, data);

  const displayToast = (
    message: ReactNode,
    { timer = 5000, ...props }: NotifyOptionalProps = {},
  ) => setToastNotification({ message, timer, ...props });

  return useMemo(
    () => ({
      displayToast,
      subject: toast?.subject,
      dismissToast: () => {
        if (!toast) {
          return;
        }

        setToastNotification({ ...toast, timer: 0 });
      },
    }),
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [toast],
  );
};
