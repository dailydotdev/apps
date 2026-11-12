import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Modal } from '@dailydotdev/shared/src/components/modals/common/Modal';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { CoreIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { ModalClose } from '@dailydotdev/shared/src/components/modals/common/ModalClose';
import { formatCoresCurrency } from '@dailydotdev/shared/src/lib/utils';
import type { FirstCoresPersona } from '../../flows/cores/FirstCoresSheet';
import type { CoresUse } from './UseYourCores';
import { CoresUseRow } from './UseYourCores';
import { friendshipArt } from './frame';

// The two "you have Cores now" moments, on one shared card: the character art
// on top with the amount sitting on it, then the copy and the actions.
// The first Cores sheet only describes the uses, so both end on Got it.

const ArtHeader = ({
  amount,
  onClose,
  className = 'h-48 tablet:h-56',
}: {
  amount: string;
  onClose?: () => void;
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      'relative w-full shrink-0 overflow-hidden',
      className,
    )}
  >
    <img
      src={friendshipArt}
      alt="Friends sharing a Core with Patchy"
      className="size-full object-cover object-[50%_30%]"
    />
    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background-default to-transparent" />
    {onClose && (
      <ModalClose
        size={ButtonSize.Small}
        variant={ButtonVariant.Primary}
        zIndex="1"
        top="3"
        right="3"
        onClick={onClose}
      />
    )}
    <span className="absolute bottom-3 left-1/2 -translate-x-1/2">
      <span className="flex animate-raise-hand-pop items-center gap-1.5 rounded-14 bg-text-primary px-3 py-1.5 text-surface-invert shadow-3 ring-4 ring-background-default">
        <CoreIcon size={IconSize.Medium} />
        <strong className="tabular-nums typo-title2">{amount}</strong>
      </span>
    </span>
  </div>
);

const MomentModal = ({
  amount,
  title,
  body,
  children,
  artClassName,
  onRequestClose,
}: {
  amount: string;
  title: string;
  body: string;
  children: ReactNode;
  /** Height of the art, shorter when the card has more to say */
  artClassName?: string;
  onRequestClose: () => void;
}): ReactElement => (
  <Modal
    isOpen
    kind={Modal.Kind.FlexibleCenter}
    size={Modal.Size.Small}
    onRequestClose={onRequestClose}
    isDrawerOnMobile
    className="overflow-hidden"
  >
    <ArtHeader
      amount={amount}
      onClose={onRequestClose}
      className={artClassName}
    />
    <div className="flex min-h-0 flex-col items-center gap-5 overflow-y-auto px-6 pb-6 pt-5 text-center">
      <div className="flex flex-col gap-1">
        <h2 className="font-bold typo-title3">{title}</h2>
        <p className="text-text-tertiary typo-callout">{body}</p>
      </div>
      {children}
    </div>
  </Modal>
);

const orderFor: Record<FirstCoresPersona, CoresUse[]> = {
  poster: ['boost', 'award', 'streak'],
  reader: ['award', 'boost', 'streak'],
};

export const FirstCoresSheet = ({
  amount,
  persona,
  onGotIt,
}: {
  amount: number;
  persona: FirstCoresPersona;
  onGotIt: () => void;
}): ReactElement => (
  <MomentModal
    amount={`+${formatCoresCurrency(amount)}`}
    title="You earned your first Cores"
    body="Cores are what you spend on daily.dev. Here is what yours can do."
    artClassName="h-36"
    onRequestClose={onGotIt}
  >
    <ul className="flex w-full flex-col divide-y divide-border-subtlest-tertiary">
      {orderFor[persona].map((use) => (
        <CoresUseRow key={use} use={use} />
      ))}
    </ul>
    <Button
      variant={ButtonVariant.Primary}
      className="w-full"
      onClick={onGotIt}
    >
      Got it
    </Button>
  </MomentModal>
);

export const CoresPurchasedModal = ({
  amount,
  onGotIt,
}: {
  amount: number;
  onGotIt: () => void;
}): ReactElement => (
  <MomentModal
    amount={formatCoresCurrency(amount)}
    title="You got your Cores!"
    body="Success! Your Cores are now available in your balance."
    onRequestClose={onGotIt}
  >
    <Button
      onClick={onGotIt}
      variant={ButtonVariant.Primary}
      className="w-full"
    >
      Got it
    </Button>
  </MomentModal>
);
