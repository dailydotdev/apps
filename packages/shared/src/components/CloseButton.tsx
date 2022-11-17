import classNames from 'classnames';
import React, { forwardRef, ReactElement, Ref } from 'react';
import { Button, StyledButtonProps, ButtonProps } from './buttons/Button';
import CloseIcon from './icons/Close';

type CloseButtonProps = StyledButtonProps & ButtonProps<'button'>;

function CloseButtonComponent(
  { className, buttonSize = 'small', ...props }: CloseButtonProps,
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
