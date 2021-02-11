import React from 'react';

export interface OnboardingContextData {
  showWelcome: boolean;
  setShowWelcome: (showWelcome: boolean) => unknown;
  onboardingReady: boolean;
}

const OnboardingContext = React.createContext<OnboardingContextData>(null);
export default OnboardingContext;
