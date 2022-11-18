import React, { forwardRef, ReactElement, Ref } from 'react';
import classNames from 'classnames';
import { ButtonProps } from '../../buttons/Button';
import CloseButton from '../../CloseButton';

function ModalCloseComponent(
  { className, style, onClick, ...props }: ButtonProps<'button'>,
  ref: Ref<HTMLButtonElement>,
): ReactElement {
  if (!onClick) return null;
  return (
    <CloseButton
      {...props}
      buttonSize="medium"
      onClick={onClick}
      ref={ref}
      className={classNames('right-2 z-1', className)}
      style={{ position: 'absolute', ...style }}
    />
  );
}

export const ModalClose = forwardRef(ModalCloseComponent);
