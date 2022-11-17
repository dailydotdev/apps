import classNames from 'classnames';
import React, { forwardRef, ReactElement, Ref } from 'react';
import {
  Button,
  StyledButtonProps,
  ButtonProps,
  ButtonSize,
} from './buttons/Button';
import CloseIcon from './icons/Close';

type CloseButtonProps = StyledButtonProps &
  ButtonProps<'button'> & {
    size?: ButtonSize;
  };

function CloseButtonComponent(
  { className, size = 'small', ...props }: CloseButtonProps,
  ref: Ref<HTMLButtonElement>,
): ReactElement {
  return (
    <Button
      buttonSize={size}
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
