import { useMemo, useRef } from 'react';

interface UseNotification {
  hasPermission: boolean;
  requestPermission: () => Promise<NotificationPermission>;
}

const useNotification = (): UseNotification => {
  const hasPermission = useRef(
    globalThis.window?.Notification.permission === 'granted',
  );

  return useMemo(
    () => ({
      hasPermission: hasPermission?.current,
      requestPermission: async () =>
        globalThis.window?.Notification.requestPermission(),
    }),
    [],
  );
};

export default useNotification;
