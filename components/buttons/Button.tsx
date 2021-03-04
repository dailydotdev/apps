import React, { LegacyRef, ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import { ColorName } from '../../styles/colors';
import Loader from '../Loader';

export type ButtonSize = 'small' | 'medium' | 'large' | 'xlarge';

export interface ButtonStateStyle {
  background?: string;
  borderColor?: string;
  color?: string;
  shadow?: string;
}

export interface ButtonStatesStyles {
  default?: ButtonStateStyle;
  hover?: ButtonStateStyle;
  active?: ButtonStateStyle;
  pressed?: ButtonStateStyle;
  disabled?: ButtonStateStyle;
}

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
  themeColor?: ColorName;
  children?: ReactNode;
}

export type ButtonProps<
  Tag extends keyof JSX.IntrinsicElements
> = BaseButtonProps &
  JSX.IntrinsicElements[Tag] & { innerRef?: LegacyRef<Tag> };

export default function Button<Tag extends keyof JSX.IntrinsicElements>({
  loading,
  pressed,
  icon,
  rightIcon,
  children,
  tag: Tag = 'button',
  innerRef,
  className,
  ...props
}: StyledButtonProps & ButtonProps<Tag>): ReactElement {
  const iconOnly = icon && !children && !rightIcon;
  return (
    <Tag
      {...(props as StyledButtonProps)}
      aria-busy={loading}
      aria-pressed={pressed}
      ref={innerRef as LegacyRef<HTMLButtonElement>}
      className={classNames(
        { iconOnly },
        props.buttonSize,
        'btn',
        'relative',
        'overflow-hidden',
        'flex',
        'flex-row',
        'items-center',
        'justify-center',
        'border',
        'border-solid',
        'typo-callout',
        'font-bold',
        'no-underline',
        'shadow-none',
        'cursor-pointer',
        'select-none',
        'focus-outline',
        className,
      )}
    >
      {icon}
      {children && <span>{children}</span>}
      {rightIcon}
      {loading && (
        <Loader
          data-testid="buttonLoader"
          className="btn-loader absolute left-0 right-0 top-0 bottom-0 m-auto hidden"
        />
      )}
    </Tag>
  );
}
