import classNames from 'classnames';
import React, { forwardRef, ReactElement, Ref } from 'react';
import { Button, ButtonProps } from '../buttons/Button';
import CloseIcon from '../icons/Close';

function CloseButtonComponent(
  { className, ...props }: ButtonProps<'button'>,
  ref: Ref<HTMLButtonElement>,
): ReactElement {
  return (
    <Button
      {...props}
      ref={ref}
      className={classNames('btn-tertiary', className)}
      buttonSize="small"
      title="Close"
      icon={<CloseIcon />}
    />
  );
}

const CloseButton = forwardRef(CloseButtonComponent);

export default CloseButton;
