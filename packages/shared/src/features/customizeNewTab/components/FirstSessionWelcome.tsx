import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';

interface FirstSessionWelcomeProps {
  className?: string;
  /**
   * Drives the live "attention amplifier" treatment: when true the card
   * runs the conic rim, animated white→cabbage border, halo pulse, two
   * orbs, and shimmer sweep. When false the card collapses to a flat
   * theme-adaptive surface with no border, no shadow, no orbs, no
   * animations — just the typography over a solid background. The parent
   * (`CustomizeNewTabSidebar`) flips this off after a 7s timer or on the
   * first sidebar interaction so the loud effects don't outlast the
   * moment that earned them.
   */
  effectsEnabled?: boolean;
}

/**
 * Welcome hero rendered at the top of the Customize sidebar on a brand-new
 * user's very first new tab.
 *
 * Two visual states:
 *
 *   - LIVE (`effectsEnabled = true`, ~7s): full attention amplifier —
 *     animated conic cabbage→onion rim light, themed surface, lit
 *     upper-left highlight, breathing cabbage orb (top-right) + static
 *     onion orb (bottom-left), slow diagonal shimmer sweep, animated
 *     white→cabbage border, and a pulsing cabbage halo box-shadow
 *     wrapping the card. Pairs with the page-level `KeepItOverlay` (glow
 *     column + bouncing arrow chip) so the welcome moment reads as a
 *     single coordinated visual beat.
 *
 *   - FLAT (`effectsEnabled = false`): zero effects. No border, no
 *     box-shadow, no orbs, no rim, no shimmer, no animations. Just the
 *     theme-adaptive surface with eyebrow / title / description on top.
 *     The card stays anchored at the top of the sidebar; it just stops
 *     competing for attention once the user has landed on it.
 *
 * The surface and typography use semantic theme tokens
 * (`bg-background-subtle`, `text-text-primary`, `text-text-secondary`) so
 * the card adapts cleanly to whichever theme the user has selected — same
 * pattern as the rest of the customizer sidebar (sections, dropdowns,
 * segmented controls). The cabbage/onion accents (eyebrow, orbs, halo,
 * conic rim, animated border) all use brand color CSS variables that
 * already follow the active theme, so the brand identity reads through in
 * both light and dark.
 */
export const FirstSessionWelcome = ({
  className,
  effectsEnabled = true,
}: FirstSessionWelcomeProps): ReactElement => {
  return (
    <section
      aria-labelledby="newtab-welcome-title"
      className={classNames(
        'relative mx-3 mb-1 mt-2 overflow-hidden rounded-16',
        'bg-background-subtle',
        // Animated layers + border + halo only run while the welcome
        // moment is live. Once it settles, the card is intentionally a
        // flat theme-adaptive surface — no border, no shadow, no animation.
        effectsEnabled
          ? [
              'border-accent-cabbage-default/40 border',
              'motion-reduce:animate-[newtab-welcome-in_0.6s_ease-out]',
              // Single declaration keeps entrance + rim + halo together so
              // Tailwind utilities don't clobber each other's `animation`.
              'motion-safe:animate-[newtab-welcome-in_0.6s_ease-out,newtab-welcome-rim_5.6s_ease-in-out_infinite,newtab-welcome-halo_4.8s_ease-in-out_infinite]',
            ]
          : null,
        className,
      )}
    >
      {effectsEnabled ? (
        <>
          <style>{`
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
          `}</style>

          {/* Animated conic rim light: a slow rotating cabbage/onion ring
              that peeks through the surface and reads as a polished bezel
              rather than a flat color wash. Uses theme tokens so it stays
              on-brand in both themes. */}
          <div
            aria-hidden
            className={classNames(
              'opacity-70 pointer-events-none absolute inset-0 rounded-16 blur-[0.5px]',
              'bg-[conic-gradient(from_140deg_at_50%_50%,transparent_0deg,color-mix(in_srgb,var(--theme-accent-cabbage-default)_45%,transparent)_42deg,var(--theme-accent-cabbage-default)_82deg,transparent_130deg,transparent_230deg,var(--theme-accent-onion-default)_292deg,transparent_360deg)]',
            )}
          />

          {/* Inner theme-adaptive surface — sits 0.5px inside the bordered
              rim so the conic light rim is only visible as a thin halo
              around the card edge, not over the content. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0.5 rounded-16 bg-background-subtle"
          />

          {/* Cabbage orb in the upper-right and onion orb in the bottom-left
              — two soft color washes that bleed through the surface and
              give the card the same purple-magenta vocabulary as
              `KeepItOverlay` in either theme. */}
          <div
            aria-hidden
            className="bg-accent-cabbage-default/35 pointer-events-none absolute -right-12 -top-14 h-48 w-48 rounded-full blur-3xl motion-safe:animate-[newtab-welcome-orb_6s_ease-in-out_infinite]"
          />
          <div
            aria-hidden
            className="bg-accent-onion-default/30 pointer-events-none absolute -bottom-20 -left-20 h-52 w-52 rounded-full blur-3xl"
          />

          {/* Slow shimmer sweep — reads as polished glass catching light,
              not a jittery loading bar. Uses cabbage tint instead of pure
              white so it's visible in both light and dark themes (a
              white-on-white shimmer disappears in light mode). */}
          <div
            aria-hidden
            className="via-accent-cabbage-default/30 pointer-events-none absolute inset-y-0 -left-1/2 w-2/3 bg-gradient-to-r from-transparent to-transparent motion-safe:animate-[newtab-welcome-shimmer_4.4s_ease-in-out_infinite]"
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
};
