import usePersistentContext from './usePersistentContext';

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
  const [, setToastNotification] =
    usePersistentContext<ToastNotification>(TOAST_NOTIF_KEY);

  const displayToast = (
    message: string,
    { timer = 5000, onUndo }: NotifyOptionalProps = {},
  ) => setToastNotification({ message, timer, onUndo });

  return { displayToast };
};
