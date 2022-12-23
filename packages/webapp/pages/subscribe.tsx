import { useNotificationContext } from '@dailydotdev/shared/src/contexts/NotificationsContext';
import React from 'react';
import MainLayout from '../components/layouts/MainLayout';

function Subscribe(): React.ReactElement {
  const { requestPermission } = useNotificationContext();

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

          const permission = await requestPermission();

          if (permission === 'granted') {
            window.close();
          }
        }}
      >
        Test
      </span>
    </MainLayout>
  );
}

export default Subscribe;
