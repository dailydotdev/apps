import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { LazyModal } from '../../components/modals/common/types';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLazyModal } from '../useLazyModal';

export const useStreakRecoverModal = (): void => {
  const { user } = useAuthContext();
  const { openModal } = useLazyModal();
  const {
    query: { streak_restore: streakRestore },
    replace,
    pathname,
  } = useRouter();

  useEffect(() => {
    if (!user || !streakRestore) {
      return;
    }
    openModal({
      type: LazyModal.RecoverStreak,
      props: {
        user,
        onAfterClose: () => replace(pathname),
      },
    });
  }, [openModal, pathname, replace, streakRestore, user]);
};
