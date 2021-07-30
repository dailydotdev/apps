import { useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Roles } from '../lib/user';
import AuthContext from '../contexts/AuthContext';

export default function useRequirePermissions(role: Roles): void {
  const router = useRouter();
  const { user, tokenRefreshed } = useContext(AuthContext);

  useEffect(() => {
    if (tokenRefreshed) {
      if (!(user?.roles.indexOf(role) >= 0)) {
        router.replace('/');
      }
    }
  }, [tokenRefreshed, user]);
}
