import classNames from 'classnames';
import React, { forwardRef, ReactElement, Ref } from 'react';
import { Button, StyledButtonProps, ButtonProps } from './buttons/Button';
import CloseIcon from './icons/Close';

function CloseButtonComponent(
  { className, ...props }: StyledButtonProps & ButtonProps<'button'>,
  ref: Ref<HTMLButtonElement>,
): ReactElement {
  return (
    <Button
      buttonSize="small"
      {...props}
      ref={ref}
      className={classNames('btn-tertiary', className)}
      title="Close"
      icon={<CloseIcon />}
    />
  );
}

const CloseButton = forwardRef(CloseButtonComponent);

export default CloseButton;
