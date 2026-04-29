import type { ReactElement, CSSProperties } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';

export type FirstSessionWelcomeProps = {
  className?: string;
  /**
   * When true, runs the full attention amplifier: animated conic rim
   * light, breathing cabbage halo, two soft orbs, diagonal shimmer sweep,
   * and the entrance pop. When false, the card collapses to a flat
   * theme-adaptive surface (no border, no shadow, no animations) so the
   * loud effects don't outlast the moment that earned them. The parent
   * flips this off after a short timer.
   */
  effectsEnabled?: boolean;
};

// Keyframes are wired up via an inline `<style>` block (rendered once
// alongside the card) so the animations don't rely on Tailwind's JIT
// scanning the dynamic class names — `animate-[name_...]` arbitrary
// utilities are flaky when the keyframe is defined at runtime.
const KEYFRAMES = `
@keyframes newtab-welcome-in {
  from { opacity: 0; transform: translateY(0.5rem) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes newtab-welcome-rim {
  0%, 100% { border-color: color-mix(in srgb, var(--theme-accent-cabbage-default) 30%, transparent); }
  50% { border-color: color-mix(in srgb, var(--theme-accent-cabbage-default) 70%, transparent); }
}
@keyframes newtab-welcome-halo {
  0%, 100% {
    box-shadow:
      0 0 1.75rem -0.5rem var(--theme-accent-cabbage-default),
      0 1rem 2.5rem -1.5rem rgba(0,0,0,0.35);
  }
  50% {
    box-shadow:
      0 0 3.25rem -0.375rem var(--theme-accent-cabbage-default),
      0 0 5.5rem -1.25rem var(--theme-accent-onion-default),
      0 1rem 2.75rem -1.35rem rgba(0,0,0,0.45);
  }
}
@keyframes newtab-welcome-shimmer {
  0% { transform: translateX(-150%) skewX(-16deg); opacity: 0; }
  22% { opacity: 0.55; }
  64%, 100% { transform: translateX(240%) skewX(-16deg); opacity: 0; }
}
@keyframes newtab-welcome-orb {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.42; }
  50% { transform: translate3d(-1rem, 0.5rem, 0) scale(1.16); opacity: 0.82; }
}
@media (prefers-reduced-motion: reduce) {
  .newtab-welcome-card,
  .newtab-welcome-orb,
  .newtab-welcome-shimmer { animation: none !important; }
}
`;

const conicRimBackground =
  'conic-gradient(from 140deg at 50% 50%,' +
  ' transparent 0deg,' +
  ' color-mix(in srgb, var(--theme-accent-cabbage-default) 45%, transparent) 42deg,' +
  ' var(--theme-accent-cabbage-default) 82deg,' +
  ' transparent 130deg,' +
  ' transparent 230deg,' +
  ' var(--theme-accent-onion-default) 292deg,' +
  ' transparent 360deg)';

const cardEffectsStyle: CSSProperties = {
  borderColor:
    'color-mix(in srgb, var(--theme-accent-cabbage-default) 40%, transparent)',
  animation:
    'newtab-welcome-in 0.6s ease-out,' +
    ' newtab-welcome-rim 5.6s ease-in-out infinite,' +
    ' newtab-welcome-halo 4.8s ease-in-out infinite',
};

const cabbageOrbStyle: CSSProperties = {
  backgroundColor:
    'color-mix(in srgb, var(--theme-accent-cabbage-default) 35%, transparent)',
  animation: 'newtab-welcome-orb 6s ease-in-out infinite',
};

const onionOrbStyle: CSSProperties = {
  backgroundColor:
    'color-mix(in srgb, var(--theme-accent-onion-default) 30%, transparent)',
};

const shimmerStyle: CSSProperties = {
  background:
    'linear-gradient(to right, transparent,' +
    ' color-mix(in srgb, var(--theme-accent-cabbage-default) 30%, transparent),' +
    ' transparent)',
  animation: 'newtab-welcome-shimmer 4.4s ease-in-out infinite',
};

/**
 * Welcome hero rendered at the top of the Customize sidebar on a brand-new
 * user's very first new tab. Surface and typography use semantic theme
 * tokens so the card adapts cleanly between dark and light themes; the
 * cabbage / onion accents (eyebrow, orbs, rim, halo) ride brand colour
 * variables that already follow the active theme.
 *
 * Render gating + the `SeenKeepItOverlay` action are owned by the parent
 * (`CustomizeNewTabSidebar`) so the card can stay mounted long enough for
 * the user to actually see it without racing against its own
 * action-completion mutation.
 */
export const FirstSessionWelcome = ({
  className,
  effectsEnabled = true,
}: FirstSessionWelcomeProps): ReactElement => (
  <section
    aria-labelledby="newtab-welcome-title"
    className={classNames(
      'newtab-welcome-card relative mx-3 mb-1 mt-2 overflow-hidden rounded-16 bg-background-subtle',
      effectsEnabled && 'border',
      className,
    )}
    style={effectsEnabled ? cardEffectsStyle : undefined}
  >
    {effectsEnabled ? (
      <>
        <style>{KEYFRAMES}</style>

        {/* Slow rotating cabbage→onion conic rim — reads as a polished
            bezel rather than a flat colour wash. */}
        <div
          aria-hidden
          className="opacity-70 pointer-events-none absolute inset-0 rounded-16"
          style={{ background: conicRimBackground, filter: 'blur(0.5px)' }}
        />

        {/* Inner theme-adaptive surface, sits 0.5px inside the bordered
            rim so the conic light is only a thin halo at the edge. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0.5 rounded-16 bg-background-subtle"
        />

        {/* Cabbage orb top-right + onion orb bottom-left — soft colour
            washes that bleed through the surface. */}
        <div
          aria-hidden
          className="newtab-welcome-orb pointer-events-none absolute -right-12 -top-14 h-48 w-48 rounded-full blur-3xl"
          style={cabbageOrbStyle}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -left-20 h-52 w-52 rounded-full blur-3xl"
          style={onionOrbStyle}
        />

        {/* Diagonal shimmer sweep — cabbage-tinted so it stays visible in
            both themes (a white-on-white shimmer disappears in light). */}
        <div
          aria-hidden
          className="newtab-welcome-shimmer pointer-events-none absolute inset-y-0 -left-1/2 w-2/3"
          style={shimmerStyle}
        />
      </>
    ) : null}

    <div className="relative flex flex-col gap-2 px-4 pb-4 pt-4">
      <Typography
        tag={TypographyTag.Span}
        type={TypographyType.Caption2}
        bold
        className="uppercase tracking-[0.16em] text-accent-cabbage-default"
      >
        Your dev reading habit
      </Typography>

      <Typography
        id="newtab-welcome-title"
        tag={TypographyTag.H2}
        type={TypographyType.Title3}
        bold
        className="text-text-primary"
      >
        Make your new tab work for you.
      </Typography>

      <Typography
        type={TypographyType.Footnote}
        className="text-text-secondary"
      >
        Top dev stories every new tab — curated to your topics, paced to your
        day, and shaped around how you read.
      </Typography>
    </div>
  </section>
);
