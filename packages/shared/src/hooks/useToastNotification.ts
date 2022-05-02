import { useQuery, useQueryClient } from 'react-query';

type AnyFunction = (() => Promise<unknown>) | (() => unknown);

interface UseToastNotification {
  displayToast: (message: string, params?: NotifyOptionalProps) => void;
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
}

export const TOAST_NOTIF_KEY = 'toast_notif';

interface NotifyOptionalProps {
  timer?: number;
  subject?: ToastSubject;
  onUndo?: AnyFunction;
}

export const useToastNotification = (): UseToastNotification => {
  const client = useQueryClient();
  const { data: toast } = useQuery<ToastNotification>(TOAST_NOTIF_KEY);
  const setToastNotification = (data: ToastNotification) =>
    client.setQueryData(TOAST_NOTIF_KEY, data);

  const displayToast = (
    message: string,
    { timer = 5000, ...props }: NotifyOptionalProps = {},
  ) => setToastNotification({ message, timer, ...props });

  return { displayToast, subject: toast?.subject };
};
