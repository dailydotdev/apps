import type { ReactElement, ReactNode } from 'react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSwipeable } from 'react-swipeable';
import classNames from 'classnames';
import type { ModalProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import { ModalSize } from '../common/types';
import { useDiscoverHotTakes } from '../../../hooks/useDiscoverHotTakes';
import { useVoteHotTake } from '../../../hooks/vote/useVoteHotTake';
import { useLogContext } from '../../../contexts/LogContext';
import { useAuthContext } from '../../../contexts/AuthContext';
import { LogEvent, Origin } from '../../../lib/log';
import { webappUrl } from '../../../lib/constants';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { IconSize } from '../../Icon';
import { HotIcon } from '../../icons/Hot';
import { MiniCloseIcon, VIcon } from '../../icons';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../../typography/Typography';
import { ProfilePicture, ProfileImageSize } from '../../ProfilePicture';
import { ReputationUserBadge } from '../../ReputationUserBadge';
import { VerifiedCompanyUserBadge } from '../../VerifiedCompanyUserBadge';
import { PlusUserBadge } from '../../PlusUserBadge';
import { Loader } from '../../Loader';
import type { HotTake } from '../../../graphql/user/userHotTake';

const SWIPE_THRESHOLD = 80;
const ONBOARDING_INTRO_INTERESTING_OFFSET = 56;
const ONBOARDING_INTRO_NOT_OFFSET = -56;
const ONBOARDING_INTRO_PHASE_MS = 160;
const ONBOARDING_INTRO_PAUSE_MS = 55;
const ONBOARDING_INTRO_START_DELAY_MS = 120;
/** Time from the start of one intro play to the start of the next (~4s; hint loop until user interacts). */
const ONBOARDING_INTRO_REPEAT_INTERVAL_MS = 4000;
const DISMISS_ANIMATION_MS = 340;
const BUTTON_DISMISS_ANIMATION_MS = 620;
const DISMISS_FLY_DISTANCE = 760;
const BUTTON_DISMISS_FLY_DISTANCE = 620;
const BUTTON_FLY_KICK_DELAY_MS = 42;
const SKIP_DISMISS_ANIMATION_MS = 520;
const SKIP_DISMISS_FLY_DISTANCE = 600;
const SKIP_DRAG_ELASTICITY_FACTOR = 0.3;
const COLD_ACCENT_COLOR = '#123a88';
const HOT_TAKE_CARD_HEIGHT = '28rem';
/** Title3 × 3 lines (typo-title3 line-height 1.625rem in tailwind/typography.ts). */
const ONBOARDING_CARD_TITLE_MIN_HEIGHT = '4.875rem';
/** Fixed onboarding post card (source + 3-line title + 4:3 image + padding). */
const ONBOARDING_POST_CARD_HEIGHT = 'clamp(19.5rem, 42dvh, 24rem)';
/** Swipe stack area: card height plus back-card vertical offset (8px). */
const ONBOARDING_SWIPE_AREA_HEIGHT = `calc(${ONBOARDING_POST_CARD_HEIGHT} + 0.5rem)`;

const smoothstep01 = (t: number): number => {
  const x = Math.min(Math.max(t, 0), 1);
  return x * x * (3 - 2 * x);
};

const pauseMs = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    window.setTimeout(() => {
      resolve();
    }, ms);
  });

const runOnboardingIntroAnimation = ({
  signal,
  onUpdate,
}: {
  signal: { aborted: boolean };
  onUpdate: (value: number) => void;
}): Promise<void> => {
  const segment = (from: number, to: number, durationMs: number) =>
    new Promise<void>((resolve) => {
      const startTime = performance.now();
      const tick = (now: number) => {
        if (signal.aborted) {
          resolve();
          return;
        }
        const elapsed = now - startTime;
        const t = durationMs <= 0 ? 1 : Math.min(elapsed / durationMs, 1);
        const eased = smoothstep01(t);
        onUpdate(from + (to - from) * eased);
        if (t < 1) {
          requestAnimationFrame(tick);
        } else {
          resolve();
        }
      };
      requestAnimationFrame(tick);
    });

  return (async () => {
    await segment(
      0,
      ONBOARDING_INTRO_INTERESTING_OFFSET,
      ONBOARDING_INTRO_PHASE_MS,
    );
    if (signal.aborted) {
      return;
    }
    await pauseMs(ONBOARDING_INTRO_PAUSE_MS);
    if (signal.aborted) {
      return;
    }
    await segment(
      ONBOARDING_INTRO_INTERESTING_OFFSET,
      ONBOARDING_INTRO_NOT_OFFSET,
      ONBOARDING_INTRO_PHASE_MS,
    );
    if (signal.aborted) {
      return;
    }
    await pauseMs(ONBOARDING_INTRO_PAUSE_MS);
    if (signal.aborted) {
      return;
    }
    await segment(ONBOARDING_INTRO_NOT_OFFSET, 0, ONBOARDING_INTRO_PHASE_MS);
  })();
};

const ONBOARDING_BEHIND_PARTICLES_CSS = `
  @keyframes onboardingBehindParticle {
    0% { transform: translate3d(0, 0, 0) scale(1); opacity: 0; }
    10% { opacity: 0.9; }
    35% { transform: translate3d(var(--obp-tx), var(--obp-ty), 0) scale(1.08); opacity: 0.65; }
    65% { transform: translate3d(calc(var(--obp-ex) * 0.55), 3.5rem, 0) scale(0.65); opacity: 0.3; }
    100% { transform: translate3d(var(--obp-ex), 8rem, 0) scale(0.15); opacity: 0; }
  }
  @keyframes onboardingMagicSpark {
    0%, 100% { transform: translate3d(0, 0, 0) scale(0.75); opacity: 0.45; filter: blur(0); }
    20% { transform: translate3d(var(--oms-x1), var(--oms-y1), 0) scale(1.35); opacity: 1; filter: blur(0); }
    45% { transform: translate3d(var(--oms-x2), var(--oms-y2), 0) scale(1); opacity: 0.65; filter: blur(0); }
    70% { transform: translate3d(var(--oms-x3), var(--oms-y3), 0) scale(1.2); opacity: 0.9; filter: blur(0); }
  }
  @keyframes onboardingAuraDrift {
    0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.35; }
    33% { transform: translate3d(0.35rem, -0.5rem, 0) scale(1.06); opacity: 0.55; }
    66% { transform: translate3d(-0.25rem, 0.35rem, 0) scale(0.96); opacity: 0.42; }
  }
`;

const ONBOARDING_BEHIND_PARTICLE_SPECS: ReadonlyArray<{
  left: string;
  top: string;
  size: string;
  tx: string;
  ty: string;
  ex: string;
  duration: number;
  delay: number;
  className: string;
}> = [
  {
    left: '6%',
    top: '72%',
    size: '0.25rem',
    tx: '1.5rem',
    ty: '-2.25rem',
    ex: '0.5rem',
    duration: 4.6,
    delay: 0,
    className: 'bg-accent-avocado-default/40',
  },
  {
    left: '92%',
    top: '68%',
    size: '0.1875rem',
    tx: '-1.25rem',
    ty: '-2rem',
    ex: '-0.75rem',
    duration: 4.1,
    delay: 0.35,
    className: 'bg-accent-bacon-default/35',
  },
  {
    left: '18%',
    top: '88%',
    size: '0.3125rem',
    tx: '0.75rem',
    ty: '-1.25rem',
    ex: '1rem',
    duration: 3.7,
    delay: 0.7,
    className: 'bg-text-tertiary/50',
  },
  {
    left: '78%',
    top: '82%',
    size: '0.25rem',
    tx: '-0.5rem',
    ty: '-1.75rem',
    ex: '-1.25rem',
    duration: 4.3,
    delay: 0.2,
    className: 'bg-accent-avocado-default/30',
  },
  {
    left: '44%',
    top: '92%',
    size: '0.1875rem',
    tx: '1rem',
    ty: '-0.75rem',
    ex: '0.25rem',
    duration: 3.4,
    delay: 1.1,
    className: 'bg-text-tertiary/40',
  },
  {
    left: '52%',
    top: '78%',
    size: '0.25rem',
    tx: '-1.5rem',
    ty: '-2.5rem',
    ex: '-0.25rem',
    duration: 4.8,
    delay: 0.55,
    className: 'bg-accent-bacon-default/25',
  },
  {
    left: '28%',
    top: '58%',
    size: '0.1875rem',
    tx: '2rem',
    ty: '0.25rem',
    ex: '0.75rem',
    duration: 5.1,
    delay: 0.9,
    className: 'bg-accent-avocado-default/25',
  },
  {
    left: '66%',
    top: '52%',
    size: '0.25rem',
    tx: '-1.75rem',
    ty: '0.5rem',
    ex: '-1rem',
    duration: 4.4,
    delay: 1.4,
    className: 'bg-text-tertiary/35',
  },
];

