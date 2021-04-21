import React from 'react';

export enum EngagementAction {
  Post_Click,
  Bookmark,
  Scroll,
}

export interface OnboardingContextData {
  showWelcome: boolean;
  setShowWelcome: (showWelcome: boolean) => Promise<void>;
  onboardingReady: boolean;
  showReferral: boolean;
  closeReferral: () => Promise<void>;
  trackEngagement: (action: EngagementAction) => Promise<void>;
}

const OnboardingContext = React.createContext<OnboardingContextData>(null);
export default OnboardingContext;
