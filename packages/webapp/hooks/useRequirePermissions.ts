import { Roles } from '../lib/user';
import { useContext, useEffect } from 'react';
import AuthContext from '../contexts/AuthContext';
import { useRouter } from 'next/router';

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
