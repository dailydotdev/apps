import React, { forwardRef, ReactElement, Ref } from 'react';
import classNames from 'classnames';
import { ButtonProps } from '../../buttons/Button';
import CloseButton from '../../CloseButton';
import { useModalContext } from './types';

type ModalCloseProps = ButtonProps<'button'> & {
  position?: 'absolute' | 'fixed' | 'relative' | 'sticky' | 'static';
  zIndex?: '0' | '1' | '2';
  right?: '0' | '1' | '2' | '3' | '4';
  top?: '0' | '1' | '2' | '3' | '4';
};

const ZIndexToClassName = {
  '0': 'z-0',
  '1': 'z-1',
  '2': 'z-2',
};

const RightToClassName = {
  '0': 'right-0',
  '1': 'right-1',
  '2': 'right-2',
  '3': 'right-3',
  '4': 'right-4',
};

const TopToClassName = {
  '0': 'top-0',
  '1': 'top-1',
  '2': 'top-2',
  '3': 'top-3',
  '4': 'top-4',
};

function ModalCloseComponent(
  {
    className,
    onClick,
    position = 'absolute',
    zIndex = '1',
    right = '2',
    top,
    ...props
  }: ModalCloseProps,
  ref: Ref<HTMLButtonElement>,
): ReactElement {
  const { isDrawer } = useModalContext();

  if (!onClick && isDrawer) {
    return null;
  }

  return (
    <CloseButton
      {...props}
      onClick={onClick}
      ref={ref}
      className={classNames(
        'hidden tablet:flex',
        position,
        ZIndexToClassName[zIndex],
        RightToClassName[right],
        top && TopToClassName[top],
        className,
      )}
    />
  );
}

export const ModalClose = forwardRef(ModalCloseComponent);
