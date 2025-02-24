import type { ReactElement, ReactNode } from 'react';
import React, { useContext, useMemo, useState } from 'react';
import type { ModalProps } from '../components/modals/common/Modal';

const SCREENS = {
  INTRO: 'INTRO',
  COMMENT: 'COMMENT',
  SHOW_ALL: 'SHOW_ALL',
} as const;

export type Screens = keyof typeof SCREENS;

export type GiveAwardModalContextData = {
  activeStep: Screens;
  setActiveStep: (step: Screens) => void;
} & Pick<ModalProps, 'onRequestClose'>;

const GiveAwardModalContext =
  React.createContext<GiveAwardModalContextData>(undefined);
export default GiveAwardModalContext;

export type GiveAwardModalContextProviderProps = {
  children?: ReactNode;
} & Pick<ModalProps, 'onRequestClose'>;

export const GiveAwardModalContextProvider = ({
  children,
  onRequestClose,
}: GiveAwardModalContextProviderProps): ReactElement => {
  const [activeStep, setActiveStep] = useState<Screens>(SCREENS.INTRO);

  const contextData = useMemo<GiveAwardModalContextData>(
    () => ({
      onRequestClose,
      activeStep,
      setActiveStep,
    }),
    [activeStep, onRequestClose],
  );

  return (
    <GiveAwardModalContext.Provider value={contextData}>
      {children}
    </GiveAwardModalContext.Provider>
  );
};

export const useGiveAwardModalContext = (): GiveAwardModalContextData =>
  useContext(GiveAwardModalContext);
