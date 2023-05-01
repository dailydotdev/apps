import { useRouter } from 'next/router';
import { useEffect, useMemo } from 'react';
import { LazyModal } from '../components/modals/common/types';
import { NewSquadModalProps } from '../components/modals/NewSquadModal';
import { Origin } from '../lib/analytics';
import { useLazyModal } from './useLazyModal';
import usePersistentContext from './usePersistentContext';

type ModalProps = Omit<NewSquadModalProps, 'onRequestClose' | 'isOpen'>;
interface UseCreateSquadModal {
  openNewSquadModal: (props?: ModalProps) => void;
}

const SQUAD_ONBOARDING = 'hasTriedSquadOnboarding';
const SQUAD_INVITE_PATHNAME = '/squads/[handle]/[token]';

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
  const [hasTriedOnboarding, setHasTriedOnboarding, isLoaded] =
    usePersistentContext<boolean>(SQUAD_ONBOARDING, hasSquads);

  // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const openNewSquadModal = (props: ModalProps) =>
    openModal({ type: LazyModal.NewSquad, props });

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

  useEffect(() => {
    if (
      !isLoaded ||
      hasTriedOnboarding ||
      hasSquads ||
      !hasAccess ||
      !isFlagsFetched ||
      router.pathname === SQUAD_INVITE_PATHNAME
    ) {
      return;
    }

    openNewSquadModal({ origin: Origin.Auto });
    setHasTriedOnboarding(true);
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    hasTriedOnboarding,
    isLoaded,
    hasSquads,
    hasAccess,
    isFlagsFetched,
    router.pathname,
  ]);

  return useMemo(() => ({ openNewSquadModal }), [openNewSquadModal]);
};
