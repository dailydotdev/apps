import { useEffect, useMemo, useState } from 'react';
import { LazyModal } from '../components/modals/common/types';
import { generateStorageKey, StorageTopic } from '../lib/storage';
import { useLazyModal } from './useLazyModal';
import usePersistentContext from './usePersistentContext';
import useSidebarRendered from './useSidebarRendered';

const SQUAD_ONBOARDING_KEY = generateStorageKey(StorageTopic.Squad, 'tour');

interface UseSquadOnboarding {
  isPopupOpen: boolean;
  onClosePopup: () => void;
}

export const useSquadOnboarding = (
  isPageReady: boolean,
): UseSquadOnboarding => {
  const { sidebarRendered } = useSidebarRendered();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const { openModal } = useLazyModal<LazyModal.SquadTour>();
  const [hasTriedOnboarding, setHasTriedOnboarding, isFetched] =
    usePersistentContext(SQUAD_ONBOARDING_KEY, false);

  useEffect(() => {
    if (!isPageReady || !isFetched || hasTriedOnboarding || isPopupOpen) return;

    setHasTriedOnboarding(true);
    if (sidebarRendered) {
      setIsPopupOpen(true);
    } else {
      openModal({ type: LazyModal.SquadTour });
    }
  }, [
    hasTriedOnboarding,
    isFetched,
    isPageReady,
    isPopupOpen,
    sidebarRendered,
  ]);

  return useMemo(
    () => ({ isPopupOpen, onClosePopup: () => setIsPopupOpen(false) }),
    [isPopupOpen],
  );
};
