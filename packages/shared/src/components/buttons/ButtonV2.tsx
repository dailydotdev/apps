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

/**
 * Size scale — height, radius, AND typography. Horizontal padding is
 * applied separately (`HorizontalPaddingV2` / `IconSidePaddingV2`)
 * so we can tighten the icon side when an icon is present.
 *
 * v1 (and the early v2 pass) hardcoded `typo-callout` (15 px) for every
 * size, which made XSmall chips feel jammed and XLarge hero CTAs feel
 * lost. The new scale moves type alongside the button:
 *
 *   XSmall  24 px  → typo-caption1 (12 px) — chips / tags
 *   Small   32 px  → typo-footnote (13 px) — toolbar / card row
 *   Medium  40 px  → typo-callout  (15 px) — standard CTA (Claude default)
 *   Large   48 px  → typo-body     (17 px) — emphasis CTA (Apple HIG body)
 *   XLarge  56 px  → typo-title3   (20 px) — hero / marketing
 *
 * Radius keeps the Claude-leaning 8 → 16 ladder. No "pill" — house rule
 * is "always rectangle with corner radius".
 */
const SizeToClassNameV2: Record<ButtonSize, string> = {
  [ButtonSize.XLarge]: 'h-14 rounded-16 typo-title3',
  [ButtonSize.Large]: 'h-12 rounded-14 typo-body',
  [ButtonSize.Medium]: 'h-10 rounded-12 typo-callout',
  [ButtonSize.Small]: 'h-8 rounded-10 typo-footnote',
  [ButtonSize.XSmall]: 'h-6 rounded-8 typo-caption1',
};

/**
 * Default symmetric horizontal padding (label-only buttons).
 *
 * Padding scales with size to keep the pad-to-height ratio stable at the
 * top end: the previous 20 / 20 px at Large / XLarge gave a falling ratio
 * (0.42 / 0.36), so big buttons read as proportionally tight. The 24 / 28
 * scale holds a 0.5 ratio (Primer / Material / Apple hero CTA convention).
 */
const HorizontalPaddingV2: Record<ButtonSize, string> = {
  [ButtonSize.XLarge]: 'px-7',
  [ButtonSize.Large]: 'px-6',
  [ButtonSize.Medium]: 'px-4',
  [ButtonSize.Small]: 'px-3',
  [ButtonSize.XSmall]: 'px-2',
};

/**
 * Asymmetric horizontal padding for buttons that pair an icon with a
 * label — the icon side is roughly **half** the label side so the
 * icon's visual mass doesn't push the content off-center.
 *
 * Reference platforms converge on an icon-side : label-side ratio of
 * about **1 : 2** (Material 3, Apple HIG, GitHub Primer, Linear, Notion).
 *
 * Concrete steps (icon side ≈ ½ of `HorizontalPaddingV2`):
 *
 *   XSmall  px-2 → pl-1   / pr-2     (4  / 8  px)
 *   Small   px-3 → pl-1.5 / pr-3     (6  / 12 px)
 *   Medium  px-4 → pl-2   / pr-4     (8  / 16 px)
 *   Large   px-6 → pl-4   / pr-6     (16 / 24 px)
 *   XLarge  px-7 → pl-5   / pr-7     (20 / 28 px)
 *
 * Mirror values applied for icon-on-right callsites.
 */
const IconSidePaddingV2: Record<ButtonSize, { left: string; right: string }> = {
  [ButtonSize.XLarge]: { left: 'pl-5 pr-7', right: 'pl-7 pr-5' },
  [ButtonSize.Large]: { left: 'pl-4 pr-6', right: 'pl-6 pr-4' },
  [ButtonSize.Medium]: { left: 'pl-2 pr-4', right: 'pl-4 pr-2' },
  [ButtonSize.Small]: { left: 'pl-1.5 pr-3', right: 'pl-3 pr-1.5' },
  [ButtonSize.XSmall]: { left: 'pl-1 pr-2', right: 'pl-2 pr-1' },
};

/**
 * Icon-only buttons don't render a label, so font-size is a no-op for
 * them — but we still emit the typo-* class to keep CSS predictable
 * (same selector specificity / cascade as the text variant).
 */
