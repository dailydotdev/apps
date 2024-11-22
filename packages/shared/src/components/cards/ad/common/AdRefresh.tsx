import React, { type ReactElement } from 'react';
import { ButtonSize, ButtonVariant } from '../../../buttons/common';
import {
  Button,
  type AllowedTags,
  type ButtonProps,
} from '../../../buttons/Button';
import { RefreshIcon } from '../../../icons';

export const AdRefresh = ({
  onClick,
  size = ButtonSize.Small,
  ...props
}: ButtonProps<AllowedTags>): ReactElement => {
  return (
    <Button
      variant={ButtonVariant.Float}
      size={size}
      icon={<RefreshIcon />}
      onClick={onClick}
      {...props}
    />
  );
};
