import type { ReactElement } from 'react';
import React from 'react';
import { cloudinaryOnboardingHeroDesk } from '../../../../lib/image';

// =============================================================
// Desk background — full-cover photo backdrop
// =============================================================

const DESK_HERO_SRC = cloudinaryOnboardingHeroDesk.default;
const DESK_HERO_SRCSET = [
  `${cloudinaryOnboardingHeroDesk['1280']} 1280w`,
  `${cloudinaryOnboardingHeroDesk['1920']} 1920w`,
  `${cloudinaryOnboardingHeroDesk['2560']} 2560w`,
].join(', ');

export const DeskBackground = (): ReactElement => (
  <div
    aria-hidden
    className="pointer-events-none absolute inset-0 -z-1 select-none"
  >
    <picture>
      <source srcSet={DESK_HERO_SRCSET} sizes="100vw" />
      <img
        src={DESK_HERO_SRC}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
        style={{
          imageRendering: 'auto',
          filter: 'contrast(1.05) saturate(1.05)',
        }}
        decoding="async"
        fetchPriority="high"
      />
    </picture>
  </div>
);
