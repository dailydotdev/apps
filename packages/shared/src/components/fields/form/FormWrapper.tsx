import type { MutableRefObject, ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { ButtonProps } from '../../buttons/Button';
import { Button, ButtonVariant } from '../../buttons/Button';
import { PageHeader, PageHeaderTitle } from '../../layout/common';
import { ShellPage } from '../../shell/ShellPageContext';

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
  headerActions?: ReactNode;
  title?: string | React.ReactNode;
  isHeaderTitle?: boolean;
  headerRef?: MutableRefObject<HTMLDivElement>;
  // A page form on a phone: the block carries the title and the submit,
  // its back square stands in for the left button.
  inBlock?: boolean;
}

export function FormWrapper({
  children,
  className,
  form,
  copy = {},
  leftButtonProps = {},
  rightButtonProps = {},
  headerActions,
  title,
  isHeaderTitle,
  headerRef,
  inBlock = false,
}: FormWrapperProps): ReactElement {
  const { left = 'Cancel', right = 'Submit' } = copy;
  const titleElement = (
    <PageHeaderTitle
      className={classNames(
        'mx-4',
        !isHeaderTitle && 'mt-5',
        className?.title ?? 'typo-body',
      )}
    >
      {title}
    </PageHeaderTitle>
  );

  const submitButton = (
    <Button
      {...rightButtonProps}
      variant={ButtonVariant.Primary}
      form={form}
      className={rightButtonProps.className}
    >
      {right}
    </Button>
  );

  if (inBlock) {
    return (
      <div className={classNames('flex w-full flex-col', className?.container)}>
        <ShellPage
          title={title}
          actions={
            <div className="flex items-center gap-2">
              {headerActions}
              {submitButton}
            </div>
          }
        />
        {children}
      </div>
    );
  }

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
        <div className="ml-auto flex items-center gap-2">
          {headerActions}
          {submitButton}
        </div>
      </PageHeader>
      {!isHeaderTitle && title && titleElement}
      {children}
    </div>
  );
}
