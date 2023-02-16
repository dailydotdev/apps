import { useEffect } from 'react';
import { LazyModal } from '../components/modals/common/types';
import { generateStorageKey, StorageTopic } from '../lib/storage';
import { useLazyModal } from './useLazyModal';
import usePersistentContext from './usePersistentContext';

const SQUAD_ONBOARDING_KEY = generateStorageKey(StorageTopic.Squad, 'tour');

export const useSquadOnboarding = (isPageReady: boolean): void => {
  const { openModal } = useLazyModal<LazyModal.SquadTour>();
  const [hasTriedOnboarding, setHasTriedOnboarding, isFetched] =
    usePersistentContext(SQUAD_ONBOARDING_KEY, false);

  useEffect(() => {
    if (!isPageReady || !isFetched || hasTriedOnboarding) return;

    setHasTriedOnboarding(true);
    openModal({ type: LazyModal.SquadTour });
  }, [hasTriedOnboarding, isFetched, isPageReady]);
};
