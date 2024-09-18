import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useLazyModal } from '../useLazyModal';
import { useAuthContext } from '../../contexts/AuthContext';
import { LazyModal } from '../../components/modals/common/types';

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