const ONBOARDING_MAGIC_SPARK_SPECS: ReadonlyArray<{
  left: string;
  top: string;
  size: string;
  x1: string;
  y1: string;
  x2: string;
  y2: string;
  x3: string;
  y3: string;
  duration: number;
  delay: number;
  className: string;
}> = [
  {
    left: '12%',
    top: '38%',
    size: '0.1875rem',
    x1: '0.4rem',
    y1: '-1.25rem',
    x2: '-0.35rem',
    y2: '-2rem',
    x3: '0.5rem',
    y3: '-1rem',
    duration: 2.8,
    delay: 0,
    className: 'bg-accent-avocado-default/90',
  },
  {
    left: '84%',
    top: '42%',
    size: '0.15625rem',
    x1: '-0.45rem',
    y1: '-1rem',
    x2: '0.3rem',
    y2: '-1.75rem',
    x3: '-0.2rem',
    y3: '-0.5rem',
    duration: 3.2,
    delay: 0.4,
    className: 'bg-accent-bacon-default/85',
  },
  {
    left: '48%',
    top: '28%',
    size: '0.125rem',
    x1: '0.25rem',
    y1: '-0.75rem',
    x2: '0.5rem',
    y2: '-1.5rem',
    x3: '0.1rem',
    y3: '-1.1rem',
    duration: 2.4,
    delay: 0.8,
    className: 'bg-accent-cabbage-default/80',
  },
  {
    left: '22%',
    top: '48%',
    size: '0.15625rem',
    x1: '0.6rem',
    y1: '0.25rem',
    x2: '0.2rem',
    y2: '-0.5rem',
    x3: '0.75rem',
    y3: '-0.25rem',
    duration: 3.6,
    delay: 0.15,
    className: 'bg-accent-avocado-default/70',
  },
  {
    left: '72%',
    top: '36%',
    size: '0.1875rem',
    x1: '-0.5rem',
    y1: '-0.5rem',
    x2: '-0.75rem',
    y2: '-1.25rem',
    x3: '-0.35rem',
    y3: '-1.75rem',
    duration: 2.9,
    delay: 1.1,
    className: 'bg-accent-bacon-default/75',
  },
  {
    left: '56%',
    top: '44%',
    size: '0.125rem',
    x1: '-0.2rem',
    y1: '-1.5rem',
    x2: '0.4rem',
    y2: '-2.25rem',
    x3: '0.15rem',
    y3: '-1.75rem',
    duration: 3.4,
    delay: 0.55,
    className: 'bg-text-tertiary/80',
  },
  {
    left: '36%',
    top: '32%',
    size: '0.15625rem',
    x1: '0.35rem',
    y1: '-0.35rem',
    x2: '-0.15rem',
    y2: '-1rem',
    x3: '0.45rem',
    y3: '-1.4rem',
    duration: 2.6,
    delay: 1.3,
    className: 'bg-accent-avocado-default/80',
  },
  {
    left: '64%',
    top: '50%',
    size: '0.125rem',
    x1: '-0.3rem',
    y1: '-1.1rem',
    x2: '0.25rem',
    y2: '-1.8rem',
    x3: '-0.5rem',
    y3: '-1.2rem',
    duration: 3,
    delay: 0.25,
    className: 'bg-accent-cheese-default/75',
  },
];

