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

export interface ToastNotification {
  message: ReactNode;
  timer: number;
  subject?: ToastSubject;
  action?: {
    onClick: AnyFunction;
    buttonProps?: ButtonProps<'button'>;
    copy: string;
  };
}

export const TOAST_NOTIF_KEY = ['toast_notif'];

export type NotifyOptionalProps = Partial<
  Pick<ToastNotification, 'timer' | 'subject' | 'action'>
>;

export const useToastNotification = (): UseToastNotification => {
  const client = useQueryClient();
  const { data: toast } = useQuery<ToastNotification>({
    queryKey: TOAST_NOTIF_KEY,
    queryFn: () =>
      client.getQueryData<ToastNotification>(TOAST_NOTIF_KEY) || null,
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
      dismissToast: () => toast && setToastNotification({ ...toast, timer: 0 }),
    }),
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [toast],
  );
};
