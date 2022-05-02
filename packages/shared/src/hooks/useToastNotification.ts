import { useQueryClient } from 'react-query';

type AnyFunction = (() => Promise<unknown>) | (() => unknown);

interface UseToastNotification {
  displayToast: (message: string, params?: NotifyOptionalProps) => void;
}

export interface ToastNotification {
  message: string;
  timer: number;
  onUndo?: AnyFunction;
}

export const TOAST_NOTIF_KEY = 'toast_notif';

interface NotifyOptionalProps {
  timer?: number;
  onUndo?: AnyFunction;
}

export const useToastNotification = (): UseToastNotification => {
  const client = useQueryClient();
  const setToastNotification = (data: ToastNotification) =>
    client.setQueryData(TOAST_NOTIF_KEY, data);

  const displayToast = (
    message: string,
    { timer = 5000, onUndo }: NotifyOptionalProps = {},
  ) => setToastNotification({ message, timer, onUndo });

  return { displayToast };
};
