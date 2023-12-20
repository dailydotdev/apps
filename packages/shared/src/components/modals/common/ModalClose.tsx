import React, { forwardRef, ReactElement, Ref } from 'react';
import classNames from 'classnames';
import { ButtonProps } from '../../buttons/ButtonV2';
import CloseButton from '../../CloseButton';

type ModalCloseProps = ButtonProps<'button'> & {
  absolute?: boolean;
};

function ModalCloseComponent(
  { className, onClick, absolute = true, ...props }: ModalCloseProps,
  ref: Ref<HTMLButtonElement>,
): ReactElement {
  if (!onClick) {
    return null;
  }
  return (
    <CloseButton
      {...props}
      onClick={onClick}
      ref={ref}
      className={classNames('right-2 z-1', { absolute }, className)}
    />
  );
}

export const ModalClose = forwardRef(ModalCloseComponent);
