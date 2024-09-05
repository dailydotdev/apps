import React, { forwardRef, ReactElement, Ref } from 'react';

import {
  Button,
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from './buttons/Button';
import { MiniCloseIcon as CloseIcon } from './icons';

function CloseButtonComponent(
  {
    size = ButtonSize.Medium,
    variant = ButtonVariant.Tertiary,
    ...props
  }: ButtonProps<'button'>,
  ref: Ref<HTMLButtonElement>,
): ReactElement {
  return (
    <Button
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
