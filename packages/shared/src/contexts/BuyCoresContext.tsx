import type { ReactElement, ReactNode } from 'react';
import React, { useContext, useMemo, useState } from 'react';

const SCREENS = {
  INTRO: 'INTRO',
  COMMENT: 'COMMENT',
} as const;
export type Screens = keyof typeof SCREENS;

export type BuyCoresContextData = {
  amountNeeded?: number;
  onCompletion?: () => void;
  activeStep: Screens;
  setActiveStep: (step: Screens) => void;
};

const BuyCoresContext = React.createContext<BuyCoresContextData>(undefined);
export default BuyCoresContext;

export type BuyCoresContextProviderProps = {
  children?: ReactNode;
  amountNeeded?: number;
  onCompletion?: () => void;
};

export const BuyCoresContextProvider = ({
  onCompletion,
  amountNeeded,
  children,
}: BuyCoresContextProviderProps): ReactElement => {
  const [activeStep, setActiveStep] = useState<Screens>(SCREENS.INTRO);

  const contextData = useMemo<BuyCoresContextData>(
    () => ({
      amountNeeded,
      onCompletion,
      activeStep,
      setActiveStep,
    }),
    [activeStep, amountNeeded, onCompletion],
  );

  return (
    <BuyCoresContext.Provider value={contextData}>
      {children}
    </BuyCoresContext.Provider>
  );
};

export const useBuyCoresContext = (): BuyCoresContextData =>
  useContext(BuyCoresContext);
