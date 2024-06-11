import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { NotificationPromptSource } from '../lib/log';
import { stripLinkParameters } from '../lib/links';
import { usePushNotificationContext } from '../contexts/PushNotificationContext';
import { usePushNotificationMutation } from './notifications';

export const useNotificationParams = (): void => {
  const router = useRouter();
  const { isSubscribed } = usePushNotificationContext();
  const { onEnablePush } = usePushNotificationMutation();

  useEffect(() => {
    if (isSubscribed || !router?.query.notify) {
      return;
    }

    onEnablePush(NotificationPromptSource.NotificationItem).then(
      (isGranted) => {
        if (!isGranted) {
          return;
        }

        const link = stripLinkParameters(window.location.href);
        router.replace(link);
      },
    );
  }, [onEnablePush, isSubscribed, router]);
};
