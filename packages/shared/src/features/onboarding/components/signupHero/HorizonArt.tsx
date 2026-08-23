import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { signupWallHorizon } from '../../../../lib/image';

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
    /* Both variants are in the DOM at every width — `display: none` does not
       stop an <img> loading — so they resolve to one deduped request and must
       carry one hint between them. */
    /* @ts-expect-error - Not supported by react yet */ /* eslint-disable react/no-unknown-property */
    fetchpriority="high"
    src={signupWallHorizon}
  />
);
