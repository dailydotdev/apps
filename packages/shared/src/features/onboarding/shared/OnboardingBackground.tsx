import type { CSSProperties, ReactElement } from 'react';
import React from 'react';

// The giveback funnel's canvas, reused so the two full-screen flows read as the
// same product: the signature pink → purple → blue sweep (cabbage → onion →
// blueCheese) glowing from the top of a dark surface, a wide horizon glow at the
// bottom for depth, and a whisper of grain so the gradient does not band. Every
// tint is a theme token via color-mix, so it tracks the design system.
//
// The sweep fades only vertically (a top-anchored linear mask) so it fills the
// full width edge to edge, including the top corners. A radial mask centred at
// the top looks prettier but starves the corners, which reads as the gradient
// being cut off.
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

const horizonGlow: CSSProperties = {
  background:
    'radial-gradient(120% 38% at 50% 102%, color-mix(in srgb, var(--theme-accent-onion-default) 16%, transparent), transparent 72%)',
};

const grain: CSSProperties = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
};

const vignette: CSSProperties = {
  background:
    'radial-gradient(125% 80% at 50% 24%, transparent 52%, color-mix(in srgb, var(--theme-background-default) 80%, transparent) 100%)',
};

export const OnboardingBackground = (): ReactElement => (
  <div aria-hidden className="pointer-events-none absolute inset-0 z-1">
    {/* A fixed-height hero band anchored to the top rather than `inset-0`: the
        mask would otherwise scale with page height and the glow would spread
        down the long steps. */}
    <div className="absolute inset-x-0 top-0 h-[42rem]" style={brandSweep} />
    <div className="absolute inset-0" style={horizonGlow} />
    <div className="absolute inset-0 opacity-[0.04]" style={grain} />
    <div className="absolute inset-0" style={vignette} />
  </div>
);
