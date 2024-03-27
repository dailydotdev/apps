import React, { ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import { Button, ButtonProps, ButtonVariant } from '../../buttons/Button';

interface Copy {
  left?: string;
  right?: string;
}
interface ClassName {
  container?: string;
  header?: string;
}
export interface FormWrapperProps {
  children: ReactNode;
  className?: string | ClassName;
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
  const containerClassName =
    typeof className === 'string' ? className : className?.container;
  const headerClassName =
    typeof className === 'string' ? '' : className?.header;

  return (
    <div className={classNames('flex flex-col', containerClassName)}>
      <div
        className={classNames(
          'flex flex-row justify-between border-b border-theme-divider-tertiary px-4 py-2',
          headerClassName,
        )}
      >
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