const OnboardingCardBehindParticles = (): ReactElement => (
  <>
    {/* eslint-disable-next-line react/no-unknown-property -- style tag for scoped keyframes */}
    <style>{ONBOARDING_BEHIND_PARTICLES_CSS}</style>
    <div
      aria-hidden
      className="opacity-70 pointer-events-none absolute inset-0 z-[21] overflow-hidden rounded-16"
    >
      <div
        className="bg-accent-avocado-default/50 absolute left-[5%] top-[8%] h-[42%] w-[55%] rounded-full blur-2xl"
        style={{
          animation: 'onboardingAuraDrift 5.5s ease-in-out infinite',
        }}
      />
      <div
        className="bg-accent-bacon-default/45 absolute bottom-[6%] right-[4%] h-[38%] w-[52%] rounded-full blur-2xl"
        style={{
          animation: 'onboardingAuraDrift 6.2s ease-in-out infinite',
          animationDelay: '1.1s',
        }}
      />
      <div
        className="bg-accent-cabbage-default/40 absolute left-[22%] top-[38%] h-[35%] w-[48%] rounded-full blur-2xl"
        style={{
          animation: 'onboardingAuraDrift 4.8s ease-in-out infinite',
          animationDelay: '0.6s',
        }}
      />
      {ONBOARDING_MAGIC_SPARK_SPECS.map((spark) => (
        <span
          key={`spark-${spark.left}-${spark.top}-${spark.delay}`}
          className={classNames('absolute rounded-full', spark.className)}
          style={
            {
              left: spark.left,
              top: spark.top,
              width: spark.size,
              height: spark.size,
              '--oms-x1': spark.x1,
              '--oms-y1': spark.y1,
              '--oms-x2': spark.x2,
              '--oms-y2': spark.y2,
              '--oms-x3': spark.x3,
              '--oms-y3': spark.y3,
              animation: `onboardingMagicSpark ${spark.duration}s ease-in-out infinite`,
              animationDelay: `${spark.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}
      {ONBOARDING_BEHIND_PARTICLE_SPECS.map((particle) => (
        <span
          key={`${particle.left}-${particle.top}-${particle.delay}-${particle.duration}`}
          className={classNames(
            'absolute rounded-full blur-[0.0625rem]',
            particle.className,
          )}
          style={
            {
              left: particle.left,
              top: particle.top,
              width: particle.size,
              height: particle.size,
              '--obp-tx': particle.tx,
              '--obp-ty': particle.ty,
              '--obp-ex': particle.ex,
              animation: `onboardingBehindParticle ${particle.duration}s ease-in-out infinite`,
              animationDelay: `${particle.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  </>
);

const OnboardingSwipeHintIcons = ({
  deltaX,
  disabled,
  onNotInteresting,
  onInteresting,
}: {
  deltaX: number;
  disabled: boolean;
  onNotInteresting: () => void;
  onInteresting: () => void;
}): ReactElement => {
  const swipeVisualIntensity = Math.min(Math.abs(deltaX) / SWIPE_THRESHOLD, 1);
  const leftVisualStrength = deltaX < 0 ? swipeVisualIntensity : 0;
  const rightVisualStrength = deltaX > 0 ? swipeVisualIntensity : 0;

  const leftAccentColor = 'var(--theme-accent-bacon-default)';
  const rightAccentColor = 'var(--theme-accent-avocado-default)';
  const leftSwipeEmphasized = leftVisualStrength > 0;
  const rightSwipeEmphasized = rightVisualStrength > 0;

  return (
    <div className="flex items-center justify-center gap-6 px-1">
      <button
        type="button"
        aria-label="Not interesting"
        disabled={disabled}
        className={classNames(
          'shadow-1 flex size-14 cursor-pointer items-center justify-center rounded-full border transition-all duration-150 ease-out',
          'disabled:cursor-not-allowed disabled:opacity-40',
          leftSwipeEmphasized
            ? 'opacity-100'
            : 'border-border-subtlest-secondary text-text-secondary enabled:hover:border-accent-bacon-default enabled:hover:text-accent-bacon-default enabled:focus-visible:border-accent-bacon-default enabled:focus-visible:text-accent-bacon-default enabled:active:border-accent-bacon-default enabled:active:text-accent-bacon-default',
        )}
        style={{
          transform: `scale(${1 + leftVisualStrength * 0.1})`,
          ...(leftSwipeEmphasized
            ? {
                color: leftAccentColor,
                borderColor: leftAccentColor,
                backgroundColor: `color-mix(in srgb, ${leftAccentColor} ${Math.round(
                  leftVisualStrength * 16,
                )}%, transparent)`,
                boxShadow: `0 0 ${
                  8 + leftVisualStrength * 10
                }px color-mix(in srgb, ${leftAccentColor} ${Math.round(
                  leftVisualStrength * 45,
                )}%, transparent)`,
              }
            : {}),
        }}
        onClick={onNotInteresting}
      >
        <MiniCloseIcon size={IconSize.Large} />
      </button>
      <button
        type="button"
        aria-label="Interesting"
        disabled={disabled}
        className={classNames(
          'shadow-1 flex size-14 cursor-pointer items-center justify-center rounded-full border transition-all duration-150 ease-out',
          'disabled:cursor-not-allowed disabled:opacity-40',
          rightSwipeEmphasized
            ? 'opacity-100'
            : 'border-border-subtlest-secondary text-text-secondary enabled:hover:border-accent-avocado-default enabled:hover:text-accent-avocado-default enabled:focus-visible:border-accent-avocado-default enabled:focus-visible:text-accent-avocado-default enabled:active:border-accent-avocado-default enabled:active:text-accent-avocado-default',
        )}
        style={{
          transform: `scale(${1 + rightVisualStrength * 0.1})`,
          ...(rightSwipeEmphasized
            ? {
                color: rightAccentColor,
                borderColor: rightAccentColor,
                backgroundColor: `color-mix(in srgb, ${rightAccentColor} ${Math.round(
                  rightVisualStrength * 16,
                )}%, transparent)`,
                boxShadow: `0 0 ${
                  8 + rightVisualStrength * 10
                }px color-mix(in srgb, ${rightAccentColor} ${Math.round(
                  rightVisualStrength * 45,
                )}%, transparent)`,
              }
            : {}),
        }}
        onClick={onInteresting}
      >
        <VIcon size={IconSize.Large} />
      </button>
    </div>
  );
};

const getElasticDelta = (delta: number): number => {
  const absoluteDelta = Math.abs(delta);
  if (absoluteDelta <= SWIPE_THRESHOLD) {
    return delta;
  }

  const overshoot = absoluteDelta - SWIPE_THRESHOLD;
  return (
    Math.sign(delta) *
    (SWIPE_THRESHOLD + overshoot * SKIP_DRAG_ELASTICITY_FACTOR)
  );
};

const EFFECT_KEYFRAMES = `
  @keyframes hotTakeFlame {
    0% { transform: translateX(-50%) translateY(1px) scaleY(0.92) scaleX(1.08); opacity: 0.72; }
    35% { transform: translateX(-50%) translateY(-3px) scaleY(1.22) scaleX(0.82); opacity: 0.95; }
    70% { transform: translateX(-50%) translateY(-1px) scaleY(0.84) scaleX(1.18); opacity: 0.82; }
    100% { transform: translateX(-50%) translateY(0) scaleY(1.04) scaleX(0.96); opacity: 0.88; }
  }
  @keyframes hotTakeIcicleShimmer {
    0%, 100% { opacity: 0.72; filter: brightness(0.95); transform: translateY(0); }
    50% { opacity: 1; filter: brightness(1.2); transform: translateY(1px); }
  }
  @keyframes hotTakeEmber {
    0% { transform: translateY(0) translateX(0) scale(1) rotate(0deg); opacity: 0; }
    12% { opacity: 1; }
    55% { transform: translateY(-44px) translateX(7px) scale(0.82) rotate(18deg); opacity: 0.85; }
    100% { transform: translateY(-90px) translateX(-7px) scale(0.28) rotate(-12deg); opacity: 0; }
  }
  @keyframes hotTakeSnowfall {
    0% { transform: translateY(0) translateX(0) scale(0.8); opacity: 0; }
    12% { opacity: 1; }
    50% { transform: translateY(30px) translateX(8px) scale(1); opacity: 0.92; }
    100% { transform: translateY(66px) translateX(-5px) scale(0.72); opacity: 0; }
  }
  @keyframes hotTakeHeatShimmer {
    0%, 100% { transform: scale(1) translateY(0); opacity: 0.65; }
    50% { transform: scale(1.04) translateY(-4px); opacity: 0.95; }
  }
  @keyframes hotTakeFrostBreath {
    0%, 100% { opacity: 0.5; transform: translateY(0); }
    50% { opacity: 0.9; transform: translateY(2px); }
  }
  @keyframes hotTakeSleepFloat {
    0% { transform: translateX(-50%) translateY(0) scale(0.78); opacity: 0; }
    18% { opacity: 1; }
    100% { transform: translateX(-50%) translateY(-72px) scale(1.06); opacity: 0; }
  }
  @keyframes hotTakeBubbleRise {
    0% { transform: translateY(0) scale(0.72); opacity: 0; }
    18% { opacity: 0.95; }
    100% { transform: translateY(-78px) scale(1.14); opacity: 0; }
  }
  @keyframes hotTakeSleepBreath {
    0%, 100% { opacity: 0.56; transform: translateY(0); }
    50% { opacity: 0.96; transform: translateY(-2px); }
  }
  @keyframes hotTakeBadgePulse {
    0% { transform: translateX(-50%) scale(0.92); opacity: 0; }
    100% { transform: translateX(-50%) scale(1); opacity: 1; }
  }
`;

const FLAMES: ReadonlyArray<{ left: string; size: number; delay: number }> = [
  { left: '5%', size: 30, delay: 0 },
  { left: '14%', size: 42, delay: 0.12 },
  { left: '23%', size: 26, delay: 0.28 },
  { left: '32%', size: 46, delay: 0.05 },
  { left: '41%', size: 34, delay: 0.2 },
  { left: '50%', size: 50, delay: 0.08 },
  { left: '59%', size: 38, delay: 0.22 },
  { left: '68%', size: 44, delay: 0.15 },
  { left: '77%', size: 28, delay: 0.3 },
  { left: '86%', size: 48, delay: 0.1 },
  { left: '95%', size: 32, delay: 0.18 },
];

const EMBERS: ReadonlyArray<{
  left: string;
  bottom: string;
  size: number;
  delay: number;
  duration: number;
}> = [
  { left: '10%', bottom: '8%', size: 4, delay: 0, duration: 2.4 },
  { left: '20%', bottom: '15%', size: 3, delay: 0.6, duration: 2.8 },
  { left: '30%', bottom: '5%', size: 5, delay: 0.2, duration: 2.2 },
  { left: '40%', bottom: '20%', size: 3, delay: 1.0, duration: 2.6 },
  { left: '50%', bottom: '10%', size: 4, delay: 0.4, duration: 3.0 },
  { left: '60%', bottom: '18%', size: 5, delay: 0.8, duration: 2.5 },
  { left: '70%', bottom: '6%', size: 3, delay: 0.15, duration: 2.7 },
  { left: '80%', bottom: '12%', size: 4, delay: 0.5, duration: 2.3 },
  { left: '90%', bottom: '8%', size: 3, delay: 0.9, duration: 2.9 },
  { left: '15%', bottom: '25%', size: 3, delay: 1.3, duration: 2.1 },
  { left: '35%', bottom: '30%', size: 4, delay: 0.35, duration: 2.6 },
  { left: '55%', bottom: '28%', size: 3, delay: 0.7, duration: 2.4 },
  { left: '75%', bottom: '22%', size: 5, delay: 0.25, duration: 2.8 },
  { left: '45%', bottom: '35%', size: 3, delay: 1.1, duration: 2.2 },
  { left: '85%', bottom: '18%', size: 4, delay: 0.55, duration: 2.5 },
  { left: '25%', bottom: '32%', size: 3, delay: 0.45, duration: 3.0 },
];

const ICICLE_SHAPES = [
  // bumpy left side, off-center tip
  'polygon(5% 0%, 95% 0%, 88% 8%, 80% 20%, 84% 32%, 76% 48%, 68% 62%, 58% 78%, 52% 92%, 48% 100%, 44% 88%, 36% 70%, 26% 52%, 20% 38%, 16% 24%, 12% 12%)',
  // right-leaning asymmetric
  'polygon(10% 0%, 90% 0%, 86% 12%, 80% 28%, 76% 42%, 72% 58%, 64% 72%, 56% 86%, 52% 100%, 44% 80%, 38% 62%, 28% 44%, 22% 28%, 16% 14%)',
  // wide with ridge in middle
  'polygon(2% 0%, 98% 0%, 90% 6%, 84% 18%, 88% 30%, 78% 46%, 70% 60%, 62% 74%, 54% 88%, 50% 100%, 42% 82%, 34% 64%, 24% 48%, 18% 32%, 14% 18%, 8% 6%)',
  // narrow and crooked
  'polygon(15% 0%, 85% 0%, 78% 14%, 74% 30%, 68% 48%, 64% 62%, 58% 76%, 54% 90%, 52% 100%, 44% 84%, 38% 66%, 30% 50%, 24% 34%, 20% 18%)',
  // fat with bulge then taper
  'polygon(8% 0%, 92% 0%, 86% 10%, 82% 24%, 78% 38%, 82% 50%, 74% 64%, 64% 78%, 54% 90%, 48% 100%, 40% 84%, 30% 66%, 22% 50%, 18% 36%, 14% 22%, 10% 10%)',
];

const ICICLES: ReadonlyArray<{
  left: string;
  height: number;
  width: number;
  delay: number;
  shape: number;
  rotate: number;
}> = [
  { left: '5%', height: 30, width: 10, delay: 0, shape: 0, rotate: 4 },
  { left: '13%', height: 50, width: 13, delay: 0.4, shape: 2, rotate: -2 },
  { left: '22%', height: 22, width: 8, delay: 0.9, shape: 3, rotate: 3 },
  { left: '31%', height: 58, width: 15, delay: 0.2, shape: 4, rotate: -1 },
  { left: '40%', height: 35, width: 10, delay: 0.7, shape: 1, rotate: 2 },
  { left: '50%', height: 65, width: 15, delay: 0.1, shape: 0, rotate: -3 },
  { left: '59%', height: 42, width: 12, delay: 0.5, shape: 3, rotate: 1 },
  { left: '68%', height: 55, width: 14, delay: 0.8, shape: 2, rotate: -4 },
  { left: '77%', height: 28, width: 9, delay: 0.3, shape: 1, rotate: 3 },
  { left: '86%', height: 48, width: 13, delay: 0.6, shape: 4, rotate: -2 },
  { left: '95%', height: 35, width: 11, delay: 0.15, shape: 0, rotate: 2 },
];

const SNOWFLAKES: ReadonlyArray<{
  left: string;
  top: string;
  size: number;
  delay: number;
  duration: number;
}> = [
  { left: '8%', top: '12%', size: 4, delay: 0, duration: 3 },
  { left: '18%', top: '30%', size: 6, delay: 0.5, duration: 3.5 },
  { left: '28%', top: '6%', size: 3, delay: 1.2, duration: 2.8 },
  { left: '38%', top: '45%', size: 5, delay: 0.3, duration: 3.2 },
  { left: '48%', top: '18%', size: 7, delay: 0.8, duration: 3.8 },
  { left: '58%', top: '52%', size: 4, delay: 0.1, duration: 3 },
  { left: '68%', top: '22%', size: 6, delay: 0.6, duration: 3.4 },
  { left: '78%', top: '38%', size: 3, delay: 1.0, duration: 2.6 },
  { left: '88%', top: '8%', size: 5, delay: 0.4, duration: 3.6 },
  { left: '93%', top: '48%', size: 4, delay: 0.7, duration: 3.1 },
  { left: '12%', top: '62%', size: 3, delay: 1.5, duration: 2.9 },
  { left: '42%', top: '72%', size: 5, delay: 0.2, duration: 3.3 },
  { left: '62%', top: '58%', size: 4, delay: 0.9, duration: 3.7 },
  { left: '82%', top: '68%', size: 6, delay: 0.35, duration: 2.7 },
  { left: '22%', top: '78%', size: 3, delay: 1.1, duration: 3.5 },
  { left: '52%', top: '35%', size: 5, delay: 0.65, duration: 3.1 },
];

const SLEEP_ZS: ReadonlyArray<{
  left: string;
  bottom: string;
  size: number;
  delay: number;
  duration: number;
  rotate: number;
}> = [
  { left: '20%', bottom: '14%', size: 19, delay: 0, duration: 2.2, rotate: -6 },
  {
    left: '32%',
    bottom: '22%',
    size: 16,
    delay: 0.35,
    duration: 2.6,
    rotate: 4,
  },
  {
    left: '47%',
    bottom: '16%',
    size: 22,
    delay: 0.12,
    duration: 2.4,
    rotate: -3,
  },
  {
    left: '60%',
    bottom: '24%',
    size: 18,
    delay: 0.55,
    duration: 2.7,
    rotate: 6,
  },
  {
    left: '74%',
    bottom: '18%',
    size: 20,
    delay: 0.22,
    duration: 2.5,
    rotate: -4,
  },
];

const SLEEP_BUBBLES: ReadonlyArray<{
  left: string;
  bottom: string;
  size: number;
  delay: number;
  duration: number;
}> = [
  { left: '12%', bottom: '10%', size: 8, delay: 0, duration: 2.2 },
  { left: '24%', bottom: '15%', size: 6, delay: 0.5, duration: 2.6 },
  { left: '38%', bottom: '8%', size: 10, delay: 0.2, duration: 2.3 },
  { left: '50%', bottom: '13%', size: 7, delay: 0.7, duration: 2.7 },
  { left: '62%', bottom: '9%', size: 9, delay: 0.35, duration: 2.4 },
  { left: '76%', bottom: '14%', size: 6, delay: 0.95, duration: 2.8 },
  { left: '88%', bottom: '8%', size: 8, delay: 0.45, duration: 2.5 },
];

const HotTakeCard = ({
  hotTake,
  isTop,
  offset,
  swipeDelta,
  skipDeltaY = 0,
  isDismissAnimating,
  isDragging,
  dismissDurationMs,
}: {
  hotTake: HotTake;
  isTop: boolean;
  offset: number;
  swipeDelta: number;
  skipDeltaY?: number;
  isDismissAnimating: boolean;
  isDragging: boolean;
  dismissDurationMs: number;
}): ReactElement => {
  const isSkipAnimating = isTop && isDismissAnimating && skipDeltaY !== 0;
  const isSkipDragging = isTop && !isDismissAnimating && skipDeltaY < 0;
  const rotation = isTop ? Math.max(Math.min(swipeDelta * 0.08, 18), -18) : 0;
  const translateX = isTop ? swipeDelta : 0;
  const stackScale = isTop ? 1 : 1 - offset * 0.05;
  const translateY = isTop ? 0 : offset * 8;
  const getDismissProgress = (): number => {
    if (!isTop || !isDismissAnimating) {
      return 0;
    }
    if (isSkipAnimating) {
      return Math.min(Math.abs(skipDeltaY) / SKIP_DISMISS_FLY_DISTANCE, 1);
    }
    return Math.min(Math.abs(swipeDelta) / DISMISS_FLY_DISTANCE, 1);
  };
  const dismissProgress = getDismissProgress();
  const scale = isTop ? 1 - dismissProgress * 0.06 : stackScale;
  const dismissLift = isTop ? dismissProgress * -22 : 0;
  const translateYWithOutro =
    translateY + dismissLift + (isTop ? skipDeltaY : 0);

  const intensity = isTop
    ? Math.min(Math.abs(swipeDelta) / SWIPE_THRESHOLD, 1)
    : 0;
  const effectIntensity = isTop ? intensity ** 0.78 : 0;
  const skipDragIntensity = isTop
    ? Math.min(Math.abs(skipDeltaY) / SWIPE_THRESHOLD, 1)
    : 0;
  let skipEffectIntensity = 0;
  if (isTop) {
    if (isSkipAnimating) {
      skipEffectIntensity = dismissProgress;
    } else if (isSkipDragging) {
      skipEffectIntensity = skipDragIntensity ** 0.78;
    }
  }
  const isSkipVisualActive = isTop && skipEffectIntensity > 0.02;
  const getSwipeDirection = (): 'right' | 'left' | null => {
    if (!isTop || Math.abs(swipeDelta) <= 20) {
      return null;
    }
    return swipeDelta > 0 ? 'right' : 'left';
  };
  const swipeDirection = getSwipeDirection();

  const accentColor =
    swipeDirection === 'right'
      ? 'var(--theme-accent-ketchup-default)'
      : COLD_ACCENT_COLOR;
  const skipAccentColor = 'var(--theme-accent-blueCheese-default)';
  let activeBorderColor;
  if (swipeDirection) {
    activeBorderColor = `color-mix(in srgb, ${accentColor} ${Math.round(
      effectIntensity * 100,
    )}%, var(--theme-border-subtlest-tertiary))`;
  } else if (isSkipVisualActive) {
    activeBorderColor = `color-mix(in srgb, ${skipAccentColor} ${Math.round(
      skipEffectIntensity * 100,
    )}%, var(--theme-border-subtlest-tertiary))`;
  }

  let activeBoxShadow;
  if (swipeDirection) {
    activeBoxShadow = `0 0 ${6 + effectIntensity * 24}px ${
      2 + effectIntensity * 8
    }px color-mix(in srgb, ${accentColor} ${Math.round(
      effectIntensity * 65,
    )}%, transparent), 0 0 ${10 + effectIntensity * 34}px ${
      4 + effectIntensity * 14
    }px color-mix(in srgb, ${accentColor} ${Math.round(
      effectIntensity * 42,
    )}%, transparent)`;
  } else if (isSkipVisualActive) {
    activeBoxShadow = `0 0 ${6 + skipEffectIntensity * 22}px ${
      2 + skipEffectIntensity * 8
    }px color-mix(in srgb, ${skipAccentColor} ${Math.round(
      skipEffectIntensity * 60,
    )}%, transparent), 0 0 ${10 + skipEffectIntensity * 28}px ${
      4 + skipEffectIntensity * 12
    }px color-mix(in srgb, ${skipAccentColor} ${Math.round(
      skipEffectIntensity * 42,
    )}%, transparent)`;
  }
  let transition =
    'transform 0.3s ease, border-color 0.2s ease, box-shadow 0.2s ease';
  if (isTop) {
    if (isDismissAnimating) {
      transition = `transform ${dismissDurationMs}ms cubic-bezier(0.16, 0.86, 0.22, 1), opacity ${dismissDurationMs}ms ease-out, filter ${dismissDurationMs}ms ease-out, border-color 0.2s ease, box-shadow 0.2s ease`;
    } else if (isDragging) {
      transition = 'border-color 0.2s ease, box-shadow 0.2s ease';
    } else {
      transition =
        'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.2s ease, box-shadow 0.2s ease';
    }
  }

  return (
    <div
      className={classNames(
        'absolute inset-0 flex select-none flex-col rounded-16 border border-border-subtlest-tertiary bg-background-subtle shadow-2',
        !isTop && 'pointer-events-none',
      )}
      style={{
        transform: `translateX(${translateX}px) translateY(${translateYWithOutro}px) rotate(${rotation}deg) scale(${scale})`,
        zIndex: 10 - offset,
        transition,
        opacity: isTop ? 1 - dismissProgress * 0.75 : 1,
        filter:
          isTop && isDismissAnimating
            ? `blur(${dismissProgress * 1.8}px)`
            : undefined,
        borderColor: activeBorderColor,
        boxShadow: activeBoxShadow,
      }}
    >
      {/* eslint-disable-next-line react/no-unknown-property */}
      {isTop && <style>{EFFECT_KEYFRAMES}</style>}

      {swipeDirection === 'right' && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-16">
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 'inherit',
              background: `linear-gradient(180deg, rgba(255,150,20,${
                effectIntensity * 0.08
              }) 0%, rgba(255,90,0,${
                effectIntensity * 0.16
              }) 42%, rgba(100,20,0,${effectIntensity * 0.24}) 100%)`,
              boxShadow: [
                `inset 0 ${-55 * effectIntensity}px ${44 * effectIntensity}px ${
                  -16 * effectIntensity
                }px rgba(255,100,0,0.4)`,
                `inset ${26 * effectIntensity}px 0 ${28 * effectIntensity}px ${
                  -14 * effectIntensity
                }px rgba(255,60,0,0.15)`,
                `inset ${-26 * effectIntensity}px 0 ${28 * effectIntensity}px ${
                  -14 * effectIntensity
                }px rgba(255,60,0,0.15)`,
              ].join(', '),
              animation: `hotTakeHeatShimmer ${
                0.6 + (1 - effectIntensity) * 0.4
              }s ease-in-out infinite`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: '-10%',
              right: '-10%',
              bottom: '-16%',
              height: '44%',
              borderRadius: '50%',
              background: `radial-gradient(ellipse at 50% 100%, rgba(255,80,0,${
                effectIntensity * 0.42
              }) 0%, rgba(255,125,0,${
                effectIntensity * 0.24
              }) 40%, transparent 78%)`,
              filter: `blur(${5 + effectIntensity * 5}px)`,
              animation: 'hotTakeHeatShimmer 1.1s ease-in-out infinite',
            }}
          />
          {FLAMES.map((flame, i) => (
            <div
              key={flame.left}
              style={{
                position: 'absolute',
                bottom: -2,
                left: flame.left,
                width: flame.size * 0.55,
                height: flame.size * effectIntensity,
                background:
                  'radial-gradient(ellipse at 50% 88%, #fff29a 0%, #ffcf3d 20%, #ff8a00 45%, #ff3b00 66%, rgba(0,0,0,0) 84%)',
                borderRadius: '50% 50% 20% 20%',
                filter: `blur(${1.4 + effectIntensity * 1.8}px) saturate(${
                  1 + effectIntensity * 0.35
                })`,
                animation: `hotTakeFlame ${
                  0.3 + i * 0.06
                }s ease-in-out infinite alternate`,
                animationDelay: `${flame.delay}s`,
                transform: 'translateX(-50%)',
                opacity: 0.45 + effectIntensity * 0.55,
                willChange: 'transform, opacity, filter',
              }}
            />
          ))}
          {EMBERS.map((ember) => (
            <div
              key={`${ember.left}-${ember.bottom}`}
              style={{
                position: 'absolute',
                left: ember.left,
                bottom: ember.bottom,
                width: ember.size,
                height: ember.size,
                borderRadius: '50%',
                background:
                  'radial-gradient(circle, #fff6ba 0%, #ffcb58 22%, #ff7a1a 54%, rgba(255,80,0,0.2) 80%, transparent 100%)',
                boxShadow: `0 0 ${ember.size + 3}px rgba(255,120,0,${
                  0.35 + effectIntensity * 0.55
                })`,
                animation: `hotTakeEmber ${ember.duration}s ease-out infinite`,
                animationDelay: `${ember.delay}s`,
                opacity: 0.3 + effectIntensity * 0.7,
              }}
            />
          ))}
        </div>
      )}

      {swipeDirection === 'left' && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-16">
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 'inherit',
              background: `linear-gradient(180deg, rgba(210,240,255,${
                effectIntensity * 0.22
              }) 0%, rgba(140,210,255,${
                effectIntensity * 0.12
              }) 42%, rgba(120,170,255,${effectIntensity * 0.1}) 100%)`,
              boxShadow: [
                `inset 0 ${52 * effectIntensity}px ${42 * effectIntensity}px ${
                  -15 * effectIntensity
                }px rgba(150,210,255,0.35)`,
                `inset ${24 * effectIntensity}px 0 ${26 * effectIntensity}px ${
                  -15 * effectIntensity
                }px rgba(130,200,255,0.12)`,
                `inset ${-24 * effectIntensity}px 0 ${26 * effectIntensity}px ${
                  -15 * effectIntensity
                }px rgba(130,200,255,0.12)`,
              ].join(', '),
              backdropFilter: `blur(${effectIntensity * 1.2}px)`,
              animation: `hotTakeFrostBreath ${
                0.85 + (1 - effectIntensity) * 0.35
              }s ease-in-out infinite`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              height: `${18 + effectIntensity * 10}%`,
              background: `linear-gradient(180deg, rgba(225,245,255,${
                effectIntensity * 0.42
              }) 0%, rgba(170,220,255,${
                effectIntensity * 0.14
              }) 75%, transparent 100%)`,
              filter: `blur(${1.5 + effectIntensity * 1.2}px)`,
              animation: 'hotTakeFrostBreath 1.2s ease-in-out infinite',
            }}
          />
          {ICICLES.map((icicle, i) => (
            <div
              key={icicle.left}
              style={{
                position: 'absolute',
                top: -1,
                left: icicle.left,
                width: icicle.width,
                height: icicle.height * effectIntensity,
                background:
                  'linear-gradient(180deg, rgba(220,240,255,0.95) 0%, rgba(140,210,255,0.85) 40%, rgba(100,180,255,0.5) 100%)',
                clipPath: ICICLE_SHAPES[icicle.shape],
                transform: `translateX(-50%) rotate(${icicle.rotate}deg)`,
                transformOrigin: 'top center',
                boxShadow: `0 2px ${
                  4 + effectIntensity * 4
                }px rgba(175,220,255,${0.3 + effectIntensity * 0.4})`,
                filter: `saturate(${1 + effectIntensity * 0.25})`,
                animation: `hotTakeIcicleShimmer ${
                  2 + i * 0.2
                }s ease-in-out infinite`,
                animationDelay: `${icicle.delay}s`,
              }}
            />
          ))}
          {SNOWFLAKES.map((flake) => (
            <div
              key={`${flake.left}-${flake.top}`}
              style={{
                position: 'absolute',
                left: flake.left,
                top: flake.top,
                width: flake.size,
                height: flake.size,
                borderRadius: '50%',
                background:
                  'radial-gradient(circle, white 0%, rgba(200,230,255,0.8) 60%, transparent 100%)',
                boxShadow: `0 0 ${
                  flake.size + effectIntensity * 2
                }px rgba(200,230,255,${0.35 + effectIntensity * 0.5})`,
                animation: `hotTakeSnowfall ${flake.duration}s ease-in-out infinite`,
                animationDelay: `${flake.delay}s`,
                opacity: 0.35 + effectIntensity * 0.65,
              }}
            />
          ))}
        </div>
      )}

      {isSkipVisualActive && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-16">
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 'inherit',
              background: `linear-gradient(180deg, rgba(222,246,255,${
                skipEffectIntensity * 0.2
              }) 0%, rgba(180,230,255,${
                skipEffectIntensity * 0.12
              }) 46%, rgba(120,186,240,${skipEffectIntensity * 0.16}) 100%)`,
              boxShadow: [
                `inset 0 ${52 * skipEffectIntensity}px ${
                  44 * skipEffectIntensity
                }px ${-15 * skipEffectIntensity}px rgba(170,225,255,0.32)`,
                `inset ${24 * skipEffectIntensity}px 0 ${
                  24 * skipEffectIntensity
                }px ${-14 * skipEffectIntensity}px rgba(140,210,255,0.18)`,
                `inset ${-24 * skipEffectIntensity}px 0 ${
                  24 * skipEffectIntensity
                }px ${-14 * skipEffectIntensity}px rgba(140,210,255,0.18)`,
              ].join(', '),
              backdropFilter: `blur(${0.4 + skipEffectIntensity * 1.5}px)`,
              animation: `hotTakeSleepBreath ${
                1.2 + (1 - skipEffectIntensity) * 0.4
              }s ease-in-out infinite`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: '-8%',
              right: '-8%',
              top: '-16%',
              height: '42%',
              borderRadius: '50%',
              background: `radial-gradient(ellipse at 50% 0%, rgba(220,245,255,${
                skipEffectIntensity * 0.52
              }) 0%, rgba(170,220,255,${
                skipEffectIntensity * 0.22
              }) 42%, transparent 78%)`,
              filter: `blur(${4 + skipEffectIntensity * 5}px)`,
            }}
          />
          {SLEEP_ZS.map((sleepZ) => (
            <span
              key={`${sleepZ.left}-${sleepZ.bottom}`}
              style={{
                position: 'absolute',
                left: sleepZ.left,
                bottom: sleepZ.bottom,
                fontSize: sleepZ.size,
                fontWeight: 800,
                lineHeight: 1,
                color: `rgba(230,248,255,${0.25 + skipEffectIntensity * 0.75})`,
                textShadow: `0 0 ${
                  4 + skipEffectIntensity * 10
                }px rgba(150,220,255,${0.18 + skipEffectIntensity * 0.52})`,
                transform: `translateX(-50%) rotate(${sleepZ.rotate}deg)`,
                animation: `hotTakeSleepFloat ${sleepZ.duration}s ease-in infinite`,
                animationDelay: `${sleepZ.delay}s`,
                opacity: 0.24 + skipEffectIntensity * 0.76,
              }}
            >
              Z
            </span>
          ))}
          {SLEEP_BUBBLES.map((bubble) => (
            <div
              key={`${bubble.left}-${bubble.bottom}`}
              style={{
                position: 'absolute',
                left: bubble.left,
                bottom: bubble.bottom,
                width: bubble.size,
                height: bubble.size,
                borderRadius: '50%',
                background:
                  'radial-gradient(circle at 28% 28%, rgba(255,255,255,0.95) 0%, rgba(225,245,255,0.55) 44%, rgba(170,220,255,0.2) 100%)',
                border: `1px solid rgba(208,240,255,${
                  0.18 + skipEffectIntensity * 0.5
                })`,
                boxShadow: `0 0 ${bubble.size + 4}px rgba(150,220,255,${
                  0.15 + skipEffectIntensity * 0.48
                })`,
                animation: `hotTakeBubbleRise ${bubble.duration}s ease-out infinite`,
                animationDelay: `${bubble.delay}s`,
                opacity: 0.2 + skipEffectIntensity * 0.8,
              }}
            />
          ))}
        </div>
      )}

      {isTop && swipeDirection && (
        <div
          className={classNames(
            'z-20 absolute left-1/2 top-4 -translate-x-1/2 rounded-10 px-4 py-1 font-bold typo-title3',
            swipeDirection === 'right'
              ? 'bg-accent-ketchup-default text-white'
              : 'text-white',
          )}
          style={{
            opacity: effectIntensity,
            animation: 'hotTakeBadgePulse 0.18s ease-out',
            backgroundColor:
              swipeDirection === 'right' ? undefined : COLD_ACCENT_COLOR,
            boxShadow: `0 6px ${12 + effectIntensity * 10}px rgba(0,0,0,${
              0.1 + effectIntensity * 0.18
            })`,
          }}
        >
          {swipeDirection === 'right' ? 'HOT 🔥' : 'COLD 🥶'}
        </div>
      )}

      {isSkipVisualActive && (
        <div
          className="z-20 absolute left-1/2 top-4 -translate-x-1/2 rounded-10 bg-accent-blueCheese-default px-4 py-1 font-bold text-white typo-title3"
          style={{
            opacity: skipEffectIntensity,
            animation: 'hotTakeBadgePulse 0.18s ease-out',
            boxShadow: `0 6px ${12 + skipEffectIntensity * 10}px rgba(0,0,0,${
              0.1 + skipEffectIntensity * 0.18
            })`,
          }}
        >
          SKIP 😴
        </div>
      )}

      <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center gap-3 overflow-y-auto break-words p-6">
        <div className="flex size-16 items-center justify-center rounded-16 bg-overlay-quaternary-cabbage text-[2.5rem]">
          {hotTake.emoji}
        </div>

        <Typography
          type={TypographyType.Title3}
          color={TypographyColor.Primary}
          bold
          className="w-full break-words text-center"
        >
          {hotTake.title}
        </Typography>

        {hotTake.subtitle && (
          <Typography
            type={TypographyType.Body}
            color={TypographyColor.Tertiary}
            className="w-full break-words text-center"
          >
            {hotTake.subtitle}
          </Typography>
        )}

        {hotTake.upvotes > 0 && (
          <div className="flex items-center gap-1 rounded-10 bg-surface-hover px-3 py-1">
            <HotIcon className="text-accent-cabbage-default" />
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Secondary}
              bold
            >
              {hotTake.upvotes}
            </Typography>
          </div>
        )}
      </div>

      {hotTake.user && (
        <a
          href={hotTake.user.permalink}
          className="relative flex items-center gap-3 border-t border-border-subtlest-tertiary p-4 hover:bg-surface-hover"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ProfilePicture
            user={hotTake.user}
            size={ProfileImageSize.Large}
            nativeLazyLoading
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center gap-1">
              <span className="truncate font-bold typo-callout">
                {hotTake.user.name}
              </span>
              {hotTake.user.isPlus && (
                <PlusUserBadge
                  user={{ isPlus: hotTake.user.isPlus }}
                  tooltip={false}
                />
              )}
              <span className="truncate text-text-tertiary typo-footnote">
                @{hotTake.user.username}
              </span>
            </div>
            <div className="flex gap-2">
              <ReputationUserBadge user={hotTake.user} disableTooltip />
              {(hotTake.user.companies?.length ?? 0) > 0 && (
                <VerifiedCompanyUserBadge
                  user={{ companies: hotTake.user.companies }}
                />
              )}
            </div>
          </div>
        </a>
      )}
    </div>
  );
};

