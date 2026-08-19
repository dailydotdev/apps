import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Button } from '../../../components/buttons/Button';
import { ButtonSize, ButtonVariant } from '../../../components/buttons/common';
import { VIcon } from '../../../components/icons';
import { DealAction, dealActionToLabel } from '../dealsFormat';

interface DealActionButtonProps {
  action: DealAction;
  onClick?: () => void;
  className?: string;
}

/**
 * The single action every listing surface renders. Both the row and the grid
 * card go through here so the label, the variant and the icon can never drift
 * apart between them.
 */
export const DealActionButton = ({
  action,
  onClick,
  className,
}: DealActionButtonProps): ReactElement => (
  <Button
    type="button"
    variant={
      action === DealAction.Claim ? ButtonVariant.Primary : ButtonVariant.Float
    }
    size={ButtonSize.Medium}
    disabled={action === DealAction.SoldOut}
    icon={action === DealAction.Claimed ? <VIcon secondary /> : undefined}
    onClick={onClick}
    className={classNames('min-w-28 whitespace-nowrap', className)}
  >
    {dealActionToLabel[action]}
  </Button>
);
