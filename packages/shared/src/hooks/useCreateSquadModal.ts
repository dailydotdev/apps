import { useRouter } from 'next/router';
import { useEffect, useMemo, useRef } from 'react';
import { LazyModal } from '../components/modals/common/types';
import { useLazyModal } from './useLazyModal';

interface UseCreateSquadModal {
  openNewSquadModal: () => void;
  openSquadBetaModal: () => void;
}

export const useCreateSquadModal = (): UseCreateSquadModal => {
  const router = useRouter();
  const { openModal } = useLazyModal();
  const previousRef = useRef(null);

  const openNewSquadModal = () =>
    openModal({
      type: LazyModal.NewSquad,
      props: {
        onPreviousState: () => previousRef.current(),
      },
    });
  const openSquadBetaModal = () =>
    openModal({
      type: LazyModal.BetaSquad,
      props: {
        onNext: openNewSquadModal,
      },
    });
  previousRef.current = openSquadBetaModal;

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const query = Object.fromEntries(search);
    if (!query?.squad) {
      return;
    }

    const { origin, pathname } = window.location;
    openSquadBetaModal();
    router.replace(origin + pathname);
  }, [router.pathname]);

  return useMemo(
    () => ({ openNewSquadModal, openSquadBetaModal }),
    [openNewSquadModal, openSquadBetaModal],
  );
};
