import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { NotificationPromptSource } from '../lib/analytics';
import { useNotificationContext } from '../contexts/NotificationsContext';
import { stripLinkParameters } from '../lib/links';

export const useNotificationParams = (): void => {
  const router = useRouter();
  const {
    push: { isSubscribed, onEnablePush },
  } = useNotificationContext();

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
