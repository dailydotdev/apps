import React from 'react';
import classNames from 'classnames';
import type { AllowedTags, ButtonV2Props } from '../buttons/ButtonV2';
import {
  ButtonV2,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../buttons/ButtonV2';
import { EditIcon } from '../icons';
import { useOpportunityEditContext } from './OpportunityEditContext';

export type OpportunityEditButtonProps = {
  className?: string;
  children?: React.ReactNode;
} & ButtonV2Props<AllowedTags>;

export const OpportunityEditButton = ({
  className,
  children = 'Edit',
  icon = <EditIcon />,
  iconPosition = ButtonIconPosition.Left,
  variant = ButtonVariant.Float,
  size = ButtonSize.Small,
  ...rest
}: OpportunityEditButtonProps) => {
  const { canEdit } = useOpportunityEditContext();

  if (!canEdit) {
    return null;
  }

  return (
    <ButtonV2
      className={classNames('z-tooltip', className)}
      type="button"
      {...rest}
      icon={icon}
      iconPosition={iconPosition}
      variant={variant}
      size={size}
    >
      {children}
    </ButtonV2>
  );
};
