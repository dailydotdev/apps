import type { CSSProperties, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { getCoreCurrencyImage } from '@dailydotdev/shared/src/lib/image';

// The palette and the reward art every zero-day surface draws with.
//
// They used to live on the card that owned them. `WeeklyRewardsModal` is the
// only card now, and the streak panel's freeze row needs the same art, so the
// shared pieces sit here instead — nothing should have to import a modal to
// get a colour.

export const ARCADE = {
  // Surfaces are the product's own dark, so the modal reads as daily.dev
  // wearing a skin rather than a different product.
  surface: '#0E1217',
  surfaceRaised: '#181E25',
  // The reading streak's own colour — bacon.40, the same `#F25D82` the streak
  // flame is drawn in — and now the only accent in the cabinet. The magenta,
  // pink, violet and violetLit it replaces were invented neons that happened
  // to sit near it, so the modal was branded as its own thing rather than as
  // the streak it belongs to. Hex rather than the theme variable because these
  // are used with alpha suffixes (`${ARCADE.streak}AA`), which a var cannot take.
  streak: '#F25D82',
  streakLit: '#FF7996',
  cyan: '#4DC9FF',
  // Text and lines on those surfaces. The design system's `text-text-*` tokens
  // track the APP theme, but these surfaces are pinned dark whatever the theme
  // is — so in light mode a `text-text-primary` label came out near-black on a
  // near-black pill. These are the dark-mode values of those tokens, frozen.
  ink100: '#FFFFFF',
  ink70: '#A8B3CE',
  ink50: '#767C87',
  gold: '#FFE24C',
  ink: '#11161C',
};

// The cabinet used to lean on glow for hierarchy: text bloom, tile halos, a
// ring around the whole card. All of it is gone — colour, weight and size do
// the work now, which is also what the production offer card these tiles
// borrow from does. `tint` survives as the plain colour the bloom wrapped.

/**
 * Cores are drawn as a PACK sized to the amount, not as one flat coin.
 *
 * `getCoreCurrencyImage` is production's own mapping — five pieces of art
 * across five value bands — but those bands are calibrated for the purchase
 * economy, where 1000 Cores is a small buy and lands on the THIRD of five.
 * On this ladder 1000 is the finale and has to look like one.
 *
 * So the amount is projected onto production's bands before being handed over:
 * the week's 100..1000 is stretched across the whole range so all five pieces
 * of art get used and every Cores day out-piles the one before it. The trade is
 * that 1000 Cores looks bigger here than the same 1000 does on the buy page —
 * the art is relative to this week, not to the currency as a whole.
 */
const CORE_ART_PROJECTION: Array<[max: number, projected: number]> = [
  [100, 150], // Core1
  [200, 500], // Core2
  [300, 5_000], // Core3
  [500, 15_000], // Core4
  [Infinity, 25_000], // Core5
];

const coreArtFor = (cores: number): string => {
  const band = CORE_ART_PROJECTION.find(([max]) => cores <= max);
  return getCoreCurrencyImage(band ? band[1] : 25_000);
};

/**
 * `max-w-none` matters: the art is a raster `<img>` and inherits preflight's
 * `img { max-width: 100% }`, which in a narrower box caps the width while the
 * size class holds the height and stretches it.
 */
/**
 * The streak freeze, as supplied art rather than the icon set's flame.
 *
 * Lives in `public/` next to the cast. `max-w-none` for the same reason the
 * Core art needs it: a raster `<img>` inherits preflight's `max-width: 100%`,
 * which caps the width in a narrower box while the size class holds the height
 * and stretches it.
 */
export const FreezeArt = ({
  sizeClass,
  style,
}: {
  sizeClass: string;
  style?: CSSProperties;
}): ReactElement => (
  <img
    src="/streak-freeze.png"
    alt=""
    aria-hidden
    className={classNames('max-w-none object-contain', sizeClass)}
    style={style}
  />
);

export const CoreArt = ({
  cores,
  sizeClass,
  style,
}: {
  cores: number;
  sizeClass: string;
  style?: CSSProperties;
}): ReactElement => (
  <img
    src={coreArtFor(cores)}
    alt=""
    aria-hidden
    className={classNames('max-w-none object-contain', sizeClass)}
    style={style}
  />
);
