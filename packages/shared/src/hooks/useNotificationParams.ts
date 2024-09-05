import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { usePushNotificationContext } from '../contexts/PushNotificationContext';
import { stripLinkParameters } from '../lib/links';
import { NotificationPromptSource } from '../lib/log';
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
