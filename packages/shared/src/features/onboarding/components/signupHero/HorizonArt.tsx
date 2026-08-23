import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { signupWallHorizon } from '../../../../lib/image';

// Horizon art — the marketing homepage's hero used raw: no frame, no overlays.
// Two crops of one asset, side by side because the crop is all that differs.
// `column` is the desktop right half, tall enough to use the artwork at its own
// scale. `band` is the stacked layout's top strip, where that framing would
// leave the pair a few pixels tall — so it scales up around them and biases
// right to keep the portal's colour in frame.

type HorizonArtVariant = 'band' | 'column';

const VARIANT_CLASS: Record<HorizonArtVariant, string> = {
  band: 'origin-[30%_78%] scale-[1.32] object-cover object-[73%_42%]',
  column: 'object-cover object-[70%_52%]',
};

type HorizonArtProps = {
  variant: HorizonArtVariant;
};

export const HorizonArt = ({ variant }: HorizonArtProps): ReactElement => (
  <img
    alt=""
    className={classNames('absolute inset-0 size-full', VARIANT_CLASS[variant])}
    data-testid="horizon-art"
    decoding="async"
    /* No width variants, so a phone pulls the same file a desktop does. The
       band is scenery behind a bottom-anchored form, not the LCP element, so
       on a cold mobile connection that bandwidth belongs to the auth options.
       The desktop column is half the screen and does claim priority. */
    /* @ts-expect-error - Not supported by react yet */ /* eslint-disable react/no-unknown-property */
    fetchpriority={variant === 'column' ? 'high' : 'low'}
    src={signupWallHorizon}
  />
);
