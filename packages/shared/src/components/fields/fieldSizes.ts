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
 * Icon size per field size — identical to the button icon mapping so a "medium"
 * icon is the same glyph size whether it lives in a button or a field.
 */
export const fieldSizeToIconSize: Record<FieldSize, IconSize> = {
  [FieldSize.XLarge]: IconSize.XLarge,
  [FieldSize.Large]: IconSize.Large,
  [FieldSize.Medium]: IconSize.Medium,
  [FieldSize.Small]: IconSize.Small,
  [FieldSize.XSmall]: IconSize.XSmall,
};

export interface FieldSizeTokens {
  height: string;
  radius: string;
  typo: string;
  horizontalPadding: string;
  iconSize: IconSize;
}

export const getFieldSizeTokens = (size: FieldSize): FieldSizeTokens => ({
  height: fieldSizeToHeight[size],
  radius: fieldSizeToRadius[size],
  typo: fieldSizeToTypo[size],
  horizontalPadding: fieldSizeToHorizontalPadding[size],
  iconSize: fieldSizeToIconSize[size],
});
