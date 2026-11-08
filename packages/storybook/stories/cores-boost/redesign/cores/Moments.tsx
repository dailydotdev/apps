import type { ReactElement, ReactNode } from 'react';
import React from 'react';
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
// Same copy and buttons as Flows: Show me / Later, and Got it.

const ArtHeader = ({
  amount,
  onClose,
}: {
  amount: string;
  onClose?: () => void;
}): ReactElement => (
  <div className="relative h-48 w-full shrink-0 overflow-hidden tablet:h-56">
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
    <span className="absolute bottom-0 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-14 border border-border-subtlest-tertiary bg-background-default px-3 py-1.5 shadow-2">
      <CoreIcon size={IconSize.Medium} />
      <strong className="tabular-nums typo-title2">{amount}</strong>
    </span>
  </div>
);

const MomentModal = ({
  amount,
  title,
  body,
  children,
  onRequestClose,
}: {
  amount: string;
  title: string;
  body: string;
  children: ReactNode;
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
    <ArtHeader amount={amount} onClose={onRequestClose} />
    <div className="flex flex-col items-center gap-4 px-6 pb-6 pt-4 text-center">
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
  onShowMe,
  onLater,
}: {
  amount: number;
  persona: FirstCoresPersona;
  onShowMe: () => void;
  onLater: () => void;
}): ReactElement => {
  const [primary, ...rest] = orderFor[persona];

  return (
    <MomentModal
      amount={`+${formatCoresCurrency(amount)}`}
      title="You earned your first Cores"
      body="Cores are what you spend on daily.dev. Here is what yours can do."
      onRequestClose={onLater}
    >
      <ul className="flex w-full flex-col gap-2">
        <CoresUseRow
          use={primary}
          balance={amount}
          onClick={onShowMe}
          isPrimary
        />
        {rest.map((use) => (
          <CoresUseRow
            key={use}
            use={use}
            balance={amount}
            onClick={onShowMe}
          />
        ))}
      </ul>
      <div className="flex w-full flex-col gap-2">
        <Button
          variant={ButtonVariant.Primary}
          className="w-full"
          onClick={onShowMe}
        >
          Show me
        </Button>
        <Button
          variant={ButtonVariant.Tertiary}
          className="w-full"
          onClick={onLater}
        >
          Later
        </Button>
      </div>
    </MomentModal>
  );
};

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
