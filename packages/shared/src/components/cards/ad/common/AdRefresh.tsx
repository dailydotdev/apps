import type { ReactElement } from 'react';
import React from 'react';
import { ButtonSize, ButtonVariant } from '../../../buttons/common';
import type {
  type AllowedTags,
  type ButtonProps,
} from '../../../buttons/Button';
import { Button } from '../../../buttons/Button';
import { RefreshIcon } from '../../../icons';

export const AdRefresh = ({
  onClick,
  size = ButtonSize.Medium,
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
