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
  // A form inside a bottom sheet: the header stays pinned under the grabber
  // while the body scrolls, and the submit sits pinned at the bottom, under
  // the thumb.
  inSheet?: boolean;
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
  inSheet = false,
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

  if (inSheet) {
    return (
      <div className={classNames('flex w-full flex-col', className?.container)}>
        <PageHeader
          className={classNames(
            'sticky top-5 z-2 -mx-4 flex min-h-11 flex-row items-center gap-2 border-b border-border-subtlest-tertiary bg-background-default px-4 py-2',
            className?.header,
          )}
          ref={headerRef}
        >
          {title && (
            <span className="min-w-0 flex-1 truncate text-center font-bold typo-body">
              {title}
            </span>
          )}
          {headerActions && (
            <div className="ml-auto flex items-center gap-2">
              {headerActions}
            </div>
          )}
        </PageHeader>
        {children}
        <div className="sticky bottom-0 z-2 -mx-4 -mb-[max(env(safe-area-inset-bottom,0.75rem),0.75rem)] mt-4 flex gap-3 border-t border-border-subtlest-tertiary bg-background-default px-4 pb-[max(env(safe-area-inset-bottom,0.75rem),0.75rem)] pt-3">
          <Button
            {...leftButtonProps}
            variant={ButtonVariant.Float}
            className={classNames('flex-1', leftButtonProps.className)}
          >
            {left}
          </Button>
          <Button
            {...rightButtonProps}
            variant={ButtonVariant.Primary}
            form={form}
            className={classNames('flex-1', rightButtonProps.className)}
          >
            {right}
          </Button>
        </div>
      </div>
    );
  }

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
