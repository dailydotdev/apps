import React, {
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AuthContext from './AuthContext';
import usePersistentState from '../hooks/usePersistentState';
import { trackEvent } from '../lib/analytics';

export enum EngagementAction {
  Post_Click,
  Bookmark,
  Scroll,
}

export interface OnboardingContextData {
  onboardingStep: number;
  incrementOnboardingStep: () => Promise<void>;
  onboardingReady: boolean;
  showReferral: boolean;
  closeReferral: () => Promise<void>;
  trackEngagement: (action: EngagementAction) => Promise<void>;
}

const OnboardingContext = React.createContext<OnboardingContextData>(null);
export default OnboardingContext;

export type OnboardingContextProviderProps = {
  children?: ReactNode;
};

const getOnboardingStep = (onboardingStep: number | boolean): number => {
  if (onboardingStep === true) {
    return 1;
  }
  if (onboardingStep === false) {
    return 2;
  }
  return onboardingStep;
};

export const OnboardingContextProvider = ({
  children,
}: OnboardingContextProviderProps): ReactElement => {
  const { user, loadedUserFromCache } = useContext(AuthContext);

  const [onboardingStep, setOnboardingStep, loadedFromCache] =
    usePersistentState<number | boolean>('showWelcome', null, 1);
  const [onboardingData, setOnboardingData] = usePersistentState(
    'onboarding',
    null,
    {
      firstUse: new Date(),
      engagement: {
        postClicks: 0,
        bookmarks: 0,
        scrolls: 0,
      },
      trigerredReferral: false,
    },
    true,
  );
  const [showReferral, setShowReferral] = useState(false);

  useEffect(() => {
    if (onboardingData && !onboardingData?.trigerredReferral) {
      const dt =
        (new Date().getTime() - onboardingData.firstUse.getTime()) / 1000;
      // Three weeks since first visit
      if (dt >= 1814400) {
        trackEvent({
          category: 'Trigger',
          action: 'Activate',
          label: '3 Weeks',
          nonInteraction: true,
        });
        setShowReferral(true);
      }
    }
  }, [onboardingData?.firstUse]);

  const backwardsCompatibleOnboardingStep = getOnboardingStep(onboardingStep);

  const contextData = useMemo<OnboardingContextData>(
    () => ({
      onboardingStep: user ? -1 : backwardsCompatibleOnboardingStep,
      incrementOnboardingStep: () =>
        setOnboardingStep(backwardsCompatibleOnboardingStep + 1),
      onboardingReady: loadedFromCache && loadedUserFromCache,
      showReferral,
      closeReferral() {
        setShowReferral(false);
        return setOnboardingData({
          ...onboardingData,
          trigerredReferral: true,
        });
      },
      async trackEngagement(action) {
        if (onboardingData && !onboardingData.trigerredReferral) {
          const { engagement } = onboardingData;
          switch (action) {
            case EngagementAction.Post_Click:
              if (engagement.postClicks >= 9) {
                trackEvent({
                  category: 'Trigger',
                  action: 'Activate',
                  label: '10 Post Clicks',
                });
                setShowReferral(true);
              }
              return setOnboardingData({
                ...onboardingData,
                engagement: {
                  ...engagement,
                  postClicks: engagement.postClicks + 1,
                },
              });
            case EngagementAction.Bookmark:
              if (engagement.bookmarks >= 2) {
                trackEvent({
                  category: 'Trigger',
                  action: 'Activate',
                  label: '3 Bookmarks',
                });
                setShowReferral(true);
              }
              return setOnboardingData({
                ...onboardingData,
                engagement: {
                  ...engagement,
                  bookmarks: engagement.bookmarks + 1,
                },
              });
            case EngagementAction.Scroll:
              if (engagement.scrolls >= 29) {
                trackEvent({
                  category: 'Trigger',
                  action: 'Activate',
                  label: '30 Scrolls',
                });
                setShowReferral(true);
              }
              return setOnboardingData({
                ...onboardingData,
                engagement: {
                  ...engagement,
                  scrolls: engagement.scrolls + 1,
                },
              });
            default:
            // Nothing here
          }
        }
        return undefined;
      },
    }),
    [
      user,
      backwardsCompatibleOnboardingStep,
      loadedFromCache,
      loadedUserFromCache,
      showReferral,
      onboardingData,
    ],
  );

  return (
    <OnboardingContext.Provider value={contextData}>
      {children}
    </OnboardingContext.Provider>
  );
};
