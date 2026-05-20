import React from 'react';
import classNames from 'classnames';

import { ColorName as ButtonColor } from '../../styles/colors';
import type { IconProps } from '../Icon';
import { IconSize } from '../Icon';

export enum ButtonSize {
  XLarge = 'xlarge',
  Large = 'large',
  Medium = 'medium',
  Small = 'small',
  XSmall = 'xsmall',
}

export enum ButtonVariant {
  Primary = 'primary',
  Secondary = 'secondary',
  Tertiary = 'tertiary',
  Float = 'tertiaryFloat',
  Subtle = 'subtle',
  Option = 'option',
  Quiz = 'quiz',
}

export enum ButtonIconPosition {
  Left = 'left',
  Right = 'right',
  Top = 'top',
}

/**
 * V1 size scale — re-skinned to match V2.
 *
 * Horizontal padding lives in `HorizontalPadding` (label-only,
 * symmetric) and `IconSidePadding` (icon+label, asymmetric 1:2 ratio)
 * to mirror V2's structure. Typography now scales with size (was a
 * universal `typo-callout` in V1) so XSmall chips read as chips and
 * XLarge hero CTAs read as heroes.
 */
export const SizeToClassName: Record<ButtonSize, string> = {
  [ButtonSize.XLarge]: 'h-14 rounded-16 typo-title3',
  [ButtonSize.Large]: 'h-12 rounded-14 typo-body',
  [ButtonSize.Medium]: 'h-10 rounded-12 typo-callout',
  [ButtonSize.Small]: 'h-8 rounded-10 typo-footnote',
  [ButtonSize.XSmall]: 'h-6 rounded-8 typo-caption1',
};

export const HorizontalPadding: Record<ButtonSize, string> = {
  [ButtonSize.XLarge]: 'px-7',
  [ButtonSize.Large]: 'px-6',
  [ButtonSize.Medium]: 'px-4',
  [ButtonSize.Small]: 'px-3',
  [ButtonSize.XSmall]: 'px-2',
};

export const IconSidePadding: Record<
  ButtonSize,
  { left: string; right: string }
> = {
  [ButtonSize.XLarge]: { left: 'pl-5 pr-7', right: 'pl-7 pr-5' },
  [ButtonSize.Large]: { left: 'pl-4 pr-6', right: 'pl-6 pr-4' },
  [ButtonSize.Medium]: { left: 'pl-2 pr-4', right: 'pl-4 pr-2' },
  [ButtonSize.Small]: { left: 'pl-1.5 pr-3', right: 'pl-3 pr-1.5' },
  [ButtonSize.XSmall]: { left: 'pl-1 pr-2', right: 'pl-2 pr-1' },
};

export const SizeToGap: Record<ButtonSize, string> = {
  [ButtonSize.XLarge]: 'gap-2',
  [ButtonSize.Large]: 'gap-1.5',
  [ButtonSize.Medium]: 'gap-1',
  [ButtonSize.Small]: 'gap-1',
  [ButtonSize.XSmall]: 'gap-1',
};

export const IconOnlySizeToClassName: Record<ButtonSize, string> = {
  [ButtonSize.XLarge]: 'h-16 w-16 p-0 rounded-16 typo-title3',
  [ButtonSize.Large]: 'h-12 w-12 p-0 rounded-14 typo-body',
  [ButtonSize.Medium]: 'h-10 w-10 p-0 rounded-12 typo-callout',
  [ButtonSize.Small]: 'h-8 w-8 p-0 rounded-10 typo-footnote',
  [ButtonSize.XSmall]: 'h-6 w-6 p-0 rounded-8 typo-caption1',
};

export const VariantToClassName: Record<ButtonVariant, string> = {
  [ButtonVariant.Primary]: 'btn-primary',
  [ButtonVariant.Secondary]: 'btn-secondary',
  [ButtonVariant.Tertiary]: 'btn-tertiary',
  [ButtonVariant.Float]: 'btn-tertiaryFloat',
  [ButtonVariant.Subtle]: 'btn-subtle',
  [ButtonVariant.Option]: 'btn-option gap-1',
  [ButtonVariant.Quiz]: 'btn-quiz',
};

