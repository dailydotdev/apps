import { useContext, useEffect, useMemo, useState } from 'react';
import { MainFeedPage } from '../components/utilities';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { Alerts } from '../graphql/alerts';
import { OnboardingMode } from '../graphql/feed';
import { OnboardingVersion } from '../lib/featureValues';
import { LoggedUser } from '../lib/user';
import usePersistentContext from './usePersistentContext';

interface UseOnboardingModal {
  myFeedMode: OnboardingMode;
  isOnboardingOpen: boolean;
  isLegacyOnboardingOpen: boolean;
  onCloseOnboardingModal: () => void;
  onInitializeOnboarding: () => void;
}

interface UseOnboardingModalProps {
  user?: LoggedUser;
  alerts: Alerts;
  isFirstVisit: boolean;
  onboardingVersion: OnboardingVersion;
  onFeedPageChanged: (page: MainFeedPage) => unknown;
}

type ModalCommand = Record<OnboardingVersion, (value: boolean) => unknown>;

const FIRST_TIME_SESSION = 'firstTimeSession';
const LOGGED_USER_ONBOARDING = 'loggedUserOnboarding';

export const useOnboardingModal = ({
  user,
  alerts,
  isFirstVisit,
  onboardingVersion,
  onFeedPageChanged,
}: UseOnboardingModalProps): UseOnboardingModal => {
  const { trackEvent } = useContext(AnalyticsContext);
  const [onboardingMode, setOnboardingMode] = useState(OnboardingMode.Manual);
  const [isFirstSession, setIsFirstSession, isSessionLoaded] =
    usePersistentContext(FIRST_TIME_SESSION, isFirstVisit);
  const [hasTriedOnboarding, setHasTriedOnboarding, hasOnboardingLoaded] =
    usePersistentContext<boolean>(LOGGED_USER_ONBOARDING, false);
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
    setIsFirstSession(false);
    setHasTriedOnboarding(true);
    modalStateCommand[onboardingVersion]?.(false);
    if (user && !alerts.filter) {
      onFeedPageChanged(MainFeedPage.MyFeed);
    }
  };
  useEffect(() => {
    if (!isSessionLoaded || !hasOnboardingLoaded) {
      return;
    }

    if (!user) {
      if (isFirstSession) {
        setIsFirstSession(true);
        setOnboardingMode(OnboardingMode.Auto);
        modalStateCommand[onboardingVersion]?.(true);
      }
      return;
    }

    if (hasTriedOnboarding) {
      return;
    }

    if (alerts.filter) {
      setHasTriedOnboarding(false);
      setOnboardingMode(OnboardingMode.Auto);
      modalStateCommand[onboardingVersion]?.(true);
    }
  }, [isSessionLoaded, hasOnboardingLoaded, user]);

  return useMemo(
    () => ({
      myFeedMode: onboardingMode,
      isLegacyOnboardingOpen,
      isOnboardingOpen,
      onCloseOnboardingModal,
      onInitializeOnboarding: () => modalStateCommand[onboardingVersion](true),
    }),
    [
      user,
      alerts,
      isFirstVisit,
      onboardingVersion,
      onboardingMode,
      isLegacyOnboardingOpen,
      isOnboardingOpen,
    ],
  );
};
