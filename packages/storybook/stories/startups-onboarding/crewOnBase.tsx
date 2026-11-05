import type { ReactElement } from 'react';
import React from 'react';

// The /startups/ footer art with the crew standing on the round base, combined by
// Smith. Before this ships it needs uploading to media.daily.dev, as all our
// images do.

export const CREW_ON_BASE = '/startups-onboarding/crew-on-base.webp';

/** The colour at the top of the art, so the sky runs on above it. */
export const PLAZA_SKY = '#010028';

// Measured on the art: where the base's centre sits, as a share of its width.
export const CREW_ON_BASE_CENTER = 48.75;
// How much wider than the box the art is.
const ART_SCALE = 200;

export const CrewOnBase = (): ReactElement => (
  <img
    src={CREW_ON_BASE}
    alt=""
    className="absolute bottom-0"
    style={{
      left: '50%',
      width: `${ART_SCALE}%`,
      maxWidth: 'none',
      transform: `translateX(-${CREW_ON_BASE_CENTER}%)`,
    }}
  />
);