export const VariantColorToClassName: Record<
  ButtonVariant,
  Record<ButtonColor, string>
> = {
  [ButtonVariant.Primary]: {
    [ButtonColor.Avocado]: 'btn-primary-avocado',
    [ButtonColor.Bacon]: 'btn-primary-bacon',
    [ButtonColor.BlueCheese]: 'btn-primary-blueCheese',
    [ButtonColor.Bun]: 'btn-primary-bun',
    [ButtonColor.Burger]: 'btn-primary-burger',
    [ButtonColor.Cabbage]: 'btn-primary-cabbage',
    [ButtonColor.Cheese]: 'btn-primary-cheese',
    [ButtonColor.Facebook]: 'btn-primary-facebook',
    [ButtonColor.LinkedIn]: 'btn-primary-linkedin',
    [ButtonColor.Ketchup]: 'btn-primary-ketchup',
    [ButtonColor.Lettuce]: 'btn-primary-lettuce',
    [ButtonColor.Onion]: 'btn-primary-onion',
    [ButtonColor.Pepper]: 'btn-primary-pepper',
    [ButtonColor.Salt]: 'btn-primary-salt',
    [ButtonColor.Reddit]: 'btn-primary-reddit',
    [ButtonColor.Telegram]: 'btn-primary-telegram',
    [ButtonColor.Twitter]: 'btn-primary-twitter',
    [ButtonColor.Water]: 'btn-primary-water',
    [ButtonColor.WhatsApp]: 'btn-primary-whatsapp',
  },
  [ButtonVariant.Secondary]: {
    [ButtonColor.Avocado]: 'btn-secondary-avocado',
    [ButtonColor.Bacon]: 'btn-secondary-bacon',
    [ButtonColor.BlueCheese]: 'btn-secondary-blueCheese',
    [ButtonColor.Bun]: 'btn-secondary-bun',
    [ButtonColor.Burger]: 'btn-secondary-burger',
    [ButtonColor.Cabbage]: 'btn-secondary-cabbage',
    [ButtonColor.Cheese]: 'btn-secondary-cheese',
    [ButtonColor.Facebook]: 'btn-secondary-facebook',
    [ButtonColor.Ketchup]: 'btn-secondary-ketchup',
    [ButtonColor.Lettuce]: 'btn-secondary-lettuce',
    [ButtonColor.LinkedIn]: 'btn-secondary-linkedin',
    [ButtonColor.Onion]: 'btn-secondary-onion',
    [ButtonColor.Pepper]: 'btn-secondary-pepper',
    [ButtonColor.Salt]: 'btn-secondary-salt',
    [ButtonColor.Reddit]: 'btn-secondary-reddit',
    [ButtonColor.Telegram]: 'btn-secondary-telegram',
    [ButtonColor.Twitter]: 'btn-secondary-twitter',
    [ButtonColor.Water]: 'btn-secondary-water',
    [ButtonColor.WhatsApp]: 'btn-secondary-whatsapp',
  },
  [ButtonVariant.Tertiary]: {
    [ButtonColor.Avocado]: 'btn-tertiary-avocado',
    [ButtonColor.Bacon]: 'btn-tertiary-bacon',
    [ButtonColor.BlueCheese]: 'btn-tertiary-blueCheese',
    [ButtonColor.Bun]: 'btn-tertiary-bun',
    [ButtonColor.Burger]: 'btn-tertiary-burger',
    [ButtonColor.Cabbage]: 'btn-tertiary-cabbage',
    [ButtonColor.Cheese]: 'btn-tertiary-cheese',
    [ButtonColor.Facebook]: 'btn-tertiary-facebook',
    [ButtonColor.Ketchup]: 'btn-tertiary-ketchup',
    [ButtonColor.LinkedIn]: 'btn-tertiary-linkedin',
    [ButtonColor.Lettuce]: 'btn-tertiary-lettuce',
    [ButtonColor.Onion]: 'btn-tertiary-onion',
    [ButtonColor.Pepper]: 'btn-tertiary-pepper',
    [ButtonColor.Salt]: 'btn-tertiary-salt',
    [ButtonColor.Reddit]: 'btn-tertiary-reddit',
    [ButtonColor.Telegram]: 'btn-tertiary-telegram',
    [ButtonColor.Twitter]: 'btn-tertiary-twitter',
    [ButtonColor.Water]: 'btn-tertiary-water',
    [ButtonColor.WhatsApp]: 'btn-tertiary-whatsapp',
  },
  [ButtonVariant.Float]: {
    [ButtonColor.Avocado]: 'btn-tertiaryFloat-avocado',
    [ButtonColor.Bacon]: 'btn-tertiaryFloat-bacon',
    [ButtonColor.BlueCheese]: 'btn-tertiaryFloat-blueCheese',
    [ButtonColor.Bun]: 'btn-tertiaryFloat-bun',
    [ButtonColor.Burger]: 'btn-tertiaryFloat-burger',
    [ButtonColor.Cabbage]: 'btn-tertiaryFloat-cabbage',
    [ButtonColor.Cheese]: 'btn-tertiaryFloat-cheese',
    [ButtonColor.Facebook]: 'btn-tertiaryFloat-facebook',
    [ButtonColor.Ketchup]: 'btn-tertiaryFloat-ketchup',
    [ButtonColor.LinkedIn]: 'btn-tertiaryFloat-linkedin',
    [ButtonColor.Lettuce]: 'btn-tertiaryFloat-lettuce',
    [ButtonColor.Onion]: 'btn-tertiaryFloat-onion',
    [ButtonColor.Pepper]: 'btn-tertiaryFloat-pepper',
    [ButtonColor.Salt]: 'btn-tertiaryFloat-salt',
    [ButtonColor.Reddit]: 'btn-tertiaryFloat-reddit',
    [ButtonColor.Telegram]: 'btn-tertiaryFloat-telegram',
    [ButtonColor.Twitter]: 'btn-tertiaryFloat-twitter',
    [ButtonColor.Water]: 'btn-tertiaryFloat-water',
    [ButtonColor.WhatsApp]: 'btn-tertiaryFloat-whatsapp',
  },
  [ButtonVariant.Subtle]: {
    [ButtonColor.Avocado]: 'btn-subtle-avocado',
    [ButtonColor.Bacon]: 'btn-subtle-bacon',
    [ButtonColor.BlueCheese]: 'btn-subtle-blueCheese',
    [ButtonColor.Bun]: 'btn-subtle-bun',
    [ButtonColor.Burger]: 'btn-subtle-burger',
    [ButtonColor.Cabbage]: 'btn-subtle-cabbage',
    [ButtonColor.Cheese]: 'btn-subtle-cheese',
    [ButtonColor.Facebook]: 'btn-subtle-facebook',
    [ButtonColor.Ketchup]: 'btn-subtle-ketchup',
    [ButtonColor.LinkedIn]: 'btn-subtle-linkedin',
    [ButtonColor.Lettuce]: 'btn-subtle-lettuce',
    [ButtonColor.Onion]: 'btn-subtle-onion',
    [ButtonColor.Pepper]: 'btn-subtle-pepper',
    [ButtonColor.Salt]: 'btn-subtle-salt',
    [ButtonColor.Reddit]: 'btn-subtle-reddit',
    [ButtonColor.Telegram]: 'btn-subtle-telegram',
    [ButtonColor.Twitter]: 'btn-subtle-twitter',
    [ButtonColor.Water]: 'btn-subtle-water',
    [ButtonColor.WhatsApp]: 'btn-subtle-whatsapp',
  },
  [ButtonVariant.Option]: {
    [ButtonColor.Avocado]: 'btn-option-avocado',
    [ButtonColor.Bacon]: 'btn-option-bacon',
    [ButtonColor.BlueCheese]: 'btn-option-blueCheese',
    [ButtonColor.Bun]: 'btn-option-bun',
    [ButtonColor.Burger]: 'btn-option-burger',
    [ButtonColor.Cabbage]: 'btn-option-cabbage',
    [ButtonColor.Cheese]: 'btn-option-cheese',
    [ButtonColor.Facebook]: 'btn-option-facebook',
    [ButtonColor.Ketchup]: 'btn-option-ketchup',
    [ButtonColor.LinkedIn]: 'btn-option-linkedin',
    [ButtonColor.Lettuce]: 'btn-option-lettuce',
    [ButtonColor.Onion]: 'btn-option-onion',
    [ButtonColor.Pepper]: 'btn-option-pepper',
    [ButtonColor.Salt]: 'btn-option-salt',
    [ButtonColor.Reddit]: 'btn-option-reddit',
    [ButtonColor.Telegram]: 'btn-option-telegram',
    [ButtonColor.Twitter]: 'btn-option-twitter',
    [ButtonColor.Water]: 'btn-option-water',
    [ButtonColor.WhatsApp]: 'btn-option-whatsapp',
  },
  [ButtonVariant.Quiz]: {
    [ButtonColor.Avocado]: 'btn-quiz-avocado',
    [ButtonColor.Bacon]: 'btn-quiz-bacon',
    [ButtonColor.BlueCheese]: 'btn-quiz-blueCheese',
    [ButtonColor.Bun]: 'btn-quiz-bun',
    [ButtonColor.Burger]: 'btn-quiz-burger',
    [ButtonColor.Cabbage]: 'btn-quiz-cabbage',
    [ButtonColor.Cheese]: 'btn-quiz-cheese',
    [ButtonColor.Facebook]: 'btn-quiz-facebook',
    [ButtonColor.Ketchup]: 'btn-quiz-ketchup',
    [ButtonColor.LinkedIn]: 'btn-quiz-linkedin',
    [ButtonColor.Lettuce]: 'btn-quiz-lettuce',
    [ButtonColor.Onion]: 'btn-quiz-onion',
    [ButtonColor.Pepper]: 'btn-quiz-pepper',
    [ButtonColor.Salt]: 'btn-quiz-salt',
    [ButtonColor.Reddit]: 'btn-quiz-reddit',
    [ButtonColor.Telegram]: 'btn-quiz-telegram',
    [ButtonColor.Twitter]: 'btn-quiz-twitter',
    [ButtonColor.Water]: 'btn-quiz-water',
    [ButtonColor.WhatsApp]: 'btn-quiz-whatsapp',
  },
};

