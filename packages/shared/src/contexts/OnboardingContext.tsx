import React, {
  Dispatch,
  ReactElement,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import dynamic from 'next/dynamic';
import { LogEvent } from '../lib/log';
import { OnboardingMode } from '../graphql/feed';
import { useMyFeed } from '../hooks/useMyFeed';
import usePersistentContext from '../hooks/usePersistentContext';
import AuthContext from './AuthContext';
import AlertContext from './AlertContext';
import LogContext from './LogContext';
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
  const { user } = useContext(AuthContext);
  const { alerts } = useContext(AlertContext);
  const { logEvent } = useContext(LogContext);
  const { registerLocalFilters } = useMyFeed();
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [isRegisteringFilters, setIsRegisteringFilters] = useState(false);
  const [shouldUpdateFilters, setShouldUpdateFilters] = useState(false);
  const [onboardingMode] = useState(OnboardingMode.Manual);
  const onFeedPageChanged = useRef(null);
  const [hasTriedOnboarding, setHasTriedOnboarding] =
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
    logEvent({
      event_name: LogEvent.ClickArticleAnonymousCTA,
      target_id: ExperimentWinner.ArticleOnboarding,
      extra: JSON.stringify({ origin: window.origin }),
    });
    onInitializeOnboarding(null);
  };

  useEffect(() => {
    if (!user || !shouldUpdateFilters || isRegisteringFilters) {
      return;
    }

    setIsRegisteringFilters(true);
    registerLocalFilters().then(() => {
      setShouldUpdateFilters(false);
      setIsOnboarding(false);
      setIsRegisteringFilters(false);
      setSkipIntro(false);
    });
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, shouldUpdateFilters, isRegisteringFilters]);

  const onCloseOnboardingModal = () => {
    if (onboardingMode === OnboardingMode.Auto) {
      logEvent({ event_name: LogEvent.OnboardingSkip });
    }

    if (!hasTriedOnboarding) {
      setHasTriedOnboarding(true);
    }

    setIsOnboarding(false);
    setSkipIntro(false);

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
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      isOnboarding,
      user,
      alerts,
      onboardingMode,
      shouldUpdateFilters,
      shouldSkipIntro,
    ],
  );

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

export const useOnboardingContext = (): OnboardingContextData =>
  useContext(OnboardingContext);

export default OnboardingContext;
