import { useEffect } from 'react';
import Intercom from '@intercom/messenger-js-sdk';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';

const INTERCOM_APP_ID = process.env.NEXT_PUBLIC_INTERCOM_APP_ID;

export const useIntercom = (): void => {
  const { user } = useAuthContext();

  useEffect(() => {
    if (!INTERCOM_APP_ID) {
      return;
    }

    Intercom({
      app_id: INTERCOM_APP_ID,
      ...(user && {
        user_id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.createdAt
          ? Math.floor(new Date(user.createdAt).getTime() / 1000)
          : undefined,
      }),
    });
  }, [user]);
};
