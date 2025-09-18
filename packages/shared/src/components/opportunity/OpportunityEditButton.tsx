import React from 'react';
import classNames from 'classnames';
import type { AllowedTags, ButtonProps } from '../buttons/Button';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import { EditIcon } from '../icons';
import { useOpportunityEditContext } from './OpportunityEditContext';

export type OpportunityEditButtonProps = {
  className?: string;
} & ButtonProps<AllowedTags>;

export const OpportunityEditButton = ({
  className,
  ...rest
}: OpportunityEditButtonProps) => {
  const { canEdit } = useOpportunityEditContext();

  if (!canEdit) {
    return null;
  }

  return (
    <Button
      className={classNames('z-tooltip', className)}
      type="button"
      icon={<EditIcon />}
      iconPosition={ButtonIconPosition.Left}
      variant={ButtonVariant.Float}
      size={ButtonSize.Small}
      {...rest}
    >
      Edit
    </Button>
  );
};
