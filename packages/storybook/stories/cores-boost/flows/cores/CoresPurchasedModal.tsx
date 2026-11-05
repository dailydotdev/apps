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

// Production "You got your Cores!" (BuyCoresModal ProcessingCompleted), copied
// unchanged: the fix is where Got it goes, the `next` the wallet passed.

export const CoresPurchasedModal = ({
  amount,
  onGotIt,
}: {
  amount: number;
  onGotIt: () => void;
}): ReactElement => (
  <Modal
    isOpen
    kind={Modal.Kind.FlexibleCenter}
    size={Modal.Size.XSmall}
    onRequestClose={onGotIt}
    isDrawerOnMobile
  >
    <Modal.Body className="flex items-center justify-center gap-4 text-center">
      <CoreIcon size={IconSize.XXXLarge} />
      <Typography type={TypographyType.LargeTitle} bold>
        {formatCoresCurrency(amount)}
      </Typography>
      <Typography type={TypographyType.Title3} bold>
        You got your Cores!
      </Typography>
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
      >
        Success! Your Cores are now available in your balance.
      </Typography>
      <Button
        onClick={onGotIt}
        variant={ButtonVariant.Primary}
        className="w-full"
      >
        Got it
      </Button>
    </Modal.Body>
  </Modal>
);
