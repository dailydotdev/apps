import React, { LegacyRef, ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import { Loader } from '../Loader';

export type ButtonSize = 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge';

export interface StyledButtonProps {
  buttonSize?: ButtonSize;
  iconOnly?: boolean;
}

export interface BaseButtonProps {
  buttonSize?: ButtonSize;
  loading?: boolean;
  pressed?: boolean;
  tag?: React.ElementType;
  icon?: ReactNode;
  rightIcon?: ReactNode;
  children?: ReactNode;
  displayClass?: string;
}

export type ButtonProps<Tag extends keyof JSX.IntrinsicElements> =
  BaseButtonProps &
    JSX.IntrinsicElements[Tag] & {
      innerRef?: LegacyRef<JSX.IntrinsicElements[Tag]>;
    };

// eslint-disable-next-line @typescript-eslint/no-redeclare
export function Button<Tag extends keyof JSX.IntrinsicElements>({
  loading,
  pressed,
  icon,
  rightIcon,
  buttonSize,
  children,
  tag: Tag = 'button',
  innerRef,
  className,
  displayClass,
  ...props
}: StyledButtonProps & ButtonProps<Tag>): ReactElement {
  const iconOnly = icon && !children && !rightIcon;
  return (
    <Tag
      {...(props as StyledButtonProps)}
      aria-busy={loading}
      aria-pressed={pressed}
      ref={innerRef}
      className={classNames(
        { iconOnly },
        buttonSize,
        'btn relative flex-row items-center justify-center border typo-callout font-bold no-underline shadow-none cursor-pointer select-none focus-outline',
        displayClass || 'flex',
        className,
      )}
    >
      {icon}
      {children && <span>{children}</span>}
      {rightIcon}
      {loading && (
        <Loader
          data-testid="buttonLoader"
          className="hidden absolute top-0 right-0 bottom-0 left-0 m-auto btn-loader"
        />
      )}
    </Tag>
  );
}
