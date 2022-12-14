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
import { AnalyticsEvent } from '../lib/analytics';
import { OnboardingMode } from '../graphql/feed';
import { useMyFeed } from '../hooks/useMyFeed';
import usePersistentContext from '../hooks/usePersistentContext';
import AuthContext from './AuthContext';
import AlertContext from './AlertContext';
import { MainFeedPage } from '../components/utilities';
import AnalyticsContext from './AnalyticsContext';

const LOGGED_USER_ONBOARDING = 'hasTriedOnboarding';

export interface OnboardingContextData {
  myFeedMode: OnboardingMode;
  isOnboardingOpen: boolean;
  onCloseOnboardingModal: () => void;
  onShouldUpdateFilters: Dispatch<SetStateAction<boolean>>;
  onInitializeOnboarding: (
    onFeedPageChangedFn?: (page: MainFeedPage) => void,
  ) => void;
}

const OnboardingContext = React.createContext<OnboardingContextData>(null);

interface OnboardingContextProviderProps {
  children: ReactNode;
}

export const OnboardingContextProvider = ({
  children,
}: OnboardingContextProviderProps): ReactElement => {
  const { user } = useContext(AuthContext);
  const { alerts } = useContext(AlertContext);
  const { trackEvent } = useContext(AnalyticsContext);
  const { registerLocalFilters } = useMyFeed();
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [shouldUpdateFilters, setShouldUpdateFilters] = useState(false);
  const [onboardingMode, setOnboardingMode] = useState(OnboardingMode.Manual);
  const onFeedPageChanged = useRef(null);
  const [hasTriedOnboarding, setHasTriedOnboarding, hasOnboardingLoaded] =
    usePersistentContext<boolean>(LOGGED_USER_ONBOARDING, !alerts.filter);

  useEffect(() => {
    if (!user || !shouldUpdateFilters) {
      return;
    }

    registerLocalFilters().then(() => {
      trackEvent({ event_name: AnalyticsEvent.CompleteOnboarding });
      setShouldUpdateFilters(false);
      setIsOnboarding(false);
    });
  }, [user, shouldUpdateFilters]);

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
    setIsOnboarding(true);
  }, [hasOnboardingLoaded, user]);

  const onCloseOnboardingModal = () => {
    if (onboardingMode === OnboardingMode.Auto) {
      trackEvent({ event_name: AnalyticsEvent.OnboardingSkip });
    }

    if (!hasTriedOnboarding) {
      setHasTriedOnboarding(true);
    }

    setIsOnboarding(false);

    if (user && !alerts.filter && onFeedPageChanged.current) {
      onFeedPageChanged.current(MainFeedPage.MyFeed);
    }
  };

  const onboardingContextData = useMemo<OnboardingContextData>(
    () => ({
      myFeedMode: onboardingMode,
      isOnboardingOpen: isOnboarding,
      onCloseOnboardingModal,
      onShouldUpdateFilters: setShouldUpdateFilters,
      onInitializeOnboarding: (onFeedPageChangedFn) => {
        if (onFeedPageChangedFn) {
          onFeedPageChanged.current = onFeedPageChangedFn;
        }
        setIsOnboarding(true);
      },
    }),
    [isOnboarding],
  );

  return (
    <OnboardingContext.Provider value={onboardingContextData}>
      {children}
    </OnboardingContext.Provider>
  );
};

export default OnboardingContext;
