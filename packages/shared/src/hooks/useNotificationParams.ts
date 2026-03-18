import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { NotificationPromptSource } from '../lib/log';
import { stripLinkParameters } from '../lib/links';
import { usePushNotificationContext } from '../contexts/PushNotificationContext';
import { usePushNotificationMutation } from './notifications';

export const useNotificationParams = (): void => {
  const router = useRouter();
  const { isSubscribed } = usePushNotificationContext();
  const stripNotifyParam = useCallback(() => {
    const link = stripLinkParameters(window.location.href);
    return router.replace(link);
  }, [router]);
  const { onEnablePush } = usePushNotificationMutation({
    onPopupGranted: stripNotifyParam,
  });

  useEffect(() => {
    if (isSubscribed || !router?.query.notify) {
      return;
    }

    onEnablePush(NotificationPromptSource.NotificationItem).then(
      (isGranted) => {
        if (!isGranted) {
          return;
        }

        stripNotifyParam();
      },
    );
  }, [onEnablePush, isSubscribed, router?.query.notify, stripNotifyParam]);
};
