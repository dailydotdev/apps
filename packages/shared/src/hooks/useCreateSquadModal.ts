import { useRouter } from 'next/router';
import { useEffect, useMemo, useRef } from 'react';
import { LazyModal } from '../components/modals/common/types';
import { useLazyModal } from './useLazyModal';
import usePersistentContext from './usePersistentContext';

interface UseCreateSquadModal {
  openNewSquadModal: () => void;
  openSquadBetaModal: () => void;
}

const SQUAD_ONBOARDING = 'hasTriedSquadOnboarding';

type UseCreateSquadModalProps = {
  hasSquads: boolean;
  hasAccess: boolean;
  isFlagsFetched: boolean;
};

export const useCreateSquadModal = ({
  hasSquads = false,
  hasAccess = false,
  isFlagsFetched,
}: UseCreateSquadModalProps): UseCreateSquadModal => {
  const router = useRouter();
  const { openModal } = useLazyModal();
  const previousRef = useRef(null);
  const [hasTriedOnboarding, setHasTriedOnboarding, isLoaded] =
    usePersistentContext<boolean>(SQUAD_ONBOARDING, hasSquads);

  const openNewSquadModal = () =>
    openModal({
      type: LazyModal.NewSquad,
      props: {
        onPreviousState: () => previousRef.current(),
      },
    });
  const openSquadBetaModal = () =>
    openModal({
      type: LazyModal.NewSquad,
      props: {
        shouldShowIntro: true,
        onPreviousState: () => previousRef.current(),
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

  useEffect(() => {
    if (
      !isLoaded ||
      hasTriedOnboarding ||
      hasSquads ||
      !hasAccess ||
      !isFlagsFetched
    ) {
      return;
    }

    openSquadBetaModal();
    setHasTriedOnboarding(true);
  }, [hasTriedOnboarding, isLoaded, hasSquads, hasAccess, isFlagsFetched]);

  return useMemo(
    () => ({ openNewSquadModal, openSquadBetaModal }),
    [openNewSquadModal, openSquadBetaModal],
  );
};
