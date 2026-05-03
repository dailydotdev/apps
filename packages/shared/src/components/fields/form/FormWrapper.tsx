import type { MutableRefObject, ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { ButtonV2Props } from '../../buttons/ButtonV2';
import { ButtonV2, ButtonVariant } from '../../buttons/ButtonV2';
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
  leftButtonProps?: ButtonV2Props<'button'>;
  rightButtonProps?: ButtonV2Props<'button'>;
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
        'mx-4',
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
        <ButtonV2 {...leftButtonProps} variant={ButtonVariant.Tertiary}>
          {isHeaderTitle ? null : left}
        </ButtonV2>
        {isHeaderTitle && title && titleElement}
        <ButtonV2
          {...rightButtonProps}
          variant={ButtonVariant.Primary}
          form={form}
          className={classNames('ml-auto', rightButtonProps.className)}
        >
          {right}
        </ButtonV2>
      </PageHeader>
      {!isHeaderTitle && title && titleElement}
      {children}
    </div>
  );
}
