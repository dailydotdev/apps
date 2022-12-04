import { useMemo, useState } from 'react';

interface UseNotification {
  hasPermission: boolean;
  requestPermission: () => Promise<NotificationPermission>;
}

const useNotification = (): UseNotification => {
  const [hasPermission, setHasPermission] = useState(
    globalThis.window?.Notification.permission === 'granted',
  );

  return useMemo(
    () => ({
      hasPermission,
      requestPermission: async () => {
        const result =
          await globalThis.window?.Notification.requestPermission();
        setHasPermission(result === 'granted');

        return result;
      },
    }),
    [],
  );
};

export default useNotification;
