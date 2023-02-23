import React, {
  ReactNode,
  ReactElement,
  useMemo,
  useState,
  useEffect,
  useContext,
  useRef,
  SetStateAction,
  Dispatch,
} from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { AnalyticsEvent } from '../lib/analytics';
import { OnboardingMode } from '../graphql/feed';
import { useMyFeed } from '../hooks/useMyFeed';
import usePersistentContext from '../hooks/usePersistentContext';
import AuthContext from './AuthContext';
import AlertContext from './AlertContext';
import AnalyticsContext from './AnalyticsContext';
import { isTesting } from '../lib/constants';
import useSidebarRendered from '../hooks/useSidebarRendered';
import { ExperimentWinner } from '../lib/featureValues';

const OnboardingModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "onboardingModal" */ '../components/modals/OnboardingModal'
    ),
);

const LOGGED_USER_ONBOARDING = 'hasTriedOnboarding';

export interface OnboardingContextData {
  myFeedMode: OnboardingMode;
  isOnboardingOpen: boolean;
  showArticleOnboarding?: boolean;
  onCloseOnboardingModal: () => void;
  onShouldUpdateFilters: Dispatch<SetStateAction<boolean>>;
  onInitializeOnboarding: (onFinish?: () => void, skipIntro?: boolean) => void;
  onStartArticleOnboarding: () => void;
  shouldSkipIntro: boolean;
}

const OnboardingContext = React.createContext<OnboardingContextData>(null);

interface OnboardingContextProviderProps {
  children: ReactNode;
}

export const OnboardingContextProvider = ({
  children,
}: OnboardingContextProviderProps): ReactElement => {
  const { pathname } = useRouter() ?? {};
  const { user } = useContext(AuthContext);
  const { loadedAlerts, alerts } = useContext(AlertContext);
  const { trackEvent } = useContext(AnalyticsContext);
  const { registerLocalFilters } = useMyFeed();
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [isRegisteringFilters, setIsRegisteringFilters] = useState(false);
  const [shouldUpdateFilters, setShouldUpdateFilters] = useState(false);
  const [onboardingMode, setOnboardingMode] = useState(OnboardingMode.Manual);
  const onFeedPageChanged = useRef(null);
  const [hasTriedOnboarding, setHasTriedOnboarding, hasOnboardingLoaded] =
    usePersistentContext<boolean>(LOGGED_USER_ONBOARDING, !alerts.filter);
  const [shouldSkipIntro, setSkipIntro] = useState(false);

  const onInitializeOnboarding = (
    onFinish: () => void,
    skipIntro?: boolean,
  ) => {
    if (onFinish) {
      onFeedPageChanged.current = onFinish;
    }

    if (skipIntro) {
      setSkipIntro(true);
    }

    setIsOnboarding(true);
  };
  const { sidebarRendered } = useSidebarRendered();
  const showArticleOnboarding = sidebarRendered && alerts?.filter;
  const onStartArticleOnboarding = () => {
    trackEvent({
      event_name: AnalyticsEvent.ClickArticleAnonymousCTA,
      target_id: ExperimentWinner.ArticleOnboarding,
      extra: JSON.stringify({ origin }),
    });
    onInitializeOnboarding(null);
  };

  useEffect(() => {
    if (!user || !shouldUpdateFilters || isRegisteringFilters) {
      return;
    }

    setIsRegisteringFilters(true);
    registerLocalFilters().then(() => {
      trackEvent({ event_name: AnalyticsEvent.CompleteOnboarding });
      setShouldUpdateFilters(false);
      setIsOnboarding(false);
      setIsRegisteringFilters(false);
    });
  }, [user, shouldUpdateFilters, isRegisteringFilters]);

  useEffect(() => {
    const isHome = !pathname || pathname === '/';
    const conditions = [
      !loadedAlerts,
      !hasOnboardingLoaded,
      hasTriedOnboarding,
      !alerts.filter,
      !isHome,
    ];

    if (conditions.some((condition) => !!condition)) {
      return;
    }

    setHasTriedOnboarding(false);
    setOnboardingMode(OnboardingMode.Auto);
    setIsOnboarding(true);
  }, [hasOnboardingLoaded, user, pathname, loadedAlerts]);

  const onCloseOnboardingModal = () => {
    if (onboardingMode === OnboardingMode.Auto) {
      trackEvent({ event_name: AnalyticsEvent.OnboardingSkip });
    }

    if (!hasTriedOnboarding) {
      setHasTriedOnboarding(true);
    }

    setIsOnboarding(false);

    if (user && !alerts.filter && onFeedPageChanged.current) {
      onFeedPageChanged.current?.();
    }
  };

  const onboardingContextData = useMemo<OnboardingContextData>(
    () => ({
      onStartArticleOnboarding,
      myFeedMode: onboardingMode,
      isOnboardingOpen: isOnboarding,
      showArticleOnboarding,
      onCloseOnboardingModal,
      onShouldUpdateFilters: setShouldUpdateFilters,
      onInitializeOnboarding,
      shouldSkipIntro,
    }),
    [
      isOnboarding,
      user,
      alerts,
      onboardingMode,
      shouldUpdateFilters,
      shouldSkipIntro,
    ],
  );

  // if onboarding is done/closed reset
  // state values to default
  useEffect(() => {
    if (!isOnboarding) {
      setSkipIntro(false);
    }
  }, [isOnboarding]);

  return (
    <OnboardingContext.Provider value={onboardingContextData}>
      {children}
      {onboardingContextData.isOnboardingOpen && !isTesting && (
        <OnboardingModal
          mode={onboardingContextData.myFeedMode}
          isOpen={onboardingContextData.isOnboardingOpen}
          onRequestClose={onboardingContextData.onCloseOnboardingModal}
          onRegistrationSuccess={() =>
            onboardingContextData.onShouldUpdateFilters(true)
          }
          shouldSkipIntro={shouldSkipIntro}
        />
      )}
    </OnboardingContext.Provider>
  );
};

export default OnboardingContext;
