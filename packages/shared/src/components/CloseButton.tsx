import type { ReactElement, Ref } from 'react';
import React, { forwardRef } from 'react';
import type { ButtonV2Props } from './buttons/ButtonV2';
import { ButtonV2, ButtonSize, ButtonVariant } from './buttons/ButtonV2';
import { MiniCloseIcon as CloseIcon } from './icons';

function CloseButtonComponent(
  {
    size = ButtonSize.Medium,
    variant = ButtonVariant.Tertiary,
    ...props
  }: ButtonV2Props<'button'>,
  ref: Ref<HTMLButtonElement>,
): ReactElement {
  return (
    <ButtonV2
      title="Close"
      {...props}
      size={size}
      variant={variant}
      ref={ref}
      icon={<CloseIcon />}
    />
  );
}

const CloseButton = forwardRef(CloseButtonComponent);

export default CloseButton;
