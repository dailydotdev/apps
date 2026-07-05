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
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
  useGetIconWithSizeV2,
} from './common';
import classed from '../../lib/classed';

export type IconType = React.ReactElement<IconProps>;

export { ButtonColor, ButtonSize, ButtonVariant, ButtonIconPosition };

const SizeToClassNameV2: Record<ButtonSize, string> = {
  [ButtonSize.XLarge]: 'h-14 rounded-16 typo-title3',
  [ButtonSize.Large]: 'h-12 rounded-14 typo-body',
  [ButtonSize.Medium]: 'h-10 rounded-12 typo-callout',
  [ButtonSize.Small]: 'h-8 rounded-10 typo-footnote',
  [ButtonSize.XSmall]: 'h-6 rounded-8 typo-caption1',
};

const HorizontalPaddingV2: Record<ButtonSize, string> = {
  [ButtonSize.XLarge]: 'px-7',
  [ButtonSize.Large]: 'px-6',
  [ButtonSize.Medium]: 'px-4',
  [ButtonSize.Small]: 'px-3',
  [ButtonSize.XSmall]: 'px-2',
};

// Asymmetric padding for icon+label buttons: icon side ≈ ½ of label side.
const IconSidePaddingV2: Record<ButtonSize, { left: string; right: string }> = {
  [ButtonSize.XLarge]: { left: 'pl-5 pr-7', right: 'pl-7 pr-5' },
  [ButtonSize.Large]: { left: 'pl-4 pr-6', right: 'pl-6 pr-4' },
  [ButtonSize.Medium]: { left: 'pl-2 pr-4', right: 'pl-4 pr-2' },
  [ButtonSize.Small]: { left: 'pl-1.5 pr-3', right: 'pl-3 pr-1.5' },
  [ButtonSize.XSmall]: { left: 'pl-1 pr-2', right: 'pl-2 pr-1' },
};

const IconOnlySizeToClassNameV2: Record<ButtonSize, string> = {
  [ButtonSize.XLarge]: 'h-16 w-16 p-0 rounded-16 typo-title3',
  [ButtonSize.Large]: 'h-12 w-12 p-0 rounded-14 typo-body',
  [ButtonSize.Medium]: 'h-10 w-10 p-0 rounded-12 typo-callout',
  [ButtonSize.Small]: 'h-8 w-8 p-0 rounded-10 typo-footnote',
  [ButtonSize.XSmall]: 'h-6 w-6 p-0 rounded-8 typo-caption1',
};

const SizeToGapV2: Record<ButtonSize, string> = {
  [ButtonSize.XLarge]: 'gap-2',
  [ButtonSize.Large]: 'gap-1.5',
  [ButtonSize.Medium]: 'gap-1',
  [ButtonSize.Small]: 'gap-1',
  [ButtonSize.XSmall]: 'gap-1',
};

const VariantToClassNameV2: Record<ButtonVariant, string> = {
  [ButtonVariant.Primary]: 'btn-v2-primary',
  [ButtonVariant.Secondary]: 'btn-v2-secondary',
  [ButtonVariant.Tertiary]: 'btn-v2-tertiary',
  [ButtonVariant.Float]: 'btn-v2-tertiaryFloat',
  [ButtonVariant.Subtle]: 'btn-v2-subtle',
  [ButtonVariant.Option]: 'btn-v2-option gap-1',
  [ButtonVariant.Quiz]: 'btn-v2-quiz',
};

// `Quiz` excluded — visuals come from buttons-v2.css @apply rules, not per-color tokens.
const ColorableVariants: ReadonlyArray<ButtonVariant> = [
  ButtonVariant.Primary,
  ButtonVariant.Secondary,
  ButtonVariant.Tertiary,
  ButtonVariant.Float,
  ButtonVariant.Subtle,
  ButtonVariant.Option,
];

const variantColorClass = (
  variant: ButtonVariant,
  color: ButtonColor,
): string | undefined => {
  if (!ColorableVariants.includes(variant)) {
    return undefined;
  }
  if (variant === ButtonVariant.Float) {
    return `btn-v2-tertiaryFloat-${color}`;
  }
  return `btn-v2-${variant}-${color}`;
};

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

export type ButtonV2Props<T extends AllowedTags> = BaseButtonProps &
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
  iconOnly ? IconOnlySizeToClassNameV2[size] : SizeToClassNameV2[size];

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
      return IconSidePaddingV2[size].left;
    }
    if (iconPosition === ButtonIconPosition.Right) {
      return IconSidePaddingV2[size].right;
    }
  }
  return HorizontalPaddingV2[size];
};

function ButtonV2Component<TagName extends AllowedTags>(
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
  }: ButtonV2Props<TagName>,
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
  const getIconWithSize = useGetIconWithSizeV2(size, iconOnly, iconPosition);
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
        'btn-v2 inline-flex select-none flex-row items-center border no-underline shadow-none',
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
        !iconOnly && icon && hasChildren && SizeToGapV2[size],
        iconPosition === ButtonIconPosition.Top && 'flex-col !gap-0.5 !px-2',
        variant && !color && VariantToClassNameV2[variant],
        variant && color && variantColorClass(variant, color),
        className,
      )}
      onMouseEnter={(event: ReactMouseEvent<AllowedElements>) => {
        props.onMouseEnter?.(event);
        setIsHovering(true);
      }}
      onMouseLeave={(event: ReactMouseEvent<AllowedElements>) => {
        props.onMouseLeave?.(event);
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

export const ButtonV2 = forwardRef(ButtonV2Component);

export const ButtonV2Group = classed(
  'div',
  'flex gap-1 rounded-14 border border-border-subtlest-tertiary p-1',
);
