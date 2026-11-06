import type { ReactElement } from 'react';
import React from 'react';
import { Modal } from '@dailydotdev/shared/src/components/modals/common/Modal';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { CoreIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { formatCoresCurrency } from '@dailydotdev/shared/src/lib/utils';
import type { CoresUse } from './UseYourCores';
import { CoresUseRow } from './UseYourCores';

// New, shown once after the first Cores claim. Built on the production
// "You got your Cores!" screen (BuyCoresModal ProcessingCompleted): same
// modal, icon, sizes and button, with the ways to spend them in between.

export type FirstCoresPersona = 'poster' | 'reader';

const orderFor: Record<FirstCoresPersona, CoresUse[]> = {
  poster: ['boost', 'award', 'streak'],
  reader: ['award', 'boost', 'streak'],
};

export interface FirstCoresSheetProps {
  amount: number;
  persona: FirstCoresPersona;
  onShowMe: () => void;
  onLater: () => void;
}

export const FirstCoresSheet = ({
  amount,
  persona,
  onShowMe,
  onLater,
}: FirstCoresSheetProps): ReactElement => {
  const [primary, ...rest] = orderFor[persona];

  return (
    <Modal
      isOpen
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      onRequestClose={onLater}
      isDrawerOnMobile
    >
      <Modal.Body className="flex flex-col items-center gap-4 text-center">
        <CoreIcon size={IconSize.XXXLarge} />
        <Typography type={TypographyType.LargeTitle} bold>
          +{formatCoresCurrency(amount)}
        </Typography>
        <Typography type={TypographyType.Title3} bold>
          You earned your first Cores
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          Cores are what you spend on daily.dev. Here is what yours can do.
        </Typography>
        <ul className="flex w-full flex-col gap-2">
          <CoresUseRow
            use={primary}
            balance={amount}
            onClick={onShowMe}
            isPrimary
            isCompact
          />
          {rest.map((use) => (
            <CoresUseRow
              key={use}
              use={use}
              balance={amount}
              onClick={onShowMe}
              isCompact
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
      </Modal.Body>
    </Modal>
  );
};
