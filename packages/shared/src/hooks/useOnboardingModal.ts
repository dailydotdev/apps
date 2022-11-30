import { useContext, useEffect, useMemo, useState } from 'react';
import { MainFeedPage } from '../components/utilities';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { Alerts } from '../graphql/alerts';
import { OnboardingMode } from '../graphql/feed';
import { AnalyticsEvent } from '../lib/analytics';
import { OnboardingVersion } from '../lib/featureValues';
import { cloudinary } from '../lib/image';
import { LoggedUser } from '../lib/user';
import { AssetType, useAssetPreload } from './useAssetPreload';
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
  isFeaturesLoaded: boolean;
  onFeedPageChanged: (page: MainFeedPage) => unknown;
}

type ModalCommand = Record<OnboardingVersion, (value: boolean) => unknown>;

const LOGGED_USER_ONBOARDING = 'hasTriedOnboarding';

export const useOnboardingModal = ({
  user,
  alerts,
  isFirstVisit,
  isFeaturesLoaded,
  onboardingVersion,
  onFeedPageChanged,
}: UseOnboardingModalProps): UseOnboardingModal => {
  useAssetPreload(AssetType.Image, cloudinary.feedFilters.yourFeed);
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
    if (
      onboardingMode === OnboardingMode.Auto &&
      onboardingVersion === OnboardingVersion.V1
    ) {
      trackEvent({ event_name: AnalyticsEvent.OnboardingSkip });
    }

    if (!hasTriedOnboarding) {
      setHasTriedOnboarding(true);
    }

    modalStateCommand[onboardingVersion]?.(false);

    if (user && !alerts.filter) {
      onFeedPageChanged(MainFeedPage.MyFeed);
    }
  };

  useEffect(() => {
    if (!user || !shouldUpdateFilters) {
      return;
    }

    registerLocalFilters().then(() => {
      trackEvent({ event_name: AnalyticsEvent.CompleteOnboarding });
      setShouldUpdateFilters(false);
      modalStateCommand[onboardingVersion]?.(false);
    });
  }, [user, shouldUpdateFilters]);

  useEffect(() => {
    const conditions = [
      !hasOnboardingLoaded,
      hasTriedOnboarding,
      !alerts.filter,
      !isFeaturesLoaded,
    ];

    if (conditions.some((condition) => !!condition)) {
      return;
    }

    setHasTriedOnboarding(false);
    setOnboardingMode(OnboardingMode.Auto);
    modalStateCommand[onboardingVersion]?.(true);
  }, [hasOnboardingLoaded, isFeaturesLoaded, user]);

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
