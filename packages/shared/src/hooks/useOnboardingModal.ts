import { useContext, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { MainFeedPage } from '../components/utilities';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { OnboardingMode } from '../graphql/feed';
import { AnalyticsEvent } from '../lib/analytics';
import { cloudinary } from '../lib/image';
import { AssetType, useAssetPreload } from './useAssetPreload';
import { useMyFeed } from './useMyFeed';
import usePersistentContext from './usePersistentContext';
import AuthContext from '../contexts/AuthContext';
import AlertContext from '../contexts/AlertContext';

interface UseOnboardingModal {
  myFeedMode: OnboardingMode;
  isOnboardingOpen: boolean;
  onCloseOnboardingModal: () => void;
  onInitializeOnboarding: () => void;
  onShouldUpdateFilters: (value: boolean) => void;
}

interface UseOnboardingModalProps {
  onFeedPageChanged?: (page: MainFeedPage) => unknown;
}

const LOGGED_USER_ONBOARDING = 'hasTriedOnboarding';
export const ONBOARDING_KEY = 'onboarding';

export const useOnboardingModal = ({
  onFeedPageChanged,
}: UseOnboardingModalProps): UseOnboardingModal => {
  useAssetPreload(AssetType.Image, cloudinary.feedFilters.yourFeed);
  const { user } = useContext(AuthContext);
  const { alerts } = useContext(AlertContext);
  const { trackEvent } = useContext(AnalyticsContext);
  const { registerLocalFilters } = useMyFeed();
  const [onboardingMode, setOnboardingMode] = useState(OnboardingMode.Manual);
  const [isRegistering, setIsRegistering] = useState(false);
  const [hasTriedOnboarding, setHasTriedOnboarding, hasOnboardingLoaded] =
    usePersistentContext<boolean>(LOGGED_USER_ONBOARDING, !alerts.filter);

  const client = useQueryClient();
  const { data: isOnboardingOpen } = useQuery<boolean>(
    [ONBOARDING_KEY, 'is_open'],
    {
      initialData: false,
      staleTime: 60 * 5000,
    },
  );
  const { data: shouldUpdateFilters } = useQuery<boolean>(
    [ONBOARDING_KEY, 'should_update'],
    {
      initialData: false,
      staleTime: 60 * 5000,
    },
  );
  const setIsOnboardingOpen = (data) =>
    client.setQueryData([ONBOARDING_KEY, 'is_open'], data);
  const setShouldUpdateFilters = (data) =>
    client.setQueryData([ONBOARDING_KEY, 'should_update'], data);

  const onCloseOnboardingModal = () => {
    if (onboardingMode === OnboardingMode.Auto) {
      trackEvent({ event_name: AnalyticsEvent.OnboardingSkip });
    }

    if (!hasTriedOnboarding) {
      setHasTriedOnboarding(true);
    }

    setIsOnboardingOpen(false);

    if (user && !alerts.filter) {
      onFeedPageChanged(MainFeedPage.MyFeed);
    }
  };

  useEffect(() => {
    if (!user || !shouldUpdateFilters || isRegistering) {
      return;
    }

    setIsRegistering(true);

    registerLocalFilters().then(() => {
      trackEvent({ event_name: AnalyticsEvent.CompleteOnboarding });
      setShouldUpdateFilters(false);
      setIsOnboardingOpen(false);
    });
  }, [user, shouldUpdateFilters, isRegistering]);

  useEffect(() => {
    const conditions = [
      !hasOnboardingLoaded,
      hasTriedOnboarding,
      !alerts.filter,
    ];

    if (conditions.some((condition) => !!condition)) {
      return;
    }

    setHasTriedOnboarding(false);
    setOnboardingMode(OnboardingMode.Auto);
    setIsOnboardingOpen(true);
  }, [hasOnboardingLoaded, user]);

  return useMemo(
    () => ({
      myFeedMode: onboardingMode,
      isOnboardingOpen,
      onCloseOnboardingModal,
      onShouldUpdateFilters: setShouldUpdateFilters,
      onInitializeOnboarding: () => setIsOnboardingOpen(true),
    }),
    [user, alerts, onboardingMode, shouldUpdateFilters, isOnboardingOpen],
  );
};
