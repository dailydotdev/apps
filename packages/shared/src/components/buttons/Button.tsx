import React, {
  HTMLAttributes,
  ReactNode,
  ReactElement,
  Ref,
  forwardRef,
} from 'react';
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
  absolute?: boolean;
}

export type AllowedTags = keyof Pick<JSX.IntrinsicElements, 'a' | 'button'>;
export type AllowedElements = HTMLButtonElement | HTMLAnchorElement;
export type ProperButtonType<Tag extends AllowedTags> = Tag extends 'a'
  ? HTMLAnchorElement
  : HTMLButtonElement;

export type ButtonProps<Tag extends AllowedTags> = BaseButtonProps &
  HTMLAttributes<AllowedElements> &
  JSX.IntrinsicElements[Tag] & {
    ref?: Ref<ProperButtonType<Tag>>;
  };

function ButtonComponent<TagName extends AllowedTags>(
  {
    loading,
    pressed,
    icon,
    rightIcon,
    buttonSize,
    children,
    tag: Tag = 'button',
    className,
    displayClass,
    absolute,
    ...props
  }: StyledButtonProps & ButtonProps<TagName>,
  ref?: Ref<ProperButtonType<TagName>>,
): ReactElement {
  const iconOnly = icon && !children && !rightIcon;
  return (
    <Tag
      {...(props as StyledButtonProps)}
      aria-busy={loading}
      aria-pressed={pressed}
      ref={ref}
      className={classNames(
        { iconOnly },
        buttonSize,
        'btn flex-row items-center justify-center border typo-callout font-bold no-underline shadow-none cursor-pointer select-none focus-outline',
        displayClass || 'flex',
        absolute ? 'absolute' : 'relative',
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

export const Button = forwardRef(ButtonComponent);
