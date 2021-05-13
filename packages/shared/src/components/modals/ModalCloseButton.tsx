import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Button, ButtonProps } from '../buttons/Button';
import XIcon from '../../../icons/x.svg';

export function ModalCloseButton({
  className,
  style,
  ...props
}: ButtonProps<'button'>): ReactElement {
  return (
    <Button
      {...props}
      className={classNames('btn-tertiary right-4 top-4', className)}
      buttonSize="small"
      title="Close"
      icon={<XIcon />}
      style={{ position: 'absolute', ...style }}
    />
  );
}
