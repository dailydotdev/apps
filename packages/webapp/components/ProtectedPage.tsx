import type { ReactElement, ReactNode } from 'react';
import React, { useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { AFTER_AUTH_PARAM } from '@dailydotdev/shared/src/components/auth/common';

export interface ProtectedPageProps {
  children: ReactNode;
  fallback?: ReactNode;
  shouldFallback?: boolean;
}

function ProtectedPage({
  children,
  fallback,
  shouldFallback,
}: ProtectedPageProps): ReactElement {
  const router = useRouter();
  const { tokenRefreshed, user } = useContext(AuthContext);

  useEffect(() => {
    if (tokenRefreshed && !user) {
      const params = new URLSearchParams(window.location.search);
      if (!params.get(AFTER_AUTH_PARAM)) {
        params.set(AFTER_AUTH_PARAM, window.location.pathname);
      }
      const redirectUrl = params.toString() ? `/?${params.toString()}` : '/';
      router.replace(redirectUrl);
    }
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenRefreshed, user]);

  return <>{shouldFallback ? fallback : children}</>;
}

export default ProtectedPage;
