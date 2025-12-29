import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import Intercom, { boot, shutdown } from '@intercom/messenger-js-sdk';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { apiUrl } from '@dailydotdev/shared/src/lib/config';

const INTERCOM_APP_ID = process.env.NEXT_PUBLIC_INTERCOM_APP_ID;

// 9 minutes stale time to refetch before 10 minute JWT expiry
const JWT_STALE_TIME = 9 * 60 * 1000;

export const useIntercom = (): void => {
  const { user } = useAuthContext();
  const bootedWithJwtRef = useRef(false);

  // Fetch JWT in background for authenticated users
  const { data: jwtData } = useQuery({
    queryKey: ['intercom-jwt', user?.id],
    queryFn: async () => {
      const res = await fetch(`${apiUrl}/integrations/intercom/jwt`, {
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error('Failed to fetch Intercom JWT');
      }
      return res.json();
    },
    enabled: !!user && !!INTERCOM_APP_ID,
    staleTime: JWT_STALE_TIME,
  });

  // Initial boot - non-blocking, just app_id
  useEffect(() => {
    if (!INTERCOM_APP_ID) {
      return;
    }

    Intercom({
      app_id: INTERCOM_APP_ID,
    });
  }, []);

  // Re-boot with JWT once available
  useEffect(() => {
    if (!INTERCOM_APP_ID || !jwtData?.jwt) {
      return;
    }

    // Shutdown existing session to avoid conflicts
    if (bootedWithJwtRef.current) {
      shutdown();
    }

    boot({
      app_id: INTERCOM_APP_ID,
      intercom_user_jwt: jwtData.jwt,
    });

    bootedWithJwtRef.current = true;
  }, [jwtData?.jwt]);

  // Shutdown on unmount
  useEffect(() => {
    return () => {
      if (INTERCOM_APP_ID) {
        shutdown();
      }
    };
  }, []);
};
