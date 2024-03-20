import React, { ReactElement, ReactNode, MouseEventHandler } from 'react';
import classNames from 'classnames';
import { Button, ButtonProps, ButtonVariant } from '../../buttons/Button';

interface Copy {
  left?: string;
  right?: string;
}

export interface FormWrapperProps {
  children: ReactNode;
  className?: string;
  form: string;
  copy?: Copy;
  leftButtonProps?: ButtonProps<'button'>;
  rightButtonProps?: ButtonProps<'button'>;
  title?: string;
}

export function FormWrapper({
  children,
  className,
  form,
  copy = {},
  leftButtonProps = {},
  rightButtonProps = {},
  title,
}: FormWrapperProps): ReactElement {
  return (
    <div className={classNames('flex flex-col', className)}>
      <div className="flex flex-row justify-between border-b border-theme-divider-tertiary px-4 py-2">
        <Button {...leftButtonProps} variant={ButtonVariant.Tertiary}>
          {copy?.left ?? 'Cancel'}
        </Button>
        <Button
          {...rightButtonProps}
          variant={ButtonVariant.Primary}
          form={form}
        >
          {copy?.right ?? 'Submit'}
        </Button>
      </div>
      {title && <p className="mt-5 px-4 font-bold typo-body">{title}</p>}
      {children}
    </div>
  );
}
