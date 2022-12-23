import {
  ENABLE_NOTIFICATION_WINDOW_KEY,
  useNotificationContext,
} from '@dailydotdev/shared/src/contexts/NotificationsContext';
import { postWindowMessage } from '@dailydotdev/shared/src/lib/func';
import React from 'react';
import MainLayout from '../components/layouts/MainLayout';

function Subscribe(): React.ReactElement {
  const { hasPermission, isInitialized, onTogglePermission } =
    useNotificationContext();

  if (!isInitialized) {
    return null;
  }

  return (
    <MainLayout
      className="flex flex-col flex-1 justify-center items-center h-screen"
      showOnlyLogo
    >
      <span
        ref={async (el) => {
          if (!el) {
            return;
          }

          if (hasPermission) {
            postWindowMessage(ENABLE_NOTIFICATION_WINDOW_KEY, {
              permission: 'granted',
            });
            window.close();
            return;
          }

          const permission = await onTogglePermission();
          postWindowMessage(ENABLE_NOTIFICATION_WINDOW_KEY, { permission });

          if (permission === 'granted') {
            setTimeout(window.close, 2000);
          }
        }}
      >
        Test
      </span>
    </MainLayout>
  );
}

export default Subscribe;
