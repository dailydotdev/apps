import type { MutableRefObject, ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { ButtonProps } from '../../buttons/Button';
import { Button, ButtonVariant } from '../../buttons/Button';
import { PageHeader, PageHeaderTitle } from '../../layout/common';

interface Copy {
  left?: string;
  right?: string;
}
interface ClassName {
  container?: string;
  header?: string;
  title?: string;
}
export interface FormWrapperProps {
  children: ReactNode;
  className?: ClassName;
  form: string;
  copy?: Copy;
  leftButtonProps?: ButtonProps<'button'>;
  rightButtonProps?: ButtonProps<'button'>;
  title?: string | React.ReactNode;
  isHeaderTitle?: boolean;
  headerRef?: MutableRefObject<HTMLDivElement>;
}

export function FormWrapper({
  children,
  className,
  form,
  copy = {},
  leftButtonProps = {},
  rightButtonProps = {},
  title,
  isHeaderTitle,
  headerRef,
}: FormWrapperProps): ReactElement {
  const { left = 'Cancel', right = 'Submit' } = copy;
  const titleElement = (
    <PageHeaderTitle
      className={classNames(
        !isHeaderTitle && 'mt-5',
        className?.title ?? 'typo-body',
      )}
    >
      {title}
    </PageHeaderTitle>
  );

  return (
    <div className={classNames('flex w-full flex-col', className?.container)}>
      <PageHeader
        className={classNames(
          'flex flex-row items-center border-b border-border-subtlest-tertiary px-4 py-2',
          className?.header,
        )}
        ref={headerRef}
      >
        <Button {...leftButtonProps} variant={ButtonVariant.Tertiary}>
          {isHeaderTitle ? null : left}
        </Button>
        {isHeaderTitle && title && titleElement}
        <Button
          {...rightButtonProps}
          variant={ButtonVariant.Primary}
          form={form}
          className={classNames('ml-auto', rightButtonProps.className)}
        >
          {right}
        </Button>
      </PageHeader>
      {!isHeaderTitle && title && titleElement}
      {children}
    </div>
  );
}
