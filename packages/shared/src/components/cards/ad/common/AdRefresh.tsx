import type { ReactElement } from 'react';
import React from 'react';
import { ButtonSize, ButtonVariant } from '../../../buttons/common';
import type { AllowedTags, ButtonV2Props } from '../../../buttons/ButtonV2';
import { ButtonV2 } from '../../../buttons/ButtonV2';
import { RefreshIcon } from '../../../icons';

export const AdRefresh = ({
  onClick,
  size = ButtonSize.Medium,
  ...props
}: ButtonV2Props<AllowedTags>): ReactElement => {
  return (
    <ButtonV2
      variant={ButtonVariant.Float}
      size={size}
      icon={<RefreshIcon />}
      onClick={onClick}
      aria-label="Refresh ad"
      {...props}
    />
  );
};
