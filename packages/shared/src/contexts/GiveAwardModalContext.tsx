import type { Dispatch, ReactElement, ReactNode, SetStateAction } from 'react';
import React, { useContext, useMemo, useState } from 'react';
import type { ModalProps } from '../components/modals/common/Modal';
import type { Product } from '../graphql/njord';
import type { PublicProfile } from '../lib/user';

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

export const maxNoteLength = 400;

export type AwardEntity = {
  id: string;
  receiver: Pick<PublicProfile, 'name' | 'username'>;
  numAwards?: number;
};

export type GiveAwardModalContextData = {
  activeModal: ModalRenders;
  setActiveModal: (modal: ModalRenders) => void;
  activeStep: Screens;
  setActiveStep: Dispatch<
    SetStateAction<{ screen: Screens; product?: Product }>
  >;
  type: AwardTypes;
  entity: AwardEntity;
  product?: Product;
} & Pick<ModalProps, 'onRequestClose'>;

const GiveAwardModalContext =
  React.createContext<GiveAwardModalContextData>(undefined);
export default GiveAwardModalContext;

export type GiveAwardModalContextProviderProps = {
  children?: ReactNode;
  type: AwardTypes;
  entity: AwardEntity;
} & Pick<ModalProps, 'onRequestClose'>;

export const GiveAwardModalContextProvider = ({
  children,
  onRequestClose,
  type,
  entity,
}: GiveAwardModalContextProviderProps): ReactElement => {
  const [activeStep, setActiveStep] = useState<{
    screen: Screens;
    product?: Product;
  }>({
    screen: SCREENS.INTRO,
  });
  const [activeModal, setActiveModal] = useState<ModalRenders>(
    MODALRENDERS.AWARD,
  );

  const contextData = useMemo<GiveAwardModalContextData>(
    () => ({
      activeModal,
      setActiveModal,
      onRequestClose,
      activeStep: activeStep.screen,
      product: activeStep.product,
      setActiveStep,
      type,
      entity,
    }),
    [activeModal, activeStep, onRequestClose, type, entity],
  );

  return (
    <GiveAwardModalContext.Provider value={contextData}>
      {children}
    </GiveAwardModalContext.Provider>
  );
};

export const useGiveAwardModalContext = (): GiveAwardModalContextData =>
  useContext(GiveAwardModalContext);
