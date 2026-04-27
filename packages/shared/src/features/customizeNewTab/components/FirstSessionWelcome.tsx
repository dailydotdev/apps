import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { MagicIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';

interface FirstSessionWelcomeProps {
  className?: string;
  /**
   * When true, run the rim/halo/shimmer/orb animations alongside the
   * entrance fade-in. The parent dampens the visual energy a few seconds
   * in (or on the first sidebar interaction) by passing `false`, so the
   * card settles into its quiet resting state — but it still keeps the
   * dark glass surface and the soft static blooms.
   */
  effectsEnabled?: boolean;
}

/**
 * Welcome hero rendered at the top of the Customize sidebar on a brand-new
 * user's very first new tab.
 *
 * The card uses a dark glass surface with an animated conic rim light, two
 * soft cabbage/onion orbs blooming from opposite corners, a slow shimmer
 * sweep, and a pulsing halo. It sits next to the page-level
 * `KeepItOverlay` amplifier (the cabbage→onion column glowing over the
 * feed side of the sidebar edge) so the whole sidebar reads as ALIVE,
 * not as a second separate prompt. Between them they say:
 *
 *   "This panel matters — keep daily.dev to see it."
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
        'bg-background-subtle bg-[linear-gradient(145deg,rgba(7,12,24,0.98)_0%,rgba(20,24,44,0.96)_48%,rgba(9,20,18,0.98)_100%)]',
        // Border is part of the live treatment — it's what `newtab-welcome-rim`
        // animates between white and cabbage. Once effects settle, drop the
        // border entirely so the card doesn't read as a "selected/highlighted"
        // state. Static dark glass is plenty without it.
        effectsEnabled
          ? [
              'border border-white/20',
              'motion-reduce:animate-[newtab-welcome-in_0.6s_ease-out]',
              // Single declaration keeps entrance + rim + halo together so
              // Tailwind utilities don't clobber each other's `animation`.
              'motion-safe:animate-[newtab-welcome-in_0.6s_ease-out,newtab-welcome-rim_5.6s_ease-in-out_infinite,newtab-welcome-halo_4.8s_ease-in-out_infinite]',
            ]
          : null,
        className,
      )}
    >
      <style>{`
        @keyframes newtab-welcome-in {
          from { opacity: 0; transform: translateY(0.5rem) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes newtab-welcome-rim {
          0%, 100% { border-color: rgba(255,255,255,0.18); }
          50% { border-color: rgba(192,41,240,0.55); }
        }
        @keyframes newtab-welcome-halo {
          0%, 100% {
            box-shadow:
              inset 0 1px 0 rgba(255,255,255,0.22),
              inset 0 0 2.5rem rgba(255,255,255,0.04),
              0 0 1.75rem -0.5rem var(--theme-accent-cabbage-default),
              0 1rem 2.5rem -1.5rem rgba(0,0,0,0.76);
          }
          50% {
            box-shadow:
              inset 0 1px 0 rgba(255,255,255,0.4),
              inset 0 0 3.5rem rgba(255,255,255,0.08),
              0 0 3.25rem -0.375rem var(--theme-accent-cabbage-default),
              0 0 5.5rem -1.25rem var(--theme-accent-onion-default),
              0 1rem 2.75rem -1.35rem rgba(0,0,0,0.86);
          }
        }
        @keyframes newtab-welcome-shimmer {
          0% { transform: translateX(-150%) skewX(-16deg); opacity: 0; }
          22% { opacity: 0.9; }
          64%, 100% { transform: translateX(240%) skewX(-16deg); opacity: 0; }
        }
        @keyframes newtab-welcome-orb {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.42; }
          50% { transform: translate3d(-1rem, 0.5rem, 0) scale(1.16); opacity: 0.82; }
        }
      `}</style>

      {/* Animated conic rim light: a slow rotating cabbage/onion ring that
          peeks through the dark glass surface and reads as a polished bezel
          rather than a flat color wash. Only renders while effects are
          enabled so the card settles into a quiet rest after a few seconds. */}
      {effectsEnabled ? (
        <div
          aria-hidden
          className={classNames(
            'pointer-events-none absolute inset-0 rounded-16 opacity-70 blur-[0.5px]',
            'bg-[conic-gradient(from_140deg_at_50%_50%,transparent_0deg,rgba(255,255,255,0.36)_42deg,var(--theme-accent-cabbage-default)_82deg,transparent_130deg,transparent_230deg,var(--theme-accent-onion-default)_292deg,transparent_360deg)]',
          )}
        />
      ) : null}

      {/* Inner dark glass surface — sits 0.5px inside the bordered rim so
          the conic light rim is only visible as a thin halo around the
          card edge, not over the content. */}
      <div
        aria-hidden
        className={classNames(
          'pointer-events-none absolute inset-0.5 rounded-16',
          'bg-background-subtle bg-[linear-gradient(145deg,rgba(7,12,24,0.98)_0%,rgba(20,24,44,0.96)_48%,rgba(9,20,18,0.98)_100%)]',
        )}
      />

      {/* Diagonal lit highlight in the upper-left so the card feels
          three-dimensional instead of a flat dark slab. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0.5 rounded-16 bg-[radial-gradient(120%_80%_at_12%_0%,rgba(255,255,255,0.22),transparent_54%)]"
      />

      {/* Cabbage orb in the upper-right and onion orb in the bottom-left —
          two soft color washes that bleed through the dark glass and give
          the card the same purple-magenta vocabulary as KeepItOverlay. */}
      <div
        aria-hidden
        className={classNames(
          'pointer-events-none absolute -right-12 -top-14 h-48 w-48 rounded-full bg-accent-cabbage-default/35 blur-3xl',
          effectsEnabled
            ? 'motion-safe:animate-[newtab-welcome-orb_6s_ease-in-out_infinite]'
            : null,
        )}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-20 h-52 w-52 rounded-full bg-accent-onion-default/30 blur-3xl"
      />

      {/* Slow shimmer sweep — reads as polished glass catching light, not a
          jittery loading bar. Off when effects settle to keep the card
          calm after the first impression. */}
      {effectsEnabled ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-1/2 w-2/3 bg-gradient-to-r from-transparent via-white/30 to-transparent motion-safe:animate-[newtab-welcome-shimmer_4.4s_ease-in-out_infinite]"
        />
      ) : null}

      <div className="relative flex flex-col gap-2.5 px-4 pb-4 pt-4">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className={classNames(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-10',
              'bg-white/10 text-white ring-1 ring-inset ring-white/30 backdrop-blur-sm',
            )}
          >
            <MagicIcon size={IconSize.Size16} secondary />
          </span>
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Caption1}
            className="uppercase tracking-[0.16em] text-white/80"
          >
            Your dev reading habit
          </Typography>
        </div>

        <Typography
          id="newtab-welcome-title"
          tag={TypographyTag.H2}
          type={TypographyType.Title3}
          bold
          className="text-white"
        >
          A new tab that helps you stay current.
        </Typography>

        <Typography type={TypographyType.Footnote} className="text-white/80">
          Top dev stories every new tab — curated to your topics, paced to your
          day, and shaped around how you read.
        </Typography>

        {/* Closing line lives in its own glassy inset so it reads as a
            quiet pointer to the panel below, mirroring the white/cabbage
            vocabulary used by KeepItOverlay's arrow chip. */}
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Caption1}
          className={classNames(
            'mt-1 rounded-10 bg-white/10 px-2.5 py-2 text-white/95',
            'ring-1 ring-inset ring-white/20 backdrop-blur-md',
          )}
        >
          Customize everything below: Discover or Focus, shortcuts, widgets,
          even your reading time.
        </Typography>
      </div>
    </section>
  );
};