const OnboardingPostCard = ({
  card,
  isTop,
  offset,
  swipeDelta,
  skipDeltaY = 0,
  isDismissAnimating,
  isDragging,
  dismissDurationMs,
  useInstantSwipeTransform = false,
}: {
  card: OnboardingSwipeCard;
  isTop: boolean;
  offset: number;
  swipeDelta: number;
  skipDeltaY?: number;
  isDismissAnimating: boolean;
  isDragging: boolean;
  dismissDurationMs: number;
  useInstantSwipeTransform?: boolean;
}): ReactElement => {
  const isSkipAnimating = isTop && isDismissAnimating && skipDeltaY !== 0;
  let swipeDirection: 'left' | 'right' | null = null;
  if (isTop && Math.abs(swipeDelta) > 20) {
    swipeDirection = swipeDelta > 0 ? 'right' : 'left';
  }
  const swipeIntensity = isTop
    ? Math.min(Math.abs(swipeDelta) / SWIPE_THRESHOLD, 1)
    : 0;
  const rotation = isTop ? Math.max(Math.min(swipeDelta * 0.08, 18), -18) : 0;
  const translateX = isTop ? swipeDelta : 0;
  const stackScale = isTop ? 1 : 1 - offset * 0.05;
  const translateY = isTop ? 0 : offset * 8;
  const dismissDistance = isSkipAnimating
    ? SKIP_DISMISS_FLY_DISTANCE
    : DISMISS_FLY_DISTANCE;
  const dismissProgress =
    isTop && isDismissAnimating
      ? Math.min(
          Math.abs(isSkipAnimating ? skipDeltaY : swipeDelta) / dismissDistance,
          1,
        )
      : 0;
  const scale = isTop ? 1 - dismissProgress * 0.06 : stackScale;
  const dismissLift = isTop ? dismissProgress * -22 : 0;
  const translateYWithOutro =
    translateY + dismissLift + (isTop ? skipDeltaY : 0);

  let transition =
    'transform 0.3s ease, border-color 0.2s ease, box-shadow 0.2s ease';
  if (isTop) {
    if (isDismissAnimating) {
      transition = `transform ${dismissDurationMs}ms cubic-bezier(0.16, 0.86, 0.22, 1), opacity ${dismissDurationMs}ms ease-out, filter ${dismissDurationMs}ms ease-out`;
    } else if (isDragging || useInstantSwipeTransform) {
      transition = 'none';
    } else {
      transition = 'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1)';
    }
  }

  return (
    <div
      className={classNames(
        'flex min-h-0 w-full select-none flex-col overflow-hidden rounded-16',
        isTop
          ? 'relative border border-border-subtlest-tertiary bg-background-popover'
          : 'pointer-events-none absolute left-0 right-0 top-0 bg-background-default',
        isTop && 'cursor-grab active:cursor-grabbing',
      )}
      onDragStart={(event) => event.preventDefault()}
      style={{
        height: ONBOARDING_POST_CARD_HEIGHT,
        transform: `translateX(${translateX}px) translateY(${translateYWithOutro}px) rotate(${rotation}deg) scale(${scale})`,
        zIndex: 10 - offset,
        transition,
        opacity: isTop ? 1 - dismissProgress * 0.75 : 1,
        filter:
          isTop && isDismissAnimating
            ? `blur(${dismissProgress * 1.8}px)`
            : undefined,
        boxShadow: isTop
          ? '0 1.25rem 2.75rem -0.75rem rgba(0, 0, 0, 0.45)'
          : '0 0.75rem 1.75rem -0.75rem rgba(0, 0, 0, 0.32)',
      }}
    >
      {swipeDirection && (
        <div
          className={classNames(
            'z-20 absolute left-1/2 top-3 -translate-x-1/2 rounded-10 px-3 py-1 font-bold text-white typo-callout',
            swipeDirection === 'right'
              ? 'bg-accent-avocado-default'
              : 'bg-accent-bacon-default',
          )}
          style={{ opacity: swipeIntensity }}
        >
          {swipeDirection === 'right' ? 'INTERESTING' : 'NOT'}
        </div>
      )}
      <div className="flex min-h-0 flex-1 flex-col gap-4 p-4">
        <div className="flex shrink-0 items-center gap-2">
          {card.source?.image ? (
            <img
              alt={card.source.name ?? 'Source'}
              className="size-6 rounded-full object-cover"
              draggable={false}
              src={card.source.image}
            />
          ) : (
            <div className="size-6 rounded-full bg-surface-hover" />
          )}
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Secondary}
            className="truncate"
            bold
          >
            {card.source?.name || 'daily.dev'}
          </Typography>
        </div>
        <div
          className="shrink-0"
          style={{ minHeight: ONBOARDING_CARD_TITLE_MIN_HEIGHT }}
        >
          <Typography
            type={TypographyType.Title3}
            color={TypographyColor.Primary}
            className="line-clamp-3 text-balance"
            bold
          >
            {card.title || 'Popular developer story'}
          </Typography>
        </div>
        {card.tags && card.tags.length > 0 && (
          <div className="flex shrink-0 flex-wrap gap-1.5">
            {card.tags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="rounded-8 bg-surface-hover px-2 py-0.5 text-text-tertiary typo-footnote"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="bg-surface-hover/60 flex min-h-0 flex-1 flex-col overflow-hidden rounded-12 border border-border-subtlest-tertiary p-4">
          {card.summary ? (
            <>
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Secondary}
                className="shrink-0 uppercase tracking-[0.08em]"
                bold
              >
                TLDR
              </Typography>
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Primary}
                className="mt-2 line-clamp-6 overflow-hidden text-pretty"
              >
                {card.summary}
              </Typography>
            </>
          ) : (
            <>
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Secondary}
                className="shrink-0 uppercase tracking-[0.08em]"
                bold
              >
                TLDR
              </Typography>
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Tertiary}
                className="mt-2"
              >
                No summary available for this post yet.
              </Typography>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const OnboardingFeedEmptyState = ({
  onRetry,
  isRefetching,
}: {
  onRetry?: () => void;
  isRefetching: boolean;
}): ReactElement => (
  <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
    {isRefetching ? <Loader /> : null}
    <Typography
      type={TypographyType.Title3}
      color={TypographyColor.Primary}
      bold
      className="text-center"
    >
      Couldn&apos;t load stories
    </Typography>
    <Typography
      type={TypographyType.Body}
      color={TypographyColor.Tertiary}
      className="text-center"
    >
      Check your connection and try again.
    </Typography>
    {onRetry ? (
      <Button
        variant={ButtonVariant.Primary}
        size={ButtonSize.Medium}
        type="button"
        disabled={isRefetching}
        onClick={onRetry}
      >
        Try again
      </Button>
    ) : null}
  </div>
);

const EmptyState = ({
  onClose,
  username,
}: {
  onClose: ModalProps['onRequestClose'];
  username?: string;
}): ReactElement => (
  <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
    <span className="text-[3rem]">🎉</span>
    <Typography
      type={TypographyType.Title3}
      color={TypographyColor.Primary}
      bold
      className="text-center"
    >
      You&apos;ve seen all the hot takes!
    </Typography>
    <Typography
      type={TypographyType.Body}
      color={TypographyColor.Tertiary}
      className="text-center"
    >
      Share your own hot takes and let others vote on them.
    </Typography>
    {username && (
      <Button
        variant={ButtonVariant.Primary}
        size={ButtonSize.Large}
        tag="a"
        href={`${webappUrl}${username}#hot-takes`}
        onClick={(e: React.MouseEvent) => {
          onClose?.(e);
        }}
      >
        Share your hot takes
      </Button>
    )}
  </div>
);

type SwipeActionDirection = 'left' | 'right' | 'skip';

export type OnboardingSwipeActionMeta = {
  onboardingCardId?: string;
};

export interface OnboardingSwipeCard {
  id: string;
  title?: string;
  summary?: string | null;
  image?: string | null;
  tags?: string[];
  source?: {
    name?: string | null;
    image?: string | null;
  } | null;
}

interface HotAndColdModalProps extends ModalProps {
  title?: string;
  headerSlot?: ReactNode;
  topSlot?: ReactNode;
  bottomSlot?: ReactNode;
  showHeader?: boolean;
  showDefaultActions?: boolean;
  showAddHotTakeButton?: boolean;
  onSwipeAction?: (
    direction: SwipeActionDirection,
    meta?: OnboardingSwipeActionMeta,
  ) => void;
  onboardingCards?: OnboardingSwipeCard[];
  onboardingCardsLoading?: boolean;
  /** When set, dismissed onboarding cards are controlled by the parent (e.g. persist across view switches). */
  dismissedOnboardingCardIds?: Set<string>;
  onDismissedOnboardingCardsChange?: (next: Set<string>) => void;
  /** Refetch popular posts when the onboarding deck failed to load. */
  onOnboardingFeedRetry?: () => void;
  /** True while onboarding deck query is fetching (initial or retry). */
  onboardingFeedRefetching?: boolean;
}

const HotAndColdModal = ({
  onRequestClose,
  title = 'Hot Takes',
  headerSlot,
  topSlot,
  bottomSlot,
  showHeader = true,
  showDefaultActions = true,
  showAddHotTakeButton = true,
  onSwipeAction,
  onboardingCards,
  onboardingCardsLoading = false,
  dismissedOnboardingCardIds,
  onDismissedOnboardingCardsChange,
  onOnboardingFeedRetry,
  onboardingFeedRefetching = false,
  className,
  ...props
}: HotAndColdModalProps): ReactElement => {
  const { currentTake, nextTake, isEmpty, isLoading, dismissCurrent } =
    useDiscoverHotTakes();
  const { toggleUpvote, toggleDownvote, cancelHotTakeVote } = useVoteHotTake();
  const { logEvent } = useLogContext();
  const { user } = useAuthContext();
  const [swipeDelta, setSwipeDelta] = useState(0);
  const swipeDeltaRef = useRef(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dismissDurationMs, setDismissDurationMs] =
    useState(DISMISS_ANIMATION_MS);
  const [animatingTakeId, setAnimatingTakeId] = useState<string | null>(null);
  const animatingTakeIdRef = useRef<string | null>(null);
  const flyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [skipDelta, setSkipDelta] = useState(0);
  const swipeDeltaYRef = useRef(0);
  const [internalDismissedCardIds, setInternalDismissedCardIds] = useState<
    Set<string>
  >(() => new Set<string>());
  const dismissedCardIds =
    dismissedOnboardingCardIds ?? internalDismissedCardIds;
  const updateDismissedCardIds = useCallback(
    (updater: (prev: Set<string>) => Set<string>) => {
      if (onDismissedOnboardingCardsChange) {
        const base = dismissedOnboardingCardIds ?? new Set<string>();
        onDismissedOnboardingCardsChange(updater(base));
        return;
      }
      setInternalDismissedCardIds(updater);
    },
    [dismissedOnboardingCardIds, onDismissedOnboardingCardsChange],
  );
  const onboardingIntroRepeatCancelledRef = useRef(false);
  const onboardingIntroAbortRef = useRef<{ aborted: boolean } | null>(null);
  const [onboardingIntroDelta, setOnboardingIntroDelta] = useState(0);

  const abortOnboardingIntro = useCallback(() => {
    onboardingIntroRepeatCancelledRef.current = true;
    const { current } = onboardingIntroAbortRef;
    if (current) {
      current.aborted = true;
      onboardingIntroAbortRef.current = null;
    }
    setOnboardingIntroDelta(0);
  }, []);

  const isOnboardingMode = !!onboardingCards;
  const availableOnboardingCards = useMemo(
    () =>
      (onboardingCards ?? []).filter((card) => !dismissedCardIds.has(card.id)),
    [dismissedCardIds, onboardingCards],
  );
  const currentOnboardingCard = availableOnboardingCards[0];
  const nextOnboardingCard = availableOnboardingCards[1];
  const isModalLoading = isOnboardingMode ? onboardingCardsLoading : isLoading;
  const isModalEmpty = isOnboardingMode
    ? !isModalLoading && !currentOnboardingCard
    : isEmpty;
  const swipeAreaHeight = isOnboardingMode
    ? ONBOARDING_SWIPE_AREA_HEIGHT
    : HOT_TAKE_CARD_HEIGHT;

  useEffect(() => {
    animatingTakeIdRef.current = animatingTakeId;
  }, [animatingTakeId]);

  useEffect(() => {
    if (!isAnimating) {
      setSwipeDelta(0);
      swipeDeltaRef.current = 0;
      setSkipDelta(0);
      swipeDeltaYRef.current = 0;
      setIsDragging(false);
    }
  }, [currentTake?.id, isAnimating]);

  useEffect(() => {
    return () => {
      if (flyTimerRef.current) {
        clearTimeout(flyTimerRef.current);
      }
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (
      !isOnboardingMode ||
      isModalLoading ||
      !currentOnboardingCard ||
      onboardingIntroRepeatCancelledRef.current
    ) {
      return undefined;
    }

    let effectCancelled = false;
    let nextIterationTimeoutId: number | null = null;

    const runOneIntroIteration = (): void => {
      if (effectCancelled || onboardingIntroRepeatCancelledRef.current) {
        setOnboardingIntroDelta(0);
        return;
      }
      const animSignal = { aborted: false };
      onboardingIntroAbortRef.current = animSignal;
      const iterationStart = performance.now();
      runOnboardingIntroAnimation({
        signal: animSignal,
        onUpdate: (value) => {
          if (
            !animSignal.aborted &&
            !onboardingIntroRepeatCancelledRef.current
          ) {
            setOnboardingIntroDelta(value);
          }
        },
      })
        .then(() => {
          if (onboardingIntroAbortRef.current === animSignal) {
            onboardingIntroAbortRef.current = null;
          }
          if (
            animSignal.aborted ||
            effectCancelled ||
            onboardingIntroRepeatCancelledRef.current
          ) {
            setOnboardingIntroDelta(0);
            return;
          }
          setOnboardingIntroDelta(0);
          const elapsed = performance.now() - iterationStart;
          const waitMs = Math.max(
            0,
            ONBOARDING_INTRO_REPEAT_INTERVAL_MS - elapsed,
          );
          nextIterationTimeoutId = window.setTimeout(
            runOneIntroIteration,
            waitMs,
          );
        })
        .catch(() => null);
    };

    nextIterationTimeoutId = window.setTimeout(() => {
      nextIterationTimeoutId = null;
      runOneIntroIteration();
    }, ONBOARDING_INTRO_START_DELAY_MS);

    return () => {
      effectCancelled = true;
      if (nextIterationTimeoutId !== null) {
        window.clearTimeout(nextIterationTimeoutId);
      }
      const { current } = onboardingIntroAbortRef;
      if (current) {
        current.aborted = true;
        onboardingIntroAbortRef.current = null;
      }
      setOnboardingIntroDelta(0);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- depend on card id only, not currentOnboardingCard reference
  }, [isOnboardingMode, isModalLoading, currentOnboardingCard?.id]);

  const startDismissAnimation = useCallback(
    ({
      takeId,
      durationMs,
      flyDelayMs,
      onFly,
    }: {
      takeId: string;
      durationMs: number;
      flyDelayMs: number;
      onFly: () => void;
    }) => {
      if (flyTimerRef.current) {
        clearTimeout(flyTimerRef.current);
      }
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }

      animatingTakeIdRef.current = takeId;
      setAnimatingTakeId(takeId);
      setDismissDurationMs(durationMs);
      setIsAnimating(true);
      setIsDragging(false);

      flyTimerRef.current = setTimeout(() => {
        if (animatingTakeIdRef.current !== takeId) {
          flyTimerRef.current = null;
          return;
        }
        onFly();
        flyTimerRef.current = null;
      }, flyDelayMs);

      dismissTimerRef.current = setTimeout(() => {
        if (animatingTakeIdRef.current !== takeId) {
          dismissTimerRef.current = null;
          return;
        }
        setSwipeDelta(0);
        swipeDeltaRef.current = 0;
        setSkipDelta(0);
        swipeDeltaYRef.current = 0;
        animatingTakeIdRef.current = null;
        setAnimatingTakeId(null);
        if (isOnboardingMode && currentOnboardingCard) {
          updateDismissedCardIds((prev) => {
            const next = new Set(prev);
            next.add(currentOnboardingCard.id);
            const deck = onboardingCards ?? [];
            if (deck.length > 0 && deck.every((c) => next.has(c.id))) {
              return new Set<string>();
            }
            return next;
          });
        } else {
          dismissCurrent();
        }
        setIsAnimating(false);
        dismissTimerRef.current = null;
      }, durationMs);
    },
    [
      currentOnboardingCard,
      dismissCurrent,
      isOnboardingMode,
      onboardingCards,
      updateDismissedCardIds,
    ],
  );

  const handleDismiss = useCallback(
    (direction: 'left' | 'right', source: 'swipe' | 'button' = 'swipe') => {
      const currentItemId = isOnboardingMode
        ? currentOnboardingCard?.id
        : currentTake?.id;

      if (!currentItemId || isAnimating) {
        return;
      }

      abortOnboardingIntro();

      const isButtonSource = source === 'button';
      const durationMs = isButtonSource
        ? BUTTON_DISMISS_ANIMATION_MS
        : DISMISS_ANIMATION_MS;
      const vote = direction === 'right' ? 'hot' : 'cold';

      logEvent({
        event_name: LogEvent.VoteHotAndCold,
        target_id: currentItemId,
        extra: JSON.stringify({ vote, direction, hotTakeId: currentItemId }),
      });

      if (!isOnboardingMode && currentTake) {
        if (direction === 'right') {
          toggleUpvote({
            payload: currentTake,
            origin: Origin.HotAndCold,
          });
        } else {
          toggleDownvote({
            payload: currentTake,
            origin: Origin.HotAndCold,
          });
        }
      }
      onSwipeAction?.(
        direction,
        isOnboardingMode ? { onboardingCardId: currentItemId } : undefined,
      );

      let initialPush: number;
      let flyDistance: number;
      if (isButtonSource) {
        initialPush =
          direction === 'right'
            ? SWIPE_THRESHOLD * 0.45
            : -SWIPE_THRESHOLD * 0.45;
        flyDistance =
          direction === 'right'
            ? BUTTON_DISMISS_FLY_DISTANCE
            : -BUTTON_DISMISS_FLY_DISTANCE;
      } else {
        initialPush =
          direction === 'right'
            ? Math.max(swipeDelta, SWIPE_THRESHOLD * 1.25)
            : Math.min(swipeDelta, -SWIPE_THRESHOLD * 1.25);
        flyDistance =
          direction === 'right' ? DISMISS_FLY_DISTANCE : -DISMISS_FLY_DISTANCE;
      }
      setSwipeDelta(initialPush);

      startDismissAnimation({
        takeId: currentItemId,
        durationMs,
        flyDelayMs: isButtonSource ? BUTTON_FLY_KICK_DELAY_MS : 0,
        onFly: () => setSwipeDelta(flyDistance),
      });
    },
    [
      currentTake,
      currentOnboardingCard,
      isOnboardingMode,
      isAnimating,
      startDismissAnimation,
      toggleDownvote,
      toggleUpvote,
      logEvent,
      onSwipeAction,
      swipeDelta,
      abortOnboardingIntro,
    ],
  );

  const handleSkip = useCallback(
    (source: 'swipe' | 'button' = 'button') => {
      const currentItemId = isOnboardingMode
        ? currentOnboardingCard?.id
        : currentTake?.id;

      if (!currentItemId || isAnimating) {
        return;
      }

      abortOnboardingIntro();

      logEvent({
        event_name: LogEvent.SkipHotTake,
        target_id: currentItemId,
      });

      if (!isOnboardingMode && currentTake) {
        cancelHotTakeVote({ id: currentTake.id });
      }
      onSwipeAction?.('skip');

      startDismissAnimation({
        takeId: currentItemId,
        durationMs: SKIP_DISMISS_ANIMATION_MS,
        flyDelayMs: source === 'button' ? BUTTON_FLY_KICK_DELAY_MS : 0,
        onFly: () => setSkipDelta(-SKIP_DISMISS_FLY_DISTANCE),
      });
    },
    [
      cancelHotTakeVote,
      currentTake,
      currentOnboardingCard,
      isOnboardingMode,
      isAnimating,
      startDismissAnimation,
      logEvent,
      onSwipeAction,
      abortOnboardingIntro,
    ],
  );

  const currentCardId = isOnboardingMode
    ? currentOnboardingCard?.id
    : currentTake?.id;
  const isCurrentTakeAnimating =
    !!currentCardId && isAnimating && animatingTakeId === currentCardId;
  const cardSwipeDelta =
    isAnimating && !isCurrentTakeAnimating ? 0 : swipeDelta;
  const cardSkipDelta = isAnimating && !isCurrentTakeAnimating ? 0 : skipDelta;
  const combinedOnboardingSwipeX =
    isOnboardingMode && !isDragging && !isCurrentTakeAnimating
      ? cardSwipeDelta + onboardingIntroDelta
      : cardSwipeDelta;
  const onboardingIntroPlaying =
    isOnboardingMode &&
    !isDragging &&
    !isCurrentTakeAnimating &&
    onboardingIntroDelta !== 0;

  const handleSwiped = (direction: 'left' | 'right') => {
    setIsDragging(false);
    setSkipDelta(0);
    if (Math.abs(swipeDeltaRef.current) > SWIPE_THRESHOLD) {
      handleDismiss(direction, 'swipe');
    } else {
      setSwipeDelta(0);
      swipeDeltaRef.current = 0;
      swipeDeltaYRef.current = 0;
    }
  };

  const handlers = useSwipeable({
    onSwiping: (e) => {
      if (!isAnimating) {
        abortOnboardingIntro();
        setIsDragging(true);
        setSwipeDelta(e.deltaX);
        if (
          !isOnboardingMode &&
          e.deltaY < 0 &&
          Math.abs(e.deltaY) > Math.abs(e.deltaX)
        ) {
          setSkipDelta(getElasticDelta(e.deltaY));
        } else {
          setSkipDelta(0);
        }
        swipeDeltaRef.current = e.deltaX;
        swipeDeltaYRef.current = e.deltaY;
      }
    },
    onSwipedLeft: () => handleSwiped('left'),
    onSwipedRight: () => handleSwiped('right'),
    onSwipedUp: () => {
      setIsDragging(false);
      if (isOnboardingMode) {
        setSwipeDelta(0);
        swipeDeltaRef.current = 0;
        setSkipDelta(0);
        swipeDeltaYRef.current = 0;
        return;
      }
      if (
        swipeDeltaYRef.current < 0 &&
        Math.abs(swipeDeltaYRef.current) > SWIPE_THRESHOLD
      ) {
        setSwipeDelta(0);
        swipeDeltaRef.current = 0;
        handleSkip('swipe');
      } else {
        setSwipeDelta(0);
        swipeDeltaRef.current = 0;
        setSkipDelta(0);
        swipeDeltaYRef.current = 0;
      }
    },
    trackMouse: true,
    preventScrollOnSwipe: true,
    touchEventOptions: { passive: false },
  });

  const cardSwipeArea = (
    <div
      {...handlers}
      className={classNames(
        'relative select-none self-center',
        isOnboardingMode ? 'touch-pan-x' : 'touch-none',
        isOnboardingMode
          ? 'mt-2 w-full max-w-[20rem]'
          : 'mt-4 w-[calc(100%-2rem)]',
      )}
      style={
        swipeAreaHeight !== undefined ? { height: swipeAreaHeight } : undefined
      }
    >
      {isOnboardingMode ? (
        <>
          {nextOnboardingCard && (
            <OnboardingPostCard
              key={nextOnboardingCard.id}
              card={nextOnboardingCard}
              isTop={false}
              offset={1}
              swipeDelta={0}
              isDismissAnimating={false}
              isDragging={false}
              dismissDurationMs={DISMISS_ANIMATION_MS}
            />
          )}
          {currentOnboardingCard && (
            <OnboardingPostCard
              key={currentOnboardingCard.id}
              card={currentOnboardingCard}
              isTop
              offset={0}
              swipeDelta={combinedOnboardingSwipeX}
              skipDeltaY={0}
              isDismissAnimating={isCurrentTakeAnimating}
              isDragging={isDragging}
              dismissDurationMs={dismissDurationMs}
              useInstantSwipeTransform={onboardingIntroPlaying}
            />
          )}
          <OnboardingCardBehindParticles />
        </>
      ) : (
        <>
          {nextTake && (
            <HotTakeCard
              key={nextTake.id}
              hotTake={nextTake}
              isTop={false}
              offset={1}
              swipeDelta={0}
              isDismissAnimating={false}
              isDragging={false}
              dismissDurationMs={DISMISS_ANIMATION_MS}
            />
          )}
          {currentTake && (
            <HotTakeCard
              key={currentTake.id}
              hotTake={currentTake}
              isTop
              offset={0}
              swipeDelta={cardSwipeDelta}
              skipDeltaY={cardSkipDelta}
              isDismissAnimating={isCurrentTakeAnimating}
              isDragging={isDragging}
              dismissDurationMs={dismissDurationMs}
            />
          )}
        </>
      )}
    </div>
  );

  return (
    <Modal
      {...props}
      className={classNames(
        isOnboardingMode && 'tablet:!max-h-[calc(100vh-2rem)]',
        className,
      )}
      onRequestClose={onRequestClose}
      size={ModalSize.Small}
    >
      {showHeader && <Modal.Header title={title} />}
      <Modal.Body
        className={classNames(
          '!p-0',
          isOnboardingMode
            ? 'min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-background-default'
            : 'min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-overlay-quaternary-onion',
        )}
      >
        {headerSlot}
        {isModalLoading && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6">
            {isOnboardingMode ? <Loader /> : null}
            <Typography
              type={TypographyType.Body}
              color={TypographyColor.Tertiary}
            >
              {isOnboardingMode ? 'Loading stories…' : 'Loading hot takes...'}
            </Typography>
          </div>
        )}

        {!isModalLoading && isModalEmpty && isOnboardingMode && (
          <OnboardingFeedEmptyState
            isRefetching={onboardingFeedRefetching}
            onRetry={onOnboardingFeedRetry}
          />
        )}

        {!isModalLoading && isModalEmpty && !isOnboardingMode && (
          <EmptyState onClose={onRequestClose} username={user?.username} />
        )}

        {!isModalLoading && !isModalEmpty && currentCardId && (
          <>
            {!isOnboardingMode && topSlot}
            {isOnboardingMode ? (
              <div className="mt-0 flex min-h-0 w-full flex-1 flex-col items-center justify-start px-4 pb-6 pt-3 tablet:flex-none tablet:px-6 tablet:pb-8">
                <div className="flex min-h-0 w-full max-w-[32rem] flex-1 flex-col items-stretch gap-4">
                  {topSlot}
                  <div className="flex justify-center px-4">
                    {cardSwipeArea}
                  </div>
                  <div className="flex justify-center px-4">
                    <OnboardingSwipeHintIcons
                      deltaX={combinedOnboardingSwipeX}
                      disabled={isAnimating}
                      onInteresting={() => handleDismiss('right', 'button')}
                      onNotInteresting={() => handleDismiss('left', 'button')}
                    />
                  </div>
                  {bottomSlot}
                </div>
              </div>
            ) : (
              <>
                {cardSwipeArea}
                {showDefaultActions && (
                  <div className="flex items-center justify-center gap-4 p-4 pt-3">
                    <Button
                      variant={ButtonVariant.Float}
                      size={ButtonSize.Large}
                      icon={
                        <span
                          className="text-[1.375rem] leading-none"
                          aria-hidden
                        >
                          ❄️
                        </span>
                      }
                      onClick={() => handleDismiss('left', 'button')}
                      disabled={isAnimating}
                      className="!size-14 rounded-full"
                      aria-label="Cold take - downvote"
                    />
                    <Button
                      variant={ButtonVariant.Float}
                      size={ButtonSize.Large}
                      icon={
                        <span
                          className="text-[1.375rem] leading-none"
                          aria-hidden
                        >
                          😐
                        </span>
                      }
                      onClick={() => handleSkip('button')}
                      disabled={isAnimating}
                      className="!size-12 rounded-full"
                      aria-label="Skip hot take"
                    />
                    <Button
                      variant={ButtonVariant.Float}
                      size={ButtonSize.Large}
                      icon={
                        <span
                          className="text-[1.375rem] leading-none"
                          aria-hidden
                        >
                          🔥
                        </span>
                      }
                      onClick={() => handleDismiss('right', 'button')}
                      disabled={isAnimating}
                      className="!size-14 rounded-full"
                      aria-label="Hot take - upvote"
                    />
                  </div>
                )}
                {bottomSlot}
                {showAddHotTakeButton && user?.username && (
                  <div className="px-4 pb-4">
                    <Button
                      variant={ButtonVariant.Tertiary}
                      size={ButtonSize.Medium}
                      tag="a"
                      href={`${webappUrl}${user.username}#hot-takes`}
                      className="w-full"
                      onClick={(e: React.MouseEvent) => {
                        onRequestClose?.(e);
                      }}
                    >
                      Add your own hot take
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default HotAndColdModal;