const IconOnlySizeToClassNameV2: Record<ButtonSize, string> = {
  [ButtonSize.XLarge]: 'h-16 w-16 p-0 rounded-16 typo-title3',
  [ButtonSize.Large]: 'h-12 w-12 p-0 rounded-14 typo-body',
  [ButtonSize.Medium]: 'h-10 w-10 p-0 rounded-12 typo-callout',
  [ButtonSize.Small]: 'h-8 w-8 p-0 rounded-10 typo-footnote',
  [ButtonSize.XSmall]: 'h-6 w-6 p-0 rounded-8 typo-caption1',
};

/**
 * Icon-to-label spacing per size.
 *
 * v2 first-pass scaled the gap with button size (gap-1 → gap-2.5)
 * following Linear / Notion's "modern, breathable" convention. On
 * migration this read as visibly looser than v1 across every size:
 * v1's `mr-1` (4 px) on the icon — combined with the now-retired
 * `-ml-2` negative-margin trick — produced an *effective* 4 px gap
 * between icon and label regardless of size. v2's 6 – 10 px gaps on
 * Small / Medium / Large / XLarge made every icon+label button read
 * as wider than its v1 sibling, with the worst case (XLarge) ~22 px
 * wider. Toolbars and header strips that pack 3-5 buttons in a row
 * felt visibly looser than the surfaces all the call sites were
 * tuned for.
 *
 * Restoring v1's flat 4 px gap (`gap-1`) on the most-common sizes
 * (XSmall / Small / Medium) and a single-step bump on the largest
 * sizes keeps icon+label buttons visually identical to v1 on every
 * toolbar surface while preserving a touch of extra breathing room
 * on hero / emphasis CTAs.
 *
 *   XSmall  gap-1   (4 px)  — matches v1
 *   Small   gap-1   (4 px)  — matches v1
 *   Medium  gap-1   (4 px)  — matches v1
 *   Large   gap-1.5 (6 px)  — slight bump for emphasis CTA
 *   XLarge  gap-2   (8 px)  — slight bump for hero CTA
 */
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

/**
 * `Quiz` is intentionally excluded — its visuals come from the v2 CSS
 * file (@apply rules), not from per-color tokens. v1 listed quiz-color
 * mappings that were never emitted.
 */
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
  /**
   * Primer-style "looks active, behaves disabled". Renders default
   * visuals + `aria-disabled="true"` + `cursor: not-allowed` but
   * remains keyboard-focusable and `onClick`-firing so callers can
   * surface a tooltip/toast explaining why the action isn't available.
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
   * links). Off by default; the four favorites are 3-of-4 in favour
   * of pointer on buttons, matching daily.dev convention.
   */
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

/**
 * Variant-driven font weight (ChatGPT pattern).
 *
 * Hierarchy carried by fill/border, not weight uniformity. Inter
 * ships 500/600/700 as standard weights — no Variable axis required.
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
  iconOnly ? IconOnlySizeToClassNameV2[size] : SizeToClassNameV2[size];

/**
 * Pick the right horizontal padding for an icon+label combo:
 * - icon-only → none (square; padding lives in `IconOnlySizeToClassNameV2`)
 * - icon on left + label → tighten the LEFT padding (1:2 ratio)
 * - icon on right + label → tighten the RIGHT padding (1:2 ratio)
 * - top-position icon → handled separately (`!px-2` override applies)
 * - label only → symmetric default
 */
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

  // For `inactive`, we keep the element interactive (no `disabled` attr)
  // but mark it via aria-disabled. Disabled is the hard-stop variant.
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
        // Tighten letter spacing on the largest sizes — typo-title3 (20 px)
        // and typo-body (17 px) read better with -1 % tracking, matching
        // Apple SF Pro and Inter's recommendations for display sizes.
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
        // Icon-to-label gap only applies when both an icon AND a label
        // are present. Icon-only buttons center the icon inside h-X w-X.
        // Top-position icons get column flex with a tighter vertical gap.
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
        // `truncate` + `min-w-0` so a full-width button (`w-full`) with a
        // long label ellipsises cleanly instead of overflowing or pushing
        // a trailing icon out of bounds. `min-w-0` is mandatory on flex
        // children for `truncate` to actually shrink them; without it the
        // span keeps its content size and the ellipsis never triggers.
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

/**
 * v2 ButtonGroup — outer radius is one step bigger than the medium
 * button radius so children nest cleanly without bleeding to the edge.
 */
export const ButtonV2Group = classed(
  'div',
  'flex gap-1 rounded-14 border border-border-subtlest-tertiary p-1',
);
