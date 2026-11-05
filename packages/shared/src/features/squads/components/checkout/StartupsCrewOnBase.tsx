import type { ReactElement } from 'react';
import React from 'react';

// The /startups/ footer art with the crew standing on the round base.

export const startupsCrewOnBaseImage = '/app/assets/startups-crew-on-base.webp';

/** The crew cheering, once the page is fully set up. */
export const startupsCrewCheerImage = '/app/assets/startups-crew-cheer.webp';

/** The colour at the top of the art, so the sky runs on above it. */
export const startupsPlazaSky = '#010028';

// Where the base's centre sits in the art, as a share of its width.
export const startupsBaseCenter = 48.75;
// How much wider than the box the art is.
const ART_SCALE = 200;

export const StartupsCrewOnBase = (): ReactElement => (
  <img
    src={startupsCrewOnBaseImage}
    alt=""
    className="absolute bottom-0"
    style={{
      left: '50%',
      width: `${ART_SCALE}%`,
      maxWidth: 'none',
      transform: `translateX(-${startupsBaseCenter}%)`,
    }}
  />
);
