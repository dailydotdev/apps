import { useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import type { Roles } from '../lib/user';
import AuthContext from '../contexts/AuthContext';

export default function useRequirePermissions(role: Roles): void {
  const router = useRouter();
  const { user, tokenRefreshed } = useContext(AuthContext);

  useEffect(() => {
    if (!tokenRefreshed) {
      return;
    }

    if (user?.roles?.includes(role)) {
      return;
    }

    router.replace('/');
  }, [role, router, tokenRefreshed, user]);
}
