import type { CSSProperties, ReactElement } from 'react';
import React from 'react';

// daily.dev brand canvas: the signature pink → purple → blue gradient (cabbage →
// onion → blueCheese) glowing softly from the top of a dark surface, the way the
// marketing site and Plus pages feel - smooth and pastel, no hard shapes or
// grids. Every tint is a theme token via color-mix so it tracks the design
// system, and a whisper of grain keeps the gradient from banding.
// The sweep fades only vertically (a top-anchored linear mask) so it fills the
// full width edge to edge - including the top corners. A radial mask centered at
// the top looks prettier but starves the corners, and once the page sits inside
// the app's rounded, clipped content card those starved corners read as dark
// gaps where the gradient gets "cut". A straight downward fade has no such
// horizontal falloff, so the brand color reaches every corner cleanly.
const brandSweep: CSSProperties = {
  backgroundImage:
    'linear-gradient(125deg, ' +
    'color-mix(in srgb, var(--theme-accent-cabbage-default) 34%, transparent), ' +
    'color-mix(in srgb, var(--theme-accent-onion-default) 34%, transparent) 38%, ' +
    'color-mix(in srgb, var(--theme-accent-blueCheese-default) 30%, transparent) 62%, ' +
    'color-mix(in srgb, var(--theme-accent-onion-default) 34%, transparent) 82%, ' +
    'color-mix(in srgb, var(--theme-accent-cabbage-default) 34%, transparent))',
  maskImage: 'linear-gradient(to bottom, black 0%, black 32%, transparent 92%)',
  WebkitMaskImage:
    'linear-gradient(to bottom, black 0%, black 32%, transparent 92%)',
};

// A soft horizon glow anchored to the bottom edge for depth - a wide, flat
// ellipse, so it's ambient light rather than a circle.
const horizonGlow: CSSProperties = {
  background:
    'radial-gradient(120% 38% at 50% 102%, color-mix(in srgb, var(--theme-accent-onion-default) 16%, transparent), transparent 72%)',
};

// Faint film grain, only to prevent banding across the smooth gradient.
const grain: CSSProperties = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
};

const vignette: CSSProperties = {
  background:
    'radial-gradient(125% 80% at 50% 24%, transparent 52%, color-mix(in srgb, var(--theme-background-default) 80%, transparent) 100%)',
};

export const GivebackBackground = (): ReactElement => (
  <div
    aria-hidden
    className="pointer-events-none absolute inset-0 overflow-hidden"
  >
    {/* The brand glow is a fixed-height hero band anchored to the top. Sizing it
        in px (not inset-0) keeps it consistent - otherwise its mask scales with
        the page height and the glow spreads down on longer pages. */}
    <div className="absolute inset-x-0 top-0 h-[42rem]" style={brandSweep} />
    <div className="absolute inset-0" style={horizonGlow} />
    <div className="absolute inset-0 opacity-[0.04]" style={grain} />
    <div className="absolute inset-0" style={vignette} />
  </div>
);
