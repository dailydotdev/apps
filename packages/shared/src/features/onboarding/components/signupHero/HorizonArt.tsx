import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { signupWallHorizon } from '../../../../lib/image';

// =============================================================
// Horizon art — the marketing homepage's hero (the dev and Dee at
// the daily.dev portal, watching the next thing rise), used raw:
// no frame, no overlays, nothing to read on the image.
//
// Two crops of one asset, kept side by side here because the crop
// is the only thing that differs between them:
//
// `column` is the desktop right half — a tall box, so the pair and
//   the portal stay together with the artwork at its own scale.
// `band` is the stacked layout's top strip — a short, wide box
//   where the same framing would leave the pair a few pixels tall,
//   so it scales up around them and biases right to keep the
//   colour of the portal in view.
// =============================================================

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
    /* One signed URL and no width variants, so a phone pulls the same file a
       desktop does. The band is scenery behind a bottom-anchored form, not the
       LCP element, so it does not claim priority: on a cold mobile connection
       that bandwidth belongs to the auth options, which are the thing this
       experiment is measured on. The desktop column is half the screen and
       does claim it. */
    /* @ts-expect-error - Not supported by react yet */ /* eslint-disable react/no-unknown-property */
    fetchpriority={variant === 'column' ? 'high' : 'low'}
    src={signupWallHorizon}
  />
);
