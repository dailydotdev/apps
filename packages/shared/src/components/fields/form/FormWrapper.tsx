import React, { MutableRefObject, ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import { Button, ButtonProps, ButtonVariant } from '../../buttons/Button';
import classed from '../../../lib/classed';
import { ArrowIcon } from '../../icons';

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
  title?: string;
  isCancelArrow?: boolean;
  headerRef?: MutableRefObject<HTMLDivElement>;
}

const Title = classed('h2', 'px-4 font-bold');

export function FormWrapper({
  children,
  className,
  form,
  copy = {},
  leftButtonProps = {},
  rightButtonProps = {},
  title,
  isCancelArrow,
  headerRef,
}: FormWrapperProps): ReactElement {
  const { left = 'Cancel', right = 'Submit' } = copy;
  const titleElement = (
    <Title
      className={classNames(
        !isCancelArrow && 'mt-5',
        className?.title ?? 'typo-body',
      )}
    >
      {title}
    </Title>
  );

  return (
    <div className={classNames('flex flex-col', className?.container)}>
      <div
        className={classNames(
          'flex flex-row items-center border-b border-border-subtlest-tertiary px-4 py-2',
          className?.header,
        )}
        ref={headerRef}
      >
        <Button
          {...leftButtonProps}
          icon={isCancelArrow ? <ArrowIcon className="-rotate-90" /> : null}
          variant={ButtonVariant.Tertiary}
        >
          {isCancelArrow ? null : left}
        </Button>
        {isCancelArrow && title && titleElement}
        <Button
          {...rightButtonProps}
          variant={ButtonVariant.Primary}
          form={form}
          className={classNames('ml-auto', rightButtonProps.className)}
        >
          {right}
        </Button>
      </div>
      {!isCancelArrow && title && titleElement}
      {children}
    </div>
  );
}
