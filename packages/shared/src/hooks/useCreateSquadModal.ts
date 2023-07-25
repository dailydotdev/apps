import { useRouter } from 'next/router';
import { useContext, useEffect, useMemo } from 'react';
import { LazyModal } from '../components/modals/common/types';
import { NewSquadModalProps } from '../components/modals/NewSquadModal';
import { Origin } from '../lib/analytics';
import { useLazyModal } from './useLazyModal';
import AuthContext from '../contexts/AuthContext';
import { AuthTriggers } from '../lib/auth';

type ModalProps = Omit<NewSquadModalProps, 'onRequestClose' | 'isOpen'>;
interface UseCreateSquadModal {
  openNewSquadModal: (props?: ModalProps) => void;
}

export const useCreateSquadModal = (): UseCreateSquadModal => {
  const { user, showLogin } = useContext(AuthContext);
  const router = useRouter();
  const { openModal } = useLazyModal();

  // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const openNewSquadModal = (props: ModalProps) => {
    if (!user) {
      showLogin(AuthTriggers.CreateSquad);
      return;
    }

    openModal({ type: LazyModal.NewSquad, props });
  };

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const query = Object.fromEntries(search);
    if (!query?.squad) {
      return;
    }

    const { origin, pathname } = window.location;
    openNewSquadModal({ origin: Origin.Notification });
    router.replace(origin + pathname);
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.pathname]);

  return useMemo(() => ({ openNewSquadModal }), [openNewSquadModal]);
};