// V1 icon-size scale — same-name mapping (XSmall button → XSmall icon).
// Matches V2's restored ladder so the V1 reskin and V2 render at the same
// scale. See `useGetIconWithSizeV2` below for the migration notes.
const buttonSizeToIconSize: Record<ButtonSize, IconSize> = {
  [ButtonSize.XLarge]: IconSize.XLarge,
  [ButtonSize.Large]: IconSize.Large,
  [ButtonSize.Medium]: IconSize.Medium,
  [ButtonSize.Small]: IconSize.Small,
  [ButtonSize.XSmall]: IconSize.XSmall,
};

export const useGetIconWithSize = (
  size: ButtonSize,
  iconOnly: boolean,
  iconPosition: ButtonIconPosition,
): ((
  icon: React.ReactElement<IconProps>,
  iconSecondaryOnHover?: boolean,
) => React.ReactElement<IconProps>) => {
  return (icon: React.ReactElement<IconProps>, iconSecondaryOnHover = false) =>
    React.cloneElement(icon, {
      secondary: iconSecondaryOnHover
        ? !icon.props?.secondary
        : icon.props?.secondary,
      size: icon.props?.size ?? buttonSizeToIconSize[size],
      // V1's `-ml-2 mr-1` negative-margin trick is gone: the parent
      // `Button` now owns icon-to-label spacing via per-size `gap-X`
      // (`SizeToGap`) and asymmetric horizontal padding (`IconSidePadding`).
      // The `.btn-icon-left` / `.btn-icon-right` classes remain as
      // position markers so consumers can still target them.
      className: classNames(
        icon.props.className,
        'btn-icon',
        !iconOnly && 'text-base',
        !iconOnly &&
          iconPosition === ButtonIconPosition.Left &&
          'btn-icon-left',
        !iconOnly &&
          iconPosition === ButtonIconPosition.Right &&
          'btn-icon-right',
        !iconOnly && iconPosition === ButtonIconPosition.Top && 'btn-icon-top',
      ),
    });
};

