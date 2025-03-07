import type { ReactElement, ReactNode } from 'react';
import React, { useContext, useMemo, useState } from 'react';
import type { ModalProps } from '../components/modals/common/Modal';

const AWARD_TYPES = {
  USER: 'USER',
  POST: 'POST',
  COMMENT: 'COMMENT',
} as const;
export type AwardTypes = keyof typeof AWARD_TYPES;

const SCREENS = {
  INTRO: 'INTRO',
  COMMENT: 'COMMENT',
} as const;

const MODALRENDERS = {
  AWARD: 'AWARD',
  BUY_CORES: 'BUY_CORES',
} as const;
export type ModalRenders = keyof typeof MODALRENDERS;

export type Screens = keyof typeof SCREENS;

export type GiveAwardModalContextData = {
  activeModal: ModalRenders;
  setActiveModal: (modal: ModalRenders) => void;
  activeStep: Screens;
  setActiveStep: (step: Screens) => void;
  type: AwardTypes;
} & Pick<ModalProps, 'onRequestClose'>;

const GiveAwardModalContext =
  React.createContext<GiveAwardModalContextData>(undefined);
export default GiveAwardModalContext;

export type GiveAwardModalContextProviderProps = {
  children?: ReactNode;
  type: AwardTypes;
} & Pick<ModalProps, 'onRequestClose'>;

export const GiveAwardModalContextProvider = ({
  children,
  onRequestClose,
  type,
}: GiveAwardModalContextProviderProps): ReactElement => {
  const [activeStep, setActiveStep] = useState<Screens>(SCREENS.INTRO);
  const [activeModal, setActiveModal] = useState<ModalRenders>(
    MODALRENDERS.AWARD,
  );

  const contextData = useMemo<GiveAwardModalContextData>(
    () => ({
      activeModal,
      setActiveModal,
      onRequestClose,
      activeStep,
      setActiveStep,
      type,
    }),
    [activeModal, activeStep, onRequestClose, type],
  );

  return (
    <GiveAwardModalContext.Provider value={contextData}>
      {children}
    </GiveAwardModalContext.Provider>
  );
};

export const useGiveAwardModalContext = (): GiveAwardModalContextData =>
  useContext(GiveAwardModalContext);
