import classNames from 'classnames';
import React, { forwardRef, ReactElement, Ref } from 'react';
import {
  Button,
  StyledButtonProps,
  ButtonProps,
  ButtonSize,
} from './buttons/Button';
import CloseIcon from './icons/MiniClose';

type CloseButtonProps = StyledButtonProps & ButtonProps<'button'>;

function CloseButtonComponent(
  { className, buttonSize = ButtonSize.Medium, ...props }: CloseButtonProps,
  ref: Ref<HTMLButtonElement>,
): ReactElement {
  return (
    <Button
      {...props}
      buttonSize={buttonSize}
      ref={ref}
      className={classNames('btn-tertiary', className)}
      title="Close"
      icon={<CloseIcon />}
    />
  );
}

const CloseButton = forwardRef(CloseButtonComponent);

export default CloseButton;
