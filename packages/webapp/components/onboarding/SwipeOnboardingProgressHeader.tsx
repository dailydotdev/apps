import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  getSwipeOnboardingBarProgress,
  getSwipeOnboardingGuidanceMessage,
  getSwipeOnboardingHeadline,
  type SwipeOnboardingProgressCopyVariant,
} from '../../lib/swipeOnboardingGuidance';

/** Typing speed; full headline refresh when swipe tier copy changes. */
const SWIPE_HEADLINE_TYPING_MS_PER_CHAR = 12;
/**
 * Stable min height = 3 × typo-title2 line-height (1.875rem) so headline changes do not
 * shift the progress bar.
 */
const SWIPE_HEADLINE_BLOCK_MIN_HEIGHT_CLASS = 'min-h-[5.625rem]';

function SwipeOnboardingTypingHeadline({
  line1,
  line2,
}: {
  line1: string;
  line2?: string;
}): ReactElement {
  const fullText = useMemo(
    () => (line2 !== undefined ? `${line1}\n${line2}` : line1),
    [line1, line2],
  );
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    setVisibleCount(0);
    const len = fullText.length;
    if (len === 0) {
      return undefined;
    }
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setVisibleCount(Math.min(i, len));
      if (i >= len) {
        window.clearInterval(id);
      }
    }, SWIPE_HEADLINE_TYPING_MS_PER_CHAR);
    return () => window.clearInterval(id);
  }, [fullText]);

  const slice = fullText.slice(0, visibleCount);
  const parts = slice.split('\n');
  const shownLine1 = parts[0] ?? '';
  const shownLine2 = parts.length > 1 ? parts.slice(1).join('\n') : undefined;

  return (
    <div
      aria-live="polite"
      className={`flex w-full max-w-[20rem] flex-col items-center justify-center text-center ${SWIPE_HEADLINE_BLOCK_MIN_HEIGHT_CLASS}`}
    >
      <Typography
        bold
        center
        tag={TypographyTag.H2}
        type={TypographyType.Title2}
        color={TypographyColor.Primary}
      >
        {shownLine1}
        {shownLine2 !== undefined ? (
          <>
            <br />
            {shownLine2}
          </>
        ) : null}
      </Typography>
    </div>
  );
}

const SWIPE_PROGRESS_MILESTONE_SPARK_OFFSETS: ReadonlyArray<{
  tx: string;
  ty: string;
}> = [
  { tx: '0rem', ty: '-1.5rem' },
  { tx: '0.6875rem', ty: '-1.25rem' },
  { tx: '-0.6875rem', ty: '-1.25rem' },
  { tx: '1.125rem', ty: '-0.5rem' },
  { tx: '-1.125rem', ty: '-0.5rem' },
  { tx: '1.375rem', ty: '0rem' },
  { tx: '-1.375rem', ty: '0rem' },
  { tx: '0.9375rem', ty: '0.5625rem' },
  { tx: '-0.9375rem', ty: '0.5625rem' },
  { tx: '0.5rem', ty: '1.0625rem' },
  { tx: '-0.5rem', ty: '1.0625rem' },
  { tx: '0rem', ty: '1.1875rem' },
  { tx: '1rem', ty: '-1rem' },
  { tx: '-1rem', ty: '-1rem' },
  { tx: '1.1875rem', ty: '0.75rem' },
  { tx: '-1.1875rem', ty: '0.75rem' },
];

export type SwipeOnboardingProgressHeaderProps = {
  /** Swipe count and/or tag selections — same scale as onboarding swipes (0–40+). */
  progressCount: number;
  milestoneBurstKey: number;
  copyVariant?: SwipeOnboardingProgressCopyVariant;
};

