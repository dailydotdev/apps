import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { NotificationPromptSource } from '../lib/analytics';
import { useNotificationContext } from '../contexts/NotificationsContext';
import { stripLinkParameters } from '../lib/links';

export const usePageParams = (): void => {
  const router = useRouter();
  const { isSubscribed, onTogglePermission } = useNotificationContext();

  useEffect(() => {
    if (isSubscribed || !router?.query.notify) return;

    onTogglePermission(NotificationPromptSource.NotificationItem).then(
      (permission) => {
        const isGranted = permission === 'granted';

        if (!isGranted) return;

        const link = stripLinkParameters(window.location.href);
        router.replace(link);
      },
    );
  }, [onTogglePermission, isSubscribed, router]);
};
