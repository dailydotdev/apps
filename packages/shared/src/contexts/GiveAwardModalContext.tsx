import type { Dispatch, ReactElement, ReactNode, SetStateAction } from 'react';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import type { ModalProps } from '../components/modals/common/Modal';
import type { Product } from '../graphql/njord';
import type { PublicProfile } from '../lib/user';
import { useLogContext } from './LogContext';
import { postLogEvent } from '../lib/feed';
import { LogEvent } from '../lib/log';
import type { Post } from '../graphql/posts';

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

const AWARD_EVENTS = {
  START: 'START',
  PICK: 'PICK',
  AWARD: 'AWARD',
};
type AwardEvents = keyof typeof AWARD_EVENTS;

const AwardTypeToTrackingEvent: Record<
  AwardTypes,
  Record<AwardEvents, LogEvent>
> = {
  USER: {
    START: LogEvent.StartAwardUser,
    PICK: LogEvent.PickAwardUser,
    AWARD: LogEvent.AwardUser,
  },
  POST: {
    START: LogEvent.StartAwardPost,
    PICK: LogEvent.PickAwardPost,
    AWARD: LogEvent.AwardPost,
  },
  COMMENT: {
    START: LogEvent.StartAwardComment,
    PICK: LogEvent.PickAwardComment,
    AWARD: LogEvent.AwardComment,
  },
};

export const maxNoteLength = 400;

export type AwardEntity = {
  id: string;
  receiver: Pick<PublicProfile, 'id' | 'name' | 'username' | 'image'>;
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
  logAwardEvent: (args: {
    awardEvent: AwardEvents;
    extra?: Record<string, unknown>;
  }) => void;
} & Pick<ModalProps, 'onRequestClose'>;

const GiveAwardModalContext =
  React.createContext<GiveAwardModalContextData>(undefined);
export default GiveAwardModalContext;

export type GiveAwardModalContextProviderProps = {
  children?: ReactNode;
  type: AwardTypes;
  entity: AwardEntity;
  post?: Post;
} & Pick<ModalProps, 'onRequestClose'>;

export const GiveAwardModalContextProvider = ({
  children,
  onRequestClose,
  type,
  entity,
  post,
}: GiveAwardModalContextProviderProps): ReactElement => {
  const { logEvent } = useLogContext();
  const [activeStep, setActiveStep] = useState<{
    screen: Screens;
    product?: Product;
  }>({
    screen: SCREENS.INTRO,
  });
  const [activeModal, setActiveModal] = useState<ModalRenders>(
    MODALRENDERS.AWARD,
  );

  const logAwardEvent = useCallback(
    ({
      awardEvent,
      extra,
    }: {
      awardEvent: AwardEvents;
      extra?: Record<string, unknown>;
    }): void => {
      const eventName = AwardTypeToTrackingEvent[type]?.[awardEvent];
      if (type === 'USER') {
        // User is a non post event
        logEvent({
          event_name: eventName,
          extra: JSON.stringify({ ...extra }),
        });
      } else {
        logEvent(postLogEvent(eventName, post, { extra }));
      }
    },
    [logEvent, post, type],
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
      logAwardEvent,
    }),
    [
      activeModal,
      onRequestClose,
      activeStep.screen,
      activeStep.product,
      type,
      entity,
      logAwardEvent,
    ],
  );

  return (
    <GiveAwardModalContext.Provider value={contextData}>
      {children}
    </GiveAwardModalContext.Provider>
  );
};

export const useGiveAwardModalContext = (): GiveAwardModalContextData =>
  useContext(GiveAwardModalContext);
