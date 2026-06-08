import type { ReactElement } from 'react';
import React from 'react';

// =============================================================
// Desk background — full-cover photo backdrop
// =============================================================

const DESK_HERO_SRC = '/assets/onboarding-hero-desk.webp';
const DESK_HERO_SRCSET = [
  '/assets/onboarding-hero-desk-1280.webp 1280w',
  '/assets/onboarding-hero-desk-1920.webp 1920w',
  '/assets/onboarding-hero-desk-2560.webp 2560w',
].join(', ');

export const DeskBackground = (): ReactElement => (
  <div
    aria-hidden
    className="pointer-events-none absolute inset-0 -z-1 select-none"
  >
    <picture>
      <source type="image/webp" srcSet={DESK_HERO_SRCSET} sizes="100vw" />
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
