import { useContext, useEffect, useMemo, useState } from 'react';
import { MainFeedPage } from '../components/utilities';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { Alerts } from '../graphql/alerts';
import { OnboardingMode } from '../graphql/feed';
import { OnboardingVersion } from '../lib/featureValues';
import { LoggedUser } from '../lib/user';
import { useMyFeed } from './useMyFeed';
import usePersistentContext from './usePersistentContext';

interface UseOnboardingModal {
  myFeedMode: OnboardingMode;
  isOnboardingOpen: boolean;
  isLegacyOnboardingOpen: boolean;
  onCloseOnboardingModal: () => void;
  onInitializeOnboarding: () => void;
  onShouldUpdateFilters: (value: boolean) => void;
}

interface UseOnboardingModalProps {
  user?: LoggedUser;
  alerts: Alerts;
  isFirstVisit: boolean;
  onboardingVersion: OnboardingVersion;
  onFeedPageChanged: (page: MainFeedPage) => unknown;
}

type ModalCommand = Record<OnboardingVersion, (value: boolean) => unknown>;

const LOGGED_USER_ONBOARDING = 'hasTriedOnboarding';

export const useOnboardingModal = ({
  user,
  alerts,
  isFirstVisit,
  onboardingVersion,
  onFeedPageChanged,
}: UseOnboardingModalProps): UseOnboardingModal => {
  const { trackEvent } = useContext(AnalyticsContext);
  const { registerLocalFilters } = useMyFeed();
  const [shouldUpdateFilters, setShouldUpdateFilters] = useState(false);
  const [onboardingMode, setOnboardingMode] = useState(OnboardingMode.Manual);
  const [hasTriedOnboarding, setHasTriedOnboarding, hasOnboardingLoaded] =
    usePersistentContext<boolean>(LOGGED_USER_ONBOARDING, !alerts.filter);
  const [isLegacyOnboardingOpen, setIsLegacyOnboardingOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  const modalStateCommand: ModalCommand = {
    v1: setIsLegacyOnboardingOpen,
    v2: setIsOnboardingOpen,
  };

  const onCloseOnboardingModal = () => {
    if (onboardingMode === OnboardingMode.Auto) {
      trackEvent({
        event_name: 'my feed onboarding skip',
      });
    }
    setHasTriedOnboarding(true);
    modalStateCommand[onboardingVersion]?.(false);
    if (user && !alerts.filter) {
      onFeedPageChanged(MainFeedPage.MyFeed);
    }
  };

  console.log(user, shouldUpdateFilters);

  useEffect(() => {
    if (!user || !shouldUpdateFilters) {
      return;
    }

    registerLocalFilters().then(() => {
      setShouldUpdateFilters(false);
      modalStateCommand[onboardingVersion]?.(false);
    });
  }, [user, shouldUpdateFilters]);

  useEffect(() => {
    if (!hasOnboardingLoaded || hasTriedOnboarding || !alerts.filter) {
      return;
    }

    setHasTriedOnboarding(false);
    setOnboardingMode(OnboardingMode.Auto);
    modalStateCommand[onboardingVersion]?.(true);
  }, [hasOnboardingLoaded, user]);

  return useMemo(
    () => ({
      myFeedMode: onboardingMode,
      isLegacyOnboardingOpen,
      isOnboardingOpen,
      onCloseOnboardingModal,
      onShouldUpdateFilters: setShouldUpdateFilters,
      onInitializeOnboarding: () => modalStateCommand[onboardingVersion](true),
    }),
    [
      user,
      alerts,
      isFirstVisit,
      onboardingVersion,
      onboardingMode,
      isLegacyOnboardingOpen,
      shouldUpdateFilters,
      isOnboardingOpen,
    ],
  );
};
