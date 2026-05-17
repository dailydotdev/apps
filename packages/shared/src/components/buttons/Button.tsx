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
  /**
   * Primer-style "looks active, behaves disabled". Renders default
   * visuals + `aria-disabled="true"` + `cursor: not-allowed` but
   * remains keyboard-focusable and `onClick`-firing so callers can
   * surface a tooltip / toast explaining why the action isn't
   * available.
   */
  inactive?: boolean;
  /**
   * Bumps Primary from `font-semibold` (600) to `font-bold` (700) for
   * marketing-heavy CTAs. Has no effect on other variants.
   */
  bold?: boolean;
  /**
   * HIG-pure preview: render with default cursor instead of pointer
   * (matches Apple / Microsoft / W3C guidance that pointer is for
   * links). Off by default; daily.dev's convention is pointer on
   * buttons.
   */
  useDefaultCursor?: boolean;
  children?: ReactNode;
  tag?: React.ElementType & AllowedTags;
}

// when color is present, variant is required
type ColorButtonProps =
  | { color: ButtonColor; variant: ButtonVariant }
  | { color?: never; variant?: ButtonVariant };

// when iconPosition is present, icon is required
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

/**
 * Variant-driven font weight — same contract as V2 (ChatGPT pattern).
 * Hierarchy is carried by fill / border, not weight uniformity, so we
 * drop V1's universal `font-bold`.
 */
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

  // `inactive` keeps the element interactive (no `disabled` attr) but
  // marks it via `aria-disabled` so screen readers announce the state.
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
        // Tighten letter spacing on the largest sizes — typo-title3 (20 px)
        // and typo-body (17 px) read better with -1 % tracking.
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
        // `truncate` + `min-w-0` so a full-width button (`w-full`) with a
        // long label ellipsises cleanly. `min-w-0` is mandatory on flex
        // children for `truncate` to actually shrink them.
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

/**
 * `Button` is daily.dev's default button. The V1 component shell is kept
 * for back-compat with every existing call site; the visual layer
 * underneath now matches `ButtonV2` (same tokens, same polish, same
 * size/typo/gap/padding scale). See `Buttons.mdx` for the design DNA.
 */
export const Button = forwardRef(ButtonComponent);
