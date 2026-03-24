import type { ReactElement, Ref } from 'react';
import React, { forwardRef } from 'react';
import type { ButtonProps } from './buttons/Button';
import { Button, ButtonSize, ButtonVariant } from './buttons/Button';
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
