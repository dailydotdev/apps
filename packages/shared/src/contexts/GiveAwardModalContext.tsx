import type { Dispatch, ReactElement, ReactNode, SetStateAction } from 'react';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import type { ModalProps } from '../components/modals/common/Modal';
import type { Product } from '../graphql/njord';
import type { PublicProfile } from '../lib/user';
import { useLogContext } from './LogContext';
import { postLogEvent } from '../lib/feed';
import { LogEvent, Origin } from '../lib/log';
import type { Post } from '../graphql/posts';
import { checkIsExtension } from '../lib/func';
import { webappUrl } from '../lib/constants';
import { getPathnameWithQuery } from '../lib';
import { useMedia } from '../hooks';

const AWARD_TYPES = {
  USER: 'USER',
  POST: 'POST',
  COMMENT: 'COMMENT',
} as const;
export type AwardTypes = keyof typeof AWARD_TYPES;

const SCREENS = {
  INTRO: 'INTRO',
  COMMENT: 'COMMENT',
  SUCCESS: 'SUCCESS',
} as const;

const MODALRENDERS = {
  AWARD: 'AWARD',
  BUY_CORES: 'BUY_CORES',
  AWARD_ANIMATION: 'AWARD_ANIMATION',
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
  post?: Post;
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
  const router = useRouter();
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

  const prefersReducedMotion = useMedia(
    ['(prefers-reduced-motion)'],
    [true],
    false,
    false,
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
      setActiveModal: (modal) => {
        if (modal === 'BUY_CORES' && checkIsExtension()) {
          const searchParams = new URLSearchParams({
            origin: Origin.Award,
          });

          if (post?.id) {
            searchParams.append('next', `/posts/${post.id}`);
          }

          router?.replace(
            getPathnameWithQuery(`${webappUrl}cores`, searchParams),
          );

          return;
        }

        setActiveModal(modal);
      },
      onRequestClose: (event) => {
        if (
          !prefersReducedMotion &&
          activeStep.screen === 'SUCCESS' &&
          activeStep.product
        ) {
          setActiveModal('AWARD_ANIMATION');
        } else {
          onRequestClose?.(event);
        }
      },
      activeStep: activeStep.screen,
      product: activeStep.product,
      setActiveStep,
      type,
      entity,
      logAwardEvent,
      post,
    }),
    [
      activeModal,
      onRequestClose,
      activeStep.screen,
      activeStep.product,
      type,
      entity,
      logAwardEvent,
      router,
      post,
      prefersReducedMotion,
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
