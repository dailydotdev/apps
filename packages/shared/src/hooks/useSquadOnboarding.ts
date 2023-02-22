import { useContext, useEffect, useMemo, useState } from 'react';
import { LazyModal } from '../components/modals/common/types';
import AlertContext from '../contexts/AlertContext';
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
  const { alerts, isFetched, updateAlerts } = useContext(AlertContext);
  const { sidebarRendered } = useSidebarRendered();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const { openModal } = useLazyModal<LazyModal.SquadTour>();
  const [hasTriedOnboarding, setHasTriedOnboarding, isCacheFetched] =
    usePersistentContext(SQUAD_ONBOARDING_KEY, false);

  useEffect(() => {
    const conditions = [isPageReady, isFetched, isCacheFetched];
    const isReady = conditions.every((isMet) => isMet);

    if (!isReady) return;

    if (hasTriedOnboarding) {
      // to update sync - backwards compatibility
      if (alerts.showSquadTour) updateAlerts({ showSquadTour: false });

      return;
    }

    if (isPopupOpen || !alerts.showSquadTour) return;

    updateAlerts({ showSquadTour: false });
    setHasTriedOnboarding(true);
    if (sidebarRendered) {
      setIsPopupOpen(true);
    } else {
      openModal({ type: LazyModal.SquadTour });
    }
  }, [
    hasTriedOnboarding,
    isFetched,
    isCacheFetched,
    isPageReady,
    alerts,
    isPopupOpen,
    sidebarRendered,
  ]);

  return useMemo(
    () => ({ isPopupOpen, onClosePopup: () => setIsPopupOpen(false) }),
    [isPopupOpen],
  );
};
