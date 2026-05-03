import React from 'react';
import classNames from 'classnames';

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
 * density via `densityToIconSize` and bypasses this map — see the
 * "Reference platforms cluster…" comment block in CardAction.tsx.
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
