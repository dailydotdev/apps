import type {
  HTMLAttributes,
  MouseEvent as ReactMouseEvent,
  ReactElement,
  ReactNode,
  Ref,
} from 'react';
import React, { forwardRef, useState } from 'react';
import classNames from 'classnames';
import type { IconProps } from '../Icon';
import { Loader } from '../Loader';
import { combinedClicks } from '../../lib/click';

import { ColorName as ButtonColor } from '../../styles/colors';
import {
  ButtonSize,
  ButtonVariant,
  ButtonIconPosition,
  useGetIconWithSize,
  IconOnlySizeToClassName,
  SizeToClassName,
  HorizontalPadding,
  IconSidePadding,
  SizeToGap,
  VariantColorToClassName,
  VariantToClassName,
} from './common';
import classed from '../../lib/classed';

export type IconType = React.ReactElement<IconProps>;

export { ButtonColor, ButtonSize, ButtonVariant, ButtonIconPosition };

export const ButtonGroup = classed(
  'div',
  'flex gap-1 rounded-14 border border-border-subtlest-tertiary p-1',
);

interface CommonButtonProps {
  size?: ButtonSize;
  loading?: boolean;
  pressed?: boolean;
  disabled?: boolean;
  // Looks active, behaves disabled: aria-disabled + not-allowed cursor,
  // but stays focusable and onClick still fires (for tooltip/toast).
  inactive?: boolean;
  bold?: boolean;
  useDefaultCursor?: boolean;
  children?: ReactNode;
  tag?: React.ElementType & AllowedTags;
}

type ColorButtonProps =
  | { color: ButtonColor; variant: ButtonVariant }
  | { color?: never; variant?: ButtonVariant };

type IconButtonProps =
  | {
      iconPosition: ButtonIconPosition;
      icon: IconType;
      iconSecondaryOnHover?: boolean;
    }
  | { iconPosition?: never; icon?: IconType; iconSecondaryOnHover?: boolean };

type BaseButtonProps = CommonButtonProps & ColorButtonProps & IconButtonProps;

export type AllowedTags = keyof Pick<JSX.IntrinsicElements, 'a' | 'button'>;
export type AllowedElements = HTMLButtonElement | HTMLAnchorElement;
export type ButtonElementType<Tag extends AllowedTags> = Tag extends 'a'
  ? HTMLAnchorElement
  : HTMLButtonElement;

export type ButtonProps<T extends AllowedTags> = BaseButtonProps &
  HTMLAttributes<AllowedElements> &
  JSX.IntrinsicElements[T] & {
    ref?: Ref<ButtonElementType<T>>;
  };

const variantFontWeight = (
  variant: ButtonVariant | undefined,
  bold: boolean | undefined,
): string => {
  if (variant === ButtonVariant.Option || variant === ButtonVariant.Quiz) {
    return 'font-medium';
  }
  if (variant === ButtonVariant.Primary) {
    return bold ? 'font-bold' : 'font-semibold';
  }
  return 'font-medium';
};

const sizeClassMap = (size: ButtonSize, iconOnly: boolean): string =>
  iconOnly ? IconOnlySizeToClassName[size] : SizeToClassName[size];

const horizontalPaddingClass = (
  size: ButtonSize,
  iconOnly: boolean,
  hasIcon: boolean,
  hasChildren: boolean,
  iconPosition: ButtonIconPosition,
): string | null => {
  if (iconOnly) {
    return null;
  }
  if (hasIcon && hasChildren) {
    if (iconPosition === ButtonIconPosition.Left) {
      return IconSidePadding[size].left;
    }
    if (iconPosition === ButtonIconPosition.Right) {
      return IconSidePadding[size].right;
    }
  }
  return HorizontalPadding[size];
};

function ButtonComponent<TagName extends AllowedTags>(
  {
    variant,
    size = ButtonSize.Medium,
    color,
    className,
    icon,
    iconPosition = ButtonIconPosition.Left,
    iconSecondaryOnHover = false,
    loading,
    pressed,
    inactive,
    bold,
    useDefaultCursor,
    disabled,
    children,
    onClick,
    tag: Tag = 'button',
    ...props
  }: ButtonProps<TagName>,
  ref?: Ref<ButtonElementType<TagName>>,
): ReactElement {
  const childNodes = React.Children.toArray(children);
  const hasChildren = childNodes.length > 0;
  const shouldWrapLabel =
    hasChildren &&
    childNodes.every(
      (child) => typeof child === 'string' || typeof child === 'number',
    );
  const iconOnly = !!(icon && !hasChildren);
  const getIconWithSize = useGetIconWithSize(size, iconOnly, iconPosition);
  const isAnchor = Tag === 'a';
  const anchorClickProps =
    isAnchor && onClick
      ? combinedClicks<HTMLAnchorElement>(
          onClick as React.MouseEventHandler<HTMLAnchorElement>,
        )
      : {};
  const isOptionOrQuiz =
    variant === ButtonVariant.Option || variant === ButtonVariant.Quiz;
  const [isHovering, setIsHovering] = useState(false);

  const ariaDisabled = inactive && !disabled ? true : undefined;

  return (
    <Tag
      {...props}
      {...(isAnchor ? anchorClickProps : { onClick })}
      aria-busy={loading}
      aria-pressed={pressed}
      aria-disabled={ariaDisabled}
      disabled={disabled}
      ref={ref}
      className={classNames(
        'btn inline-flex select-none flex-row items-center border no-underline shadow-none',
        useDefaultCursor ? 'cursor-default' : 'cursor-pointer',
        !isOptionOrQuiz && 'justify-center',
        variantFontWeight(variant, bold),
        (size === ButtonSize.XLarge || size === ButtonSize.Large) &&
          'tracking-[-0.01em]',
        { iconOnly },
        sizeClassMap(size, iconOnly),
        horizontalPaddingClass(
          size,
          iconOnly,
          !!icon,
          hasChildren,
          iconPosition,
        ),
        !iconOnly && icon && hasChildren && SizeToGap[size],
        iconPosition === ButtonIconPosition.Top && 'flex-col !gap-0.5 !px-2',
        variant && !color && VariantToClassName[variant],
        variant && color && VariantColorToClassName[variant]?.[color],
        className,
      )}
      onMouseEnter={(e: ReactMouseEvent<AllowedElements>) => {
        props.onMouseEnter?.(e);
        setIsHovering(true);
      }}
      onMouseLeave={(e: ReactMouseEvent<AllowedElements>) => {
        props.onMouseLeave?.(e);
        setIsHovering(false);
      }}
    >
      {icon &&
        [ButtonIconPosition.Left, ButtonIconPosition.Top].includes(
          iconPosition,
        ) &&
        getIconWithSize(icon, iconSecondaryOnHover ? isHovering : false)}
      {shouldWrapLabel ? (
        <span
          className={classNames(
            'btn-label min-w-0 truncate',
            loading && 'invisible',
          )}
        >
          {children}
        </span>
      ) : (
        children
      )}
      {icon &&
        iconPosition === ButtonIconPosition.Right &&
        getIconWithSize(icon, iconSecondaryOnHover ? isHovering : false)}
      {loading && (
        <Loader
          data-testid="buttonLoader"
          className="btn-loader absolute m-auto"
        />
      )}
    </Tag>
  );
}

export const Button = forwardRef(ButtonComponent);