export function SwipeOnboardingProgressHeader({
  progressCount,
  milestoneBurstKey,
  copyVariant = 'swipe',
}: SwipeOnboardingProgressHeaderProps): ReactElement {
  const progress = getSwipeOnboardingBarProgress(progressCount);
  const { line1: headlineLine1, line2: headlineLine2 } =
    getSwipeOnboardingHeadline(progressCount, copyVariant);

  return (
    <div className="pointer-events-none flex w-full max-w-[20rem] select-none flex-col items-center gap-8 self-center px-4 pb-2 pt-0 text-center">
      {/* eslint-disable-next-line react/no-unknown-property -- scoped keyframes for progress bar */}
      <style>{`
              @keyframes swipeOnboardingProgressShimmer {
                0% {
                  transform: translateX(-130%);
                }
                100% {
                  transform: translateX(320%);
                }
              }
              @keyframes swipeOnboardingTrackShimmer {
                0% {
                  transform: translateX(-120%);
                }
                100% {
                  transform: translateX(280%);
                }
              }
              @keyframes swipeOnboardingTrackBreath {
                0%,
                100% {
                  opacity: 1;
                }
                50% {
                  opacity: 0.72;
                }
              }
              @keyframes swipeOnboardingProgressGradientFlow {
                0% {
                  background-position: 0% 50%;
                }
                100% {
                  background-position: 100% 50%;
                }
              }
              @keyframes swipeOnboardingProgressSheen {
                0% {
                  transform: translateX(-150%);
                }
                100% {
                  transform: translateX(350%);
                }
              }
              @keyframes swipeOnboardingProgressEdge {
                0%,
                100% {
                  transform: translateX(0) scaleY(1);
                }
                50% {
                  transform: translateX(-0.125rem) scaleY(1.12);
                }
              }
              @keyframes swipeOnboardingMilestoneGlowBurst {
                0% {
                  opacity: 0;
                  box-shadow: 0 0 0 0 transparent;
                }
                10% {
                  opacity: 1;
                  /* Shadow-only burst (no scaleY): scaling an empty layer caused dark compositing. */
                  box-shadow:
                    0 0 0.5rem 0.25rem
                      rgb(from var(--theme-accent-cheese-default) r g b / 0.85),
                    0 0.2rem 1.15rem 0.5rem
                      rgb(from var(--theme-accent-cabbage-default) r g b / 0.65),
                    0 -0.2rem 1.15rem 0.5rem
                      rgb(from var(--theme-accent-cabbage-default) r g b / 0.55),
                    0 0 1.75rem 0.75rem
                      rgb(from var(--theme-accent-avocado-default) r g b / 0.5),
                    0 0 2.75rem 1.125rem
                      rgb(from var(--theme-accent-cheese-default) r g b / 0.38),
                    0 0 3.5rem 1.5rem
                      rgb(from var(--theme-accent-cabbage-default) r g b / 0.26);
                }
                32% {
                  opacity: 0.92;
                  box-shadow:
                    0 0 0.625rem 0.3125rem
                      rgb(from var(--theme-accent-cheese-default) r g b / 0.65),
                    0 0.15rem 1.25rem 0.55rem
                      rgb(from var(--theme-accent-cabbage-default) r g b / 0.48),
                    0 -0.15rem 1.25rem 0.55rem
                      rgb(from var(--theme-accent-cabbage-default) r g b / 0.4),
                    0 0 2.25rem 1rem
                      rgb(from var(--theme-accent-avocado-default) r g b / 0.36);
                }
                100% {
                  opacity: 0;
                  box-shadow: 0 0 0 0 transparent;
                }
              }
              @keyframes swipeOnboardingMilestoneRipple {
                0% {
                  transform: translate(-50%, -50%) scale(0.35);
                  opacity: 0.95;
                  border-width: 0.125rem;
                }
                100% {
                  transform: translate(-50%, -50%) scale(6);
                  opacity: 0;
                  border-width: 0.0625rem;
                }
              }
              @keyframes swipeOnboardingSparkBurst {
                0% {
                  transform: translate(0, 0) scale(2.1);
                  opacity: 1;
                }
                100% {
                  transform: translate(var(--spark-tx), var(--spark-ty))
                    scale(0.15);
                  opacity: 0;
                }
              }
            `}</style>
      <SwipeOnboardingTypingHeadline
        line1={headlineLine1}
        line2={headlineLine2}
      />
      <div className="flex w-full flex-col gap-2">
        <div
          className="relative z-0 h-3 w-full overflow-visible rounded-50 bg-border-subtlest-tertiary"
          style={{
            animation: 'swipeOnboardingTrackBreath 2.8s ease-in-out infinite',
          }}
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-50">
            <div
              className="via-accent-cabbage-default/35 pointer-events-none absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent to-transparent"
              style={{
                animation:
                  'swipeOnboardingTrackShimmer 2.6s ease-in-out infinite',
              }}
            />
          </div>
          {milestoneBurstKey > 0 && progress > 0 && (
            <div
              key={`glow-${milestoneBurstKey}`}
              aria-hidden
              className="pointer-events-none absolute left-0 top-0 z-[3] h-full overflow-visible rounded-50 bg-transparent"
              style={{
                width: `${progress}%`,
                animation:
                  'swipeOnboardingMilestoneGlowBurst 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards',
              }}
            />
          )}
          <div
            className="relative z-[1] h-full overflow-hidden rounded-50 transition-[width] duration-300 ease-in-out"
            style={{
              width: `${progress}%`,
              backgroundImage: `linear-gradient(
                      105deg,
                      var(--theme-accent-cabbage-default) 0%,
                      var(--theme-accent-avocado-default) 22%,
                      var(--theme-accent-cheese-default) 44%,
                      var(--theme-accent-cabbage-default) 66%,
                      var(--theme-accent-avocado-default) 88%,
                      var(--theme-accent-cheese-default) 100%
                    )`,
              backgroundSize: '240% 100%',
              backgroundPosition: '0% 50%',
              animation:
                'swipeOnboardingProgressGradientFlow 2.2s linear infinite',
            }}
          >
            <div
              className="via-accent-cheese-default/50 opacity-80 pointer-events-none absolute inset-y-0 w-[55%] bg-gradient-to-r from-transparent to-transparent"
              style={{
                animation:
                  'swipeOnboardingProgressShimmer 1.85s linear infinite',
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 overflow-hidden rounded-50"
            >
              <div
                className="via-white/45 opacity-70 pointer-events-none absolute inset-y-0 w-[38%] bg-gradient-to-r from-transparent to-transparent mix-blend-overlay"
                style={{
                  animation:
                    'swipeOnboardingProgressSheen 2.4s linear infinite',
                  willChange: 'transform',
                }}
              />
            </div>
            <div
              aria-hidden
              className="from-white/55 opacity-90 pointer-events-none absolute inset-y-[-2px] right-0 w-[3px] rounded-r-50 bg-gradient-to-l to-transparent mix-blend-soft-light"
              style={{
                animation:
                  'swipeOnboardingProgressEdge 1.25s ease-in-out infinite',
                opacity: progress > 0 ? undefined : 0,
              }}
            />
          </div>
          {milestoneBurstKey > 0 && progress > 0 && (
            <div
              key={milestoneBurstKey}
              aria-hidden
              className="pointer-events-none absolute inset-0 z-[4] overflow-visible"
            >
              <div
                className="absolute"
                style={{
                  left: `${progress}%`,
                  top: '50%',
                  width: 0,
                  height: 0,
                }}
              >
                <div
                  className="pointer-events-none absolute box-border rounded-full"
                  style={{
                    left: '50%',
                    top: '50%',
                    width: '0.75rem',
                    height: '0.75rem',
                    marginLeft: '-0.375rem',
                    marginTop: '-0.375rem',
                    borderStyle: 'solid',
                    borderColor:
                      'rgb(from var(--theme-accent-cheese-default) r g b / 0.9)',
                    backgroundColor:
                      'rgb(from var(--theme-accent-cheese-default) r g b / 0.42)',
                    animation:
                      'swipeOnboardingMilestoneRipple 0.85s cubic-bezier(0.15, 0.85, 0.2, 1) forwards',
                  }}
                />
                {SWIPE_PROGRESS_MILESTONE_SPARK_OFFSETS.map(
                  (sp, sparkIndex) => (
                    <span
                      key={`${milestoneBurstKey}-${sp.tx}-${sp.ty}`}
                      className="absolute block rounded-full bg-accent-cheese-default"
                      style={
                        {
                          width: '0.3125rem',
                          height: '0.3125rem',
                          marginLeft: '-0.15625rem',
                          marginTop: '-0.15625rem',
                          boxShadow:
                            '0 0 0.375rem rgb(from var(--theme-accent-cheese-default) r g b / 0.9), 0 0 0.75rem rgb(from var(--theme-accent-cabbage-default) r g b / 0.75), 0 0 1.125rem rgb(from var(--theme-accent-avocado-default) r g b / 0.45)',
                          '--spark-tx': sp.tx,
                          '--spark-ty': sp.ty,
                          animation:
                            'swipeOnboardingSparkBurst 0.75s cubic-bezier(0.12, 0.9, 0.22, 1) forwards',
                          animationDelay: `${sparkIndex * 0.022}s`,
                        } as React.CSSProperties
                      }
                    />
                  ),
                )}
              </div>
            </div>
          )}
        </div>
        <Typography
          bold
          center
          className="text-balance"
          tag={TypographyTag.P}
          type={TypographyType.Caption1}
          color={TypographyColor.Secondary}
        >
          {getSwipeOnboardingGuidanceMessage(progressCount, copyVariant)}
        </Typography>
      </div>
    </div>
  );
}
