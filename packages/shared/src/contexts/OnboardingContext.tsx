import React, { ReactElement, ReactNode, useContext, useMemo } from 'react';
import AuthContext from './AuthContext';
import usePersistentState from '../hooks/usePersistentState';

export enum EngagementAction {
  Post_Click,
  Bookmark,
  Scroll,
}

export interface OnboardingContextData {
  onboardingStep: number;
  incrementOnboardingStep: () => Promise<void>;
  onboardingReady: boolean;
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

  const backwardsCompatibleOnboardingStep = getOnboardingStep(onboardingStep);

  const contextData = useMemo<OnboardingContextData>(
    () => ({
      onboardingStep: user ? -1 : backwardsCompatibleOnboardingStep,
      incrementOnboardingStep: () =>
        setOnboardingStep(backwardsCompatibleOnboardingStep + 1),
      onboardingReady: loadedFromCache && loadedUserFromCache,
    }),
    [
      user,
      backwardsCompatibleOnboardingStep,
      loadedFromCache,
      loadedUserFromCache,
    ],
  );

  return (
    <OnboardingContext.Provider value={contextData}>
      {children}
    </OnboardingContext.Provider>
  );
};
