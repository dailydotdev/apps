import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

type AnyFunction = (() => Promise<unknown>) | (() => unknown);

interface UseToastNotification {
  displayToast: (message: string, params?: NotifyOptionalProps) => void;
  dismissToast: () => void;
  subject?: ToastSubject;
}

export enum ToastSubject {
  Feed = 'feed',
  PostContent = 'post-content',
}

export interface ToastNotification {
  message: string;
  timer: number;
  subject?: ToastSubject;
  onUndo?: AnyFunction;
  undoCopy?: string;
}

export const TOAST_NOTIF_KEY = ['toast_notif'];

export type NotifyOptionalProps = Partial<
  Pick<ToastNotification, 'timer' | 'subject' | 'onUndo' | 'undoCopy'>
>;

export const useToastNotification = (): UseToastNotification => {
  const client = useQueryClient();
  const { data: toast } = useQuery<ToastNotification>(
    TOAST_NOTIF_KEY,
    () => client.getQueryData<ToastNotification>(TOAST_NOTIF_KEY) || null,
  );
  const setToastNotification = (data: ToastNotification) =>
    client.setQueryData(TOAST_NOTIF_KEY, data);

  const displayToast = (
    message: string,
    { timer = 5000, ...props }: NotifyOptionalProps = {},
  ) => setToastNotification({ message, timer, ...props });

  return useMemo(
    () => ({
      displayToast,
      subject: toast?.subject,
      dismissToast: () => toast && setToastNotification({ ...toast, timer: 0 }),
    }),
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [toast],
  );
};