/**
 * v2 icon sizing — used by `ButtonV2` only.
 *
 * The v2 first-pass map shrunk every icon by one step versus v1 in
 * pursuit of an "industry-standard" 50 % ratio (Material 3, Apple
 * HIG, Linear, Notion, Vercel). On migration it became clear the
 * shrinkage was too aggressive for the existing surfaces:
 *
 *   - XSmall edit pens on the profile page (24 px button) dropped
 *     from a 20 px icon to a 16 px icon, leaving the affordance
 *     nearly invisible inside the already-tiny 24 px target.
 *   - Toolbar Small buttons (32 px) lost a third of their icon
 *     footprint (24 → 16 px) and read as decorative chips rather
 *     than tap targets.
 *
 * v1's mapping (icon size = next-name-down on the same scale) shipped
 * a 67 – 83 % icon-to-button ratio that all the existing call sites
 * were tuned for. Keeping the v1 ratios preserves visual continuity
 * across the migration; consumers that genuinely need a smaller icon
 * can override per-instance via `icon={<X size={IconSize.Size16} />}`,
 * which `useGetIconWithSizeV2` already honours.
 *
 * Concrete sizes (matches v1):
 *   XSmall  24 px button → 20 px icon (83 %)  — chip / edit pen
 *   Small   32 px button → 24 px icon (75 %)  — toolbar / card row
 *   Medium  40 px button → 28 px icon (70 %)  — standard CTA
 *   Large   48 px button → 32 px icon (67 %)  — emphasis CTA
 *   XLarge  56 px button → 40 px icon (71 %)  — hero
 *
 * Note: `CardAction` (engagement bar) sets its own icon size per
 * density via `densityToIconSize` and bypasses this map.
 */
