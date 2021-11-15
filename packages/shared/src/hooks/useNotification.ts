import { useState } from 'react';

export default function useNotification(): {
  notification;
  notificationIndex;
  onMessage;
} {
  const [notification, setNotification] = useState<string>();
  const [notificationIndex, setNotificationIndex] = useState<number>();

  const onMessage = async (
    message: string,
    messageIndex?: number,
    timeout = 1000,
  ) => {
    setNotification(message);
    setNotificationIndex(messageIndex);
    if (timeout !== 0) {
      await new Promise((resolve) => setTimeout(resolve, timeout));
      setNotification(null);
      setNotificationIndex(null);
    }
  };

  return {
    notification,
    notificationIndex,
    onMessage,
  };
}
