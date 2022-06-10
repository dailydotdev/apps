import React, { forwardRef, ReactElement, Ref } from 'react';
import classNames from 'classnames';
import { Button, ButtonProps } from '../buttons/Button';
import XIcon from '../icons/Close';

function ModalCloseButtonComponent(
  { className, style, ...props }: ButtonProps<'button'>,
  ref: Ref<HTMLButtonElement>,
): ReactElement {
  return (
    <Button
      {...props}
      ref={ref}
      className={classNames('btn-tertiary right-4 z-1', className)}
      buttonSize="small"
      title="Close"
      icon={<XIcon />}
      style={{ position: 'absolute', ...style }}
    />
  );
}

export const ModalCloseButton = forwardRef(ModalCloseButtonComponent);
