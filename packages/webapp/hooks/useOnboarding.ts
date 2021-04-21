import {
  EngagementAction,
  OnboardingContextData,
} from '../contexts/OnboardingContext';
import { LoggedUser } from '../lib/user';
import usePersistentState from './usePersistentState';
import { useEffect, useState } from 'react';
import { trackEvent } from '../lib/analytics';

export default function useOnboarding(
  user?: LoggedUser,
  loadedUserFromCache?: boolean,
): OnboardingContextData {
  const [showWelcome, setShowWelcome, loadedFromCache] = usePersistentState(
    'showWelcome',
    null,
    true,
  );
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

  return {
    showWelcome: showWelcome && !user,
    setShowWelcome,
    onboardingReady: loadedFromCache && loadedUserFromCache,
    showReferral,
    closeReferral() {
      setShowReferral(false);
      return setOnboardingData({ ...onboardingData, trigerredReferral: true });
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
    },
  };
}
