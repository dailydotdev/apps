import { useMemo } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { isSpecialUser } from '../../lib/user';

export type UseIsSpecialUserProps = {
  userId: string;
};

export type UseIsSpecialUser = boolean;

export const useIsSpecialUser = ({
  userId,
}: UseIsSpecialUserProps): UseIsSpecialUser => {
  const { user } = useAuthContext();

  return useMemo(() => {
    return isSpecialUser({
      userId,
      loggedUserId: user?.id,
    });
  }, [userId, user?.id]);
};
