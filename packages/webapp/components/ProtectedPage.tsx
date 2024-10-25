import React, { ReactElement, ReactNode, useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';

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
      router.replace('/');
    }
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenRefreshed, user]);

  return <>{shouldFallback ? fallback : children}</>;
}

export default ProtectedPage;
