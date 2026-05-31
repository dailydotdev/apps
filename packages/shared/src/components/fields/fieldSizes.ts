import { IconSize } from '../Icon';

/**
 * Field sizing — deliberately mirrors `ButtonSize` (see buttons/common.ts) so a
 * field and a button of the same size line up pixel-for-pixel when they sit in
 * the same row/strip. The naming, heights, radii, typography and icon sizes are
 * kept identical on purpose: a "medium" field is exactly as tall, as round and
 * carries the same icon as a "medium" button.
 */
export enum FieldSize {
  XLarge = 'xlarge',
  Large = 'large',
  Medium = 'medium',
  Small = 'small',
  XSmall = 'xsmall',
}

/** Height token per size — identical to the button height scale. */
export const fieldSizeToHeight: Record<FieldSize, string> = {
  [FieldSize.XLarge]: 'h-14',
  [FieldSize.Large]: 'h-12',
  [FieldSize.Medium]: 'h-10',
  [FieldSize.Small]: 'h-8',
  [FieldSize.XSmall]: 'h-6',
};

/** Corner radius per size — identical to the button radius scale. */
export const fieldSizeToRadius: Record<FieldSize, string> = {
  [FieldSize.XLarge]: 'rounded-16',
  [FieldSize.Large]: 'rounded-14',
  [FieldSize.Medium]: 'rounded-12',
  [FieldSize.Small]: 'rounded-10',
  [FieldSize.XSmall]: 'rounded-8',
};

/** Value typography per size — matches the button label typography scale. */
export const fieldSizeToTypo: Record<FieldSize, string> = {
  [FieldSize.XLarge]: 'typo-title3',
  [FieldSize.Large]: 'typo-body',
  [FieldSize.Medium]: 'typo-callout',
  [FieldSize.Small]: 'typo-footnote',
  [FieldSize.XSmall]: 'typo-caption1',
};

/** Horizontal padding per size — identical to the button horizontal padding. */
export const fieldSizeToHorizontalPadding: Record<FieldSize, string> = {
  [FieldSize.XLarge]: 'px-7',
  [FieldSize.Large]: 'px-6',
  [FieldSize.Medium]: 'px-4',
  [FieldSize.Small]: 'px-3',
  [FieldSize.XSmall]: 'px-2',
};

/**
 * Icon size per field size. Fields sit one notch below the button icon scale:
 * an icon inside an input is a left/right adornment, not the primary visual, so
 * a full button-sized glyph (e.g. 32px in a Large button) reads as oversized in
 * a text field. Stepping down one rung keeps the glyph optically balanced with
 * the value text while still scaling in lockstep with the field height.
 */
export const fieldSizeToIconSize: Record<FieldSize, IconSize> = {
  [FieldSize.XLarge]: IconSize.Large,
  [FieldSize.Large]: IconSize.Medium,
  [FieldSize.Medium]: IconSize.Small,
  [FieldSize.Small]: IconSize.XSmall,
  [FieldSize.XSmall]: IconSize.XSmall,
};

/**
 * Gap between an adornment (icon / action) and the value — identical to the
 * button gap scale (`SizeToGapV2`) so icon-to-label rhythm matches a button of
 * the same size.
 */
export const fieldSizeToGap: Record<FieldSize, string> = {
  [FieldSize.XLarge]: 'gap-2',
  [FieldSize.Large]: 'gap-1.5',
  [FieldSize.Medium]: 'gap-1',
  [FieldSize.Small]: 'gap-1',
  [FieldSize.XSmall]: 'gap-1',
};

/**
 * Left padding when a field carries a left icon. Mirrors the button's
 * icon-side rule (`IconSidePaddingV2` in ButtonV2.tsx) — the glyph reads with
 * weight, so the icon side hugs the edge tighter than the value side. Values
 * sit one rung below the button scale, matching how field icons are themselves
 * one rung smaller than a button's, so a field's icon inset lines up with a
 * button of the same height. The right/value side keeps the field's base inset.
 */
export const fieldSizeToIconLeftPadding: Record<FieldSize, string> = {
  [FieldSize.XLarge]: 'pl-4',
  [FieldSize.Large]: 'pl-2',
  [FieldSize.Medium]: 'pl-1.5',
  [FieldSize.Small]: 'pl-1',
  [FieldSize.XSmall]: 'pl-1',
};

export interface FieldSizeTokens {
  height: string;
  radius: string;
  typo: string;
  horizontalPadding: string;
  iconSize: IconSize;
  gap: string;
}

export const getFieldSizeTokens = (size: FieldSize): FieldSizeTokens => ({
  height: fieldSizeToHeight[size],
  radius: fieldSizeToRadius[size],
  typo: fieldSizeToTypo[size],
  horizontalPadding: fieldSizeToHorizontalPadding[size],
  iconSize: fieldSizeToIconSize[size],
  gap: fieldSizeToGap[size],
});
