import React, { forwardRef, ReactElement, Ref } from 'react';
import classNames from 'classnames';
import { ButtonProps } from '../buttons/Button';
import CloseButton from '../CloseButton';

function ModalCloseButtonComponent(
  { className, style, ...props }: ButtonProps<'button'>,
  ref: Ref<HTMLButtonElement>,
): ReactElement {
  return (
    <CloseButton
      {...props}
      ref={ref}
      className={classNames('right-4 z-1', className)}
      style={{ position: 'absolute', ...style }}
    />
  );
}

export const ModalCloseButton = forwardRef(ModalCloseButtonComponent);
