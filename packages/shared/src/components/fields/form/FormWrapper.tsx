import React, { ReactElement, ReactNode, MouseEventHandler } from 'react';
import classNames from 'classnames';
import { Button, ButtonVariant } from '../../buttons/Button';

interface Copy {
  left?: string;
  right?: string;
}

export interface FormWrapperProps {
  children: ReactNode;
  className?: string;
  form: string;
  copy?: Copy;
  onLeftClick?: MouseEventHandler;
  onRightClick?: MouseEventHandler;
  title?: string;
}

export function FormWrapper({
  children,
  className,
  form,
  copy = {},
  onLeftClick,
  onRightClick,
  title,
}: FormWrapperProps): ReactElement {
  return (
    <div className={classNames('flex flex-col', className)}>
      <div className="flex flex-row justify-between border-b border-theme-divider-tertiary px-4 py-2">
        <Button variant={ButtonVariant.Tertiary} onClick={onLeftClick}>
          {copy?.left ?? 'Cancel'}
        </Button>
        <Button
          variant={ButtonVariant.Primary}
          onClick={onRightClick}
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