const buttonSizeToIconSizeV2: Record<ButtonSize, IconSize> = {
  [ButtonSize.XLarge]: IconSize.XLarge,
  [ButtonSize.Large]: IconSize.Large,
  [ButtonSize.Medium]: IconSize.Medium,
  [ButtonSize.Small]: IconSize.Small,
  [ButtonSize.XSmall]: IconSize.XSmall,
};

export const useGetIconWithSizeV2 = (
  size: ButtonSize,
  iconOnly: boolean,
  iconPosition: ButtonIconPosition,
): ((
  icon: React.ReactElement<IconProps>,
  iconSecondaryOnHover?: boolean,
) => React.ReactElement<IconProps>) => {
  return (icon: React.ReactElement<IconProps>, iconSecondaryOnHover = false) =>
    React.cloneElement(icon, {
      secondary: iconSecondaryOnHover
        ? !icon.props?.secondary
        : icon.props?.secondary,
      size: icon.props?.size ?? buttonSizeToIconSizeV2[size],
      // The v2 button parent owns icon-text spacing via `flex gap-X`
      // (see `SizeToGapV2` in ButtonV2.tsx). The icon itself only
      // carries a position marker class so consumers can target it
      // from MDX / Storybook if needed; layout is handled at the
      // parent.
      //
      // Why v2 dropped the v1 negative-margin trick (`-ml-2 mr-1`):
      // it was hardcoded to negate `px-2`, so any v2 size larger than
      // XSmall (Medium px-4, Large px-6, XLarge px-7) ended up with
      // visibly asymmetric padding (e.g. 8 px left of icon, 16 px
      // right of label). Modern reference systems all use equal
      // padding both sides + flex gap.
      className: classNames(
        icon.props.className,
        'btn-icon',
        !iconOnly && 'text-base',
        !iconOnly &&
          iconPosition === ButtonIconPosition.Left &&
          'btn-icon-left',
        !iconOnly &&
          iconPosition === ButtonIconPosition.Right &&
          'btn-icon-right',
        !iconOnly && iconPosition === ButtonIconPosition.Top && 'btn-icon-top',
      ),
    });
};
