import React, { ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import { Button, ButtonVariant } from '../../buttons/Button';

interface Copy {
  left?: string;
  right?: string;
}

interface FormWrapperProps {
  children: ReactNode;
  className?: string;
  form: string;
  copy?: Copy;
  onLeftClick?(): void;
  onRightClick?(): void;
}

export function FormWrapper({
  children,
  className,
  form,
  copy = {},
  onLeftClick,
  onRightClick,
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
      {children}
    </div>
  );
}
