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
import { useMedia } from '../../../hooks/useMedia';
import { useViewSize, ViewSize } from '../../../hooks/useViewSize';
import { useLogContext } from '../../../contexts/LogContext';
import { useAuthContext } from '../../../contexts/AuthContext';
import { LogEvent, Origin } from '../../../lib/log';
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
import LogoIcon from '../../../svg/LogoIcon';
import type { HotTake } from '../../../graphql/user/userHotTake';
import { getAddHotTakeProfileUrl } from '../../../features/profile/components/hotTakes/common';

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
const FEEDBACK_ACTIVATION_DELTA = 20;
const MAX_SWIPE_ROTATION_DEG = 18;
const SWIPE_ROTATION_DEG_PER_PX = 0.08;
const INTENSITY_QUANTIZATION_STEP = 0.05;
const PREFERS_REDUCED_MOTION_QUERY = ['(prefers-reduced-motion: reduce)'];
const MATCHED_MEDIA_VALUES = [true];
/** Title3 × 3 lines (typo-title3 line-height 1.625rem in tailwind/typography.ts). */
const ONBOARDING_CARD_TITLE_MIN_HEIGHT = '4.875rem';
/** Fixed onboarding post card (source, title, and topic tags). */
const ONBOARDING_POST_CARD_HEIGHT = 'clamp(13rem, 28dvh, 16rem)';
/** Swipe stack area: card height plus back-card vertical offset (8px). */
const ONBOARDING_SWIPE_AREA_HEIGHT = `calc(${ONBOARDING_POST_CARD_HEIGHT} + 0.5rem)`;
const ONBOARDING_SWIPE_FADE_DISTANCE = SWIPE_THRESHOLD * 4;

type CSSPropertiesWithVars = React.CSSProperties & {
  [key: `--${string}`]: string | number;
};

type SwipeDirection = 'left' | 'right';

type CssIntensity = number | string;

export const smoothstep01 = (t: number): number => {
  const x = Math.min(Math.max(t, 0), 1);
  return x * x * (3 - 2 * x);
};

export const quantizeIntensity = (value: number): number =>
  Math.min(
    1,
    Math.max(
      0,
      Math.round(value / INTENSITY_QUANTIZATION_STEP) *
        INTENSITY_QUANTIZATION_STEP,
    ),
  );

const formatIntensity = (value: number): string =>
  Number.isInteger(value) ? String(value) : value.toFixed(3);

const getSwipeRotation = (deltaX: number): number =>
  Math.max(
    Math.min(deltaX * SWIPE_ROTATION_DEG_PER_PX, MAX_SWIPE_ROTATION_DEG),
    -MAX_SWIPE_ROTATION_DEG,
  );

const getSwipeDirectionFromDelta = (deltaX: number): SwipeDirection | null => {
  if (Math.abs(deltaX) <= FEEDBACK_ACTIVATION_DELTA) {
    return null;
  }

  return deltaX > 0 ? 'right' : 'left';
};

const getSwipeIntensity = (deltaX: number): number =>
  Math.min(Math.abs(deltaX) / SWIPE_THRESHOLD, 1);

const getSwipeEffectIntensity = (deltaX: number): number =>
  getSwipeIntensity(deltaX) ** 0.78;

const getSkipEffectIntensity = (skipDeltaY: number): number =>
  Math.min(Math.abs(skipDeltaY) / SWIPE_THRESHOLD, 1) ** 0.78;

const getOnboardingSwipeVisualIntensities = (
  deltaX: number,
): { left: number; right: number } => {
  const intensity = Math.min(
    Math.max(Math.abs(deltaX) / SWIPE_THRESHOLD, 0.18),
    1,
  );

  if (deltaX > FEEDBACK_ACTIVATION_DELTA) {
    return { left: intensity * 0.35, right: intensity };
  }

  if (deltaX < -FEEDBACK_ACTIVATION_DELTA) {
    return { left: intensity, right: intensity * 0.35 };
  }

  return { left: 0, right: 0 };
};

const cssNumber = (
  intensity: CssIntensity,
  multiplier: number,
  offset = 0,
): number | string => {
  if (typeof intensity === 'number') {
    return offset + intensity * multiplier;
  }

  if (offset === 0) {
    return `calc(${intensity} * ${multiplier})`;
  }

  return `calc(${offset} + (${intensity} * ${multiplier}))`;
};

const cssPixels = (
  intensity: CssIntensity,
  multiplier: number,
  offset = 0,
): number | string => {
  if (typeof intensity === 'number') {
    return offset + intensity * multiplier;
  }

  if (offset === 0) {
    return `calc(${intensity} * ${multiplier}px)`;
  }

  return `calc(${offset}px + (${intensity} * ${multiplier}px))`;
};

const cssPixelText = (
  intensity: CssIntensity,
  multiplier: number,
  offset = 0,
): string => {
  const value = cssPixels(intensity, multiplier, offset);
  return typeof value === 'number' ? `${value}px` : value;
};

const cssNegativePixelText = (
  intensity: CssIntensity,
  multiplier: number,
  offset = 0,
): string => {
  const value = cssPixels(intensity, multiplier, offset);
  return typeof value === 'number' ? `${-value}px` : `calc(-1 * ${value})`;
};

const cssPercent = (
  intensity: CssIntensity,
  multiplier: number,
  offset = 0,
): string => {
  if (typeof intensity === 'number') {
    return `${offset + intensity * multiplier}%`;
  }

  if (offset === 0) {
    return `calc(${intensity} * ${multiplier}%)`;
  }

  return `calc(${offset}% + (${intensity} * ${multiplier}%))`;
};

const cssAlpha = (
  intensity: CssIntensity,
  multiplier: number,
  offset = 0,
): number | string => cssNumber(intensity, multiplier, offset);

const HOT_INTENSITY_VAR = 'var(--hot-take-hot-intensity, 0)';
const COLD_INTENSITY_VAR = 'var(--hot-take-cold-intensity, 0)';
const SKIP_INTENSITY_VAR = 'var(--hot-take-skip-intensity, 0)';
const ONBOARDING_LEFT_INTENSITY_VAR =
  'var(--onboarding-swipe-left-intensity, 0)';
const ONBOARDING_RIGHT_INTENSITY_VAR =
  'var(--onboarding-swipe-right-intensity, 0)';
const ONBOARDING_LEFT_BADGE_INTENSITY_VAR =
  'var(--onboarding-swipe-left-badge-intensity, 0)';
const ONBOARDING_RIGHT_BADGE_INTENSITY_VAR =
  'var(--onboarding-swipe-right-badge-intensity, 0)';

const HOT_TAKE_REST_TRANSITION =
  'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.2s ease, box-shadow 0.2s ease';
const HOT_TAKE_DRAG_TRANSITION = 'border-color 0.2s ease, box-shadow 0.2s ease';
const ONBOARDING_REST_TRANSITION =
  'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1)';
const ONBOARDING_DRAG_TRANSITION = 'none';

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

const ONBOARDING_SCREEN_TRANSITION_KEYFRAMES = `
  @keyframes onboardingScreenEnter {
    from {
      opacity: 0;
      transform: translateY(0.75rem) scale(0.985);
      filter: blur(0.25rem);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
      filter: blur(0);
    }
  }

  .onboarding-screen-enter {
    animation: onboardingScreenEnter 0.34s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  @media (prefers-reduced-motion: reduce) {
    .onboarding-screen-enter {
      animation: none;
      opacity: 1;
      transform: none;
      filter: none;
    }
  }
`;

const OnboardingBehindParticlesKeyframes = React.memo(
  function OnboardingBehindParticlesKeyframes(): ReactElement {
    return (
      // eslint-disable-next-line react/no-unknown-property -- style tag for scoped keyframes
      <style>{ONBOARDING_BEHIND_PARTICLES_CSS}</style>
    );
  },
);

const OnboardingScreenTransitionKeyframes = React.memo(
  function OnboardingScreenTransitionKeyframes(): ReactElement {
    return (
      // eslint-disable-next-line react/no-unknown-property -- style tag for scoped onboarding transition
      <style>{ONBOARDING_SCREEN_TRANSITION_KEYFRAMES}</style>
    );
  },
);

const OnboardingCardBehindParticles = React.memo(
  function OnboardingCardBehindParticles({
    lightweight,
    reducedMotion,
  }: {
    lightweight: boolean;
    reducedMotion: boolean;
  }): ReactElement | null {
    if (reducedMotion) {
      return null;
    }

    const sparks = lightweight
      ? ONBOARDING_MAGIC_SPARK_SPECS.slice(0, 3)
      : ONBOARDING_MAGIC_SPARK_SPECS;
    const particles = lightweight
      ? ONBOARDING_BEHIND_PARTICLE_SPECS.slice(0, 3)
      : ONBOARDING_BEHIND_PARTICLE_SPECS;

    return (
      <>
        <div
          aria-hidden
          className="opacity-70 pointer-events-none absolute inset-0 z-[21] overflow-hidden rounded-16"
        >
          <div
            className={classNames(
              'bg-accent-avocado-default/50 absolute left-[5%] top-[8%] h-[42%] w-[55%] rounded-full',
              lightweight ? 'blur-lg' : 'blur-2xl',
            )}
            style={{
              animation: lightweight
                ? undefined
                : 'onboardingAuraDrift 5.5s ease-in-out infinite',
            }}
          />
          {!lightweight && (
            <>
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
            </>
          )}
          {sparks.map((spark) => (
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
          {particles.map((particle) => (
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
  },
);

const OnboardingSwipeEdgeHalos = ({
  deltaX,
  isDragging,
  useLiveIntensity,
}: {
  deltaX: number;
  isDragging: boolean;
  useLiveIntensity: boolean;
}): ReactElement | null => {
  if (!isDragging) {
    return null;
  }

  const intensities = getOnboardingSwipeVisualIntensities(deltaX);

  const renderHalo = (direction: 'left' | 'right'): ReactElement => {
    const isRight = direction === 'right';
    const accentColor = isRight
      ? 'var(--theme-accent-avocado-default)'
      : 'var(--theme-accent-bacon-default)';
    let strength: number | string = intensities[direction];
    if (useLiveIntensity) {
      strength =
        direction === 'right'
          ? ONBOARDING_RIGHT_INTENSITY_VAR
          : ONBOARDING_LEFT_INTENSITY_VAR;
    }
    const opacity =
      typeof strength === 'number'
        ? strength * 0.48
        : `calc(${strength} * 0.48)`;

    return (
      <span
        key={direction}
        aria-hidden
        className="pointer-events-none absolute inset-y-6 z-[7] w-8 rounded-full blur-lg transition-opacity duration-150"
        style={{
          [direction]: 0,
          opacity,
          background: `linear-gradient(${
            isRight ? '270deg' : '90deg'
          }, color-mix(in srgb, ${accentColor} 72%, transparent) 0%, color-mix(in srgb, ${accentColor} 28%, transparent) 44%, transparent 100%)`,
        }}
      />
    );
  };

  return <>{(['left', 'right'] as const).map(renderHalo)}</>;
};

const OnboardingSwipeHintButton = ({
  deltaX,
  direction,
  disabled,
  onClick,
}: {
  deltaX: number;
  direction: 'left' | 'right';
  disabled: boolean;
  onClick: () => void;
}): ReactElement => {
  const swipeVisualIntensity = Math.min(Math.abs(deltaX) / SWIPE_THRESHOLD, 1);
  const isLeftDirection = direction === 'left';
  let visualStrength = 0;
  if (isLeftDirection && deltaX < 0) {
    visualStrength = swipeVisualIntensity;
  }
  if (!isLeftDirection && deltaX > 0) {
    visualStrength = swipeVisualIntensity;
  }
  const accentColor = isLeftDirection
    ? 'var(--theme-accent-bacon-default)'
    : 'var(--theme-accent-avocado-default)';
  const isEmphasized = visualStrength > 0;
  const restingClassName = isLeftDirection
    ? 'border-border-subtlest-secondary text-text-secondary enabled:hover:border-accent-bacon-default enabled:hover:text-accent-bacon-default enabled:focus-visible:border-accent-bacon-default enabled:focus-visible:text-accent-bacon-default enabled:active:border-accent-bacon-default enabled:active:text-accent-bacon-default'
    : 'border-border-subtlest-secondary text-text-secondary enabled:hover:border-accent-avocado-default enabled:hover:text-accent-avocado-default enabled:focus-visible:border-accent-avocado-default enabled:focus-visible:text-accent-avocado-default enabled:active:border-accent-avocado-default enabled:active:text-accent-avocado-default';

  return (
    <button
      type="button"
      aria-label={isLeftDirection ? 'Not interesting' : 'Interesting'}
      disabled={disabled}
      className={classNames(
        'shadow-1 flex size-14 cursor-pointer items-center justify-center rounded-full border transition-all duration-150 ease-out',
        'disabled:cursor-not-allowed disabled:opacity-40',
        isEmphasized ? 'opacity-100' : restingClassName,
      )}
      style={{
        transform: `scale(${1 + visualStrength * 0.1})`,
        ...(isEmphasized
          ? {
              color: accentColor,
              borderColor: accentColor,
              backgroundColor: `color-mix(in srgb, ${accentColor} ${Math.round(
                visualStrength * 16,
              )}%, transparent)`,
              boxShadow: `0 0 ${
                8 + visualStrength * 10
              }px color-mix(in srgb, ${accentColor} ${Math.round(
                visualStrength * 45,
              )}%, transparent)`,
            }
          : {}),
      }}
      onClick={onClick}
    >
      {isLeftDirection ? (
        <MiniCloseIcon size={IconSize.Large} />
      ) : (
        <VIcon size={IconSize.Large} />
      )}
    </button>
  );
};

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
  return (
    <div className="flex items-center justify-center gap-6 px-1">
      <OnboardingSwipeHintButton
        deltaX={deltaX}
        direction="left"
        disabled={disabled}
        onClick={onNotInteresting}
      />
      <OnboardingSwipeHintButton
        deltaX={deltaX}
        direction="right"
        disabled={disabled}
        onClick={onInteresting}
      />
    </div>
  );
};

export const getElasticDelta = (delta: number): number => {
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

const getFeedbackBorderColor = (
  accentColor: string,
  intensity: number,
): string =>
  `color-mix(in srgb, ${accentColor} ${Math.round(
    intensity * 100,
  )}%, var(--theme-border-subtlest-tertiary))`;

const getFeedbackBoxShadow = ({
  accentColor,
  intensity,
  isLightweight,
  isSkip,
}: {
  accentColor: string;
  intensity: number;
  isLightweight: boolean;
  isSkip: boolean;
}): string | undefined => {
  if (isLightweight) {
    return undefined;
  }

  const primarySize = isSkip ? 22 : 24;
  const primarySpread = 8;
  const primaryAlpha = isSkip ? 60 : 65;
  const secondarySize = isSkip ? 28 : 34;
  const secondarySpread = isSkip ? 12 : 14;

  return `0 0 ${6 + intensity * primarySize}px ${
    2 + intensity * primarySpread
  }px color-mix(in srgb, ${accentColor} ${Math.round(
    intensity * primaryAlpha,
  )}%, transparent), 0 0 ${10 + intensity * secondarySize}px ${
    4 + intensity * secondarySpread
  }px color-mix(in srgb, ${accentColor} ${Math.round(
    intensity * 42,
  )}%, transparent)`;
};

const getHotTakeFeedbackState = ({
  swipeDelta,
  skipEffectIntensity,
  isLightweight,
}: {
  swipeDelta: number;
  skipEffectIntensity: number;
  isLightweight: boolean;
}): {
  swipeDirection: SwipeDirection | null;
  effectIntensity: number;
  hotEffectIntensity: number;
  coldEffectIntensity: number;
  skipEffectIntensity: number;
  activeBorderColor?: string;
  activeBoxShadow?: string;
} => {
  const swipeDirection = getSwipeDirectionFromDelta(swipeDelta);
  const effectIntensity = getSwipeEffectIntensity(swipeDelta);
  const hotEffectIntensity = swipeDirection === 'right' ? effectIntensity : 0;
  const coldEffectIntensity = swipeDirection === 'left' ? effectIntensity : 0;
  const isSkipVisualActive = skipEffectIntensity > 0.02;
  const skipAccentColor = 'var(--theme-accent-blueCheese-default)';

  if (swipeDirection) {
    const accentColor =
      swipeDirection === 'right'
        ? 'var(--theme-accent-ketchup-default)'
        : COLD_ACCENT_COLOR;

    return {
      swipeDirection,
      effectIntensity,
      hotEffectIntensity,
      coldEffectIntensity,
      skipEffectIntensity,
      activeBorderColor: getFeedbackBorderColor(accentColor, effectIntensity),
      activeBoxShadow: getFeedbackBoxShadow({
        accentColor,
        intensity: effectIntensity,
        isLightweight,
        isSkip: false,
      }),
    };
  }

  if (isSkipVisualActive) {
    return {
      swipeDirection,
      effectIntensity,
      hotEffectIntensity,
      coldEffectIntensity,
      skipEffectIntensity,
      activeBorderColor: getFeedbackBorderColor(
        skipAccentColor,
        skipEffectIntensity,
      ),
      activeBoxShadow: getFeedbackBoxShadow({
        accentColor: skipAccentColor,
        intensity: skipEffectIntensity,
        isLightweight,
        isSkip: true,
      }),
    };
  }

  return {
    swipeDirection,
    effectIntensity,
    hotEffectIntensity,
    coldEffectIntensity,
    skipEffectIntensity,
  };
};

const applyHotTakeFeedbackStyles = ({
  element,
  swipeDelta,
  skipDeltaY,
  isLightweight,
}: {
  element: HTMLDivElement;
  swipeDelta: number;
  skipDeltaY: number;
  isLightweight: boolean;
}): void => {
  const feedback = getHotTakeFeedbackState({
    swipeDelta,
    skipEffectIntensity:
      skipDeltaY < 0 ? getSkipEffectIntensity(skipDeltaY) : 0,
    isLightweight,
  });

  element.style.setProperty(
    '--hot-take-hot-intensity',
    formatIntensity(feedback.hotEffectIntensity),
  );
  element.style.setProperty(
    '--hot-take-cold-intensity',
    formatIntensity(feedback.coldEffectIntensity),
  );
  element.style.setProperty(
    '--hot-take-skip-intensity',
    formatIntensity(feedback.skipEffectIntensity),
  );

  if (feedback.activeBorderColor) {
    element.style.setProperty('border-color', feedback.activeBorderColor);
  } else {
    element.style.removeProperty('border-color');
  }

  if (feedback.activeBoxShadow) {
    element.style.setProperty('box-shadow', feedback.activeBoxShadow);
  } else {
    element.style.removeProperty('box-shadow');
  }
};

const applyOnboardingFeedbackStyles = ({
  element,
  swipeAreaElement,
  swipeDelta,
}: {
  element: HTMLDivElement;
  swipeAreaElement: HTMLDivElement | null;
  swipeDelta: number;
}): void => {
  const intensities = getOnboardingSwipeVisualIntensities(swipeDelta);
  const swipeIntensity = getSwipeIntensity(swipeDelta);
  const leftBadgeIntensity =
    swipeDelta < -FEEDBACK_ACTIVATION_DELTA ? swipeIntensity : 0;
  const rightBadgeIntensity =
    swipeDelta > FEEDBACK_ACTIVATION_DELTA ? swipeIntensity : 0;
  const targets = [element, swipeAreaElement].filter(
    Boolean,
  ) as HTMLDivElement[];

  targets.forEach((target) => {
    target.style.setProperty(
      '--onboarding-swipe-left-intensity',
      formatIntensity(intensities.left),
    );
    target.style.setProperty(
      '--onboarding-swipe-right-intensity',
      formatIntensity(intensities.right),
    );
    target.style.setProperty(
      '--onboarding-swipe-left-badge-intensity',
      formatIntensity(leftBadgeIntensity),
    );
    target.style.setProperty(
      '--onboarding-swipe-right-badge-intensity',
      formatIntensity(rightBadgeIntensity),
    );
  });
};

const clearHotTakeFeedbackStyles = (element: HTMLDivElement): void => {
  element.style.setProperty('--hot-take-hot-intensity', '0');
  element.style.setProperty('--hot-take-cold-intensity', '0');
  element.style.setProperty('--hot-take-skip-intensity', '0');
  element.style.removeProperty('border-color');
  element.style.removeProperty('box-shadow');
};

const clearOnboardingFeedbackStyles = ({
  element,
  swipeAreaElement,
}: {
  element: HTMLDivElement;
  swipeAreaElement: HTMLDivElement | null;
}): void => {
  const targets = [element, swipeAreaElement].filter(
    Boolean,
  ) as HTMLDivElement[];

  targets.forEach((target) => {
    target.style.setProperty('--onboarding-swipe-left-intensity', '0');
    target.style.setProperty('--onboarding-swipe-right-intensity', '0');
    target.style.setProperty('--onboarding-swipe-left-badge-intensity', '0');
    target.style.setProperty('--onboarding-swipe-right-badge-intensity', '0');
  });
};

const applyActiveSwipeFrame = ({
  element,
  swipeAreaElement,
  swipeDelta,
  skipDeltaY,
  isHotTake,
  isLightweight,
}: {
  element: HTMLDivElement;
  swipeAreaElement: HTMLDivElement | null;
  swipeDelta: number;
  skipDeltaY: number;
  isHotTake: boolean;
  isLightweight: boolean;
}): void => {
  element.style.setProperty(
    'transform',
    `translateX(${swipeDelta}px) translateY(${skipDeltaY}px) rotate(${getSwipeRotation(
      swipeDelta,
    )}deg) scale(1)`,
  );
  element.style.setProperty('will-change', 'transform');

  if (isHotTake) {
    applyHotTakeFeedbackStyles({
      element,
      swipeDelta,
      skipDeltaY,
      isLightweight,
    });
    return;
  }

  applyOnboardingFeedbackStyles({
    element,
    swipeAreaElement,
    swipeDelta,
  });
};

const requestSwipeAnimationFrame = (callback: FrameRequestCallback): number => {
  if (typeof window.requestAnimationFrame === 'function') {
    return window.requestAnimationFrame(callback);
  }

  return window.setTimeout(() => callback(performance.now()), 16);
};

const cancelSwipeAnimationFrame = (frameId: number): void => {
  if (typeof window.cancelAnimationFrame === 'function') {
    window.cancelAnimationFrame(frameId);
    return;
  }

  window.clearTimeout(frameId);
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

const LIGHTWEIGHT_FLAMES = FLAMES.filter((_, index) =>
  [1, 4, 7, 9].includes(index),
);
const LIGHTWEIGHT_EMBERS = EMBERS.filter((_, index) =>
  [0, 4, 8, 12].includes(index),
);
const LIGHTWEIGHT_ICICLES = ICICLES.filter((_, index) =>
  [1, 4, 7, 10].includes(index),
);
const LIGHTWEIGHT_SNOWFLAKES = SNOWFLAKES.filter((_, index) =>
  [1, 5, 8, 13].includes(index),
);
const LIGHTWEIGHT_SLEEP_ZS = SLEEP_ZS.filter((_, index) =>
  [0, 2, 4].includes(index),
);
const LIGHTWEIGHT_SLEEP_BUBBLES = SLEEP_BUBBLES.filter((_, index) =>
  [0, 3, 6].includes(index),
);

type FeedbackEffectLayerProps = {
  active: boolean;
  intensity: number;
  lightweight: boolean;
  reducedMotion: boolean;
  useLiveIntensity: boolean;
};

const getEffectIntensityValue = (
  fallbackIntensity: number,
  liveIntensity: string,
  useLiveIntensity: boolean,
): CssIntensity => (useLiveIntensity ? liveIntensity : fallbackIntensity);

const HotTakeEffectKeyframes = React.memo(
  function HotTakeEffectKeyframes(): ReactElement {
    return (
      // eslint-disable-next-line react/no-unknown-property -- style tag for scoped keyframes
      <style>{EFFECT_KEYFRAMES}</style>
    );
  },
);

const HotSwipeEffectLayer = React.memo(function HotSwipeEffectLayer({
  active,
  intensity: fallbackIntensity,
  lightweight,
  reducedMotion,
  useLiveIntensity,
}: FeedbackEffectLayerProps): ReactElement | null {
  if (!active) {
    return null;
  }

  const intensity = getEffectIntensityValue(
    fallbackIntensity,
    HOT_INTENSITY_VAR,
    useLiveIntensity,
  );
  const flames = lightweight ? LIGHTWEIGHT_FLAMES : FLAMES;
  const embers = lightweight ? LIGHTWEIGHT_EMBERS : EMBERS;
  const showParticles = !reducedMotion;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-16"
      style={{ opacity: intensity }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          background: `linear-gradient(180deg, rgba(255,150,20,${cssAlpha(
            intensity,
            0.08,
          )}) 0%, rgba(255,90,0,${cssAlpha(
            intensity,
            0.16,
          )}) 42%, rgba(100,20,0,${cssAlpha(intensity, 0.24)}) 100%)`,
          boxShadow: lightweight
            ? undefined
            : [
                `inset 0 ${cssNegativePixelText(intensity, 55)} ${cssPixelText(
                  intensity,
                  44,
                )} ${cssNegativePixelText(intensity, 16)} rgba(255,100,0,0.4)`,
                `inset ${cssPixelText(intensity, 26)} 0 ${cssPixelText(
                  intensity,
                  28,
                )} ${cssNegativePixelText(intensity, 14)} rgba(255,60,0,0.15)`,
                `inset ${cssNegativePixelText(intensity, 26)} 0 ${cssPixelText(
                  intensity,
                  28,
                )} ${cssNegativePixelText(intensity, 14)} rgba(255,60,0,0.15)`,
              ].join(', '),
          animation: reducedMotion
            ? undefined
            : `hotTakeHeatShimmer ${cssNumber(
                intensity,
                -0.4,
                1,
              )}s ease-in-out infinite`,
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
          background: `radial-gradient(ellipse at 50% 100%, rgba(255,80,0,${cssAlpha(
            intensity,
            0.42,
          )}) 0%, rgba(255,125,0,${cssAlpha(
            intensity,
            0.24,
          )}) 40%, transparent 78%)`,
          filter: lightweight
            ? undefined
            : `blur(${cssPixelText(intensity, 5, 5)})`,
          animation: reducedMotion
            ? undefined
            : 'hotTakeHeatShimmer 1.1s ease-in-out infinite',
        }}
      />
      {showParticles &&
        flames.map((flame, i) => (
          <div
            key={flame.left}
            data-hot-take-particle="flame"
            style={{
              position: 'absolute',
              bottom: -2,
              left: flame.left,
              width: flame.size * 0.55,
              height: cssPixels(intensity, flame.size),
              background:
                'radial-gradient(ellipse at 50% 88%, #fff29a 0%, #ffcf3d 20%, #ff8a00 45%, #ff3b00 66%, rgba(0,0,0,0) 84%)',
              borderRadius: '50% 50% 20% 20%',
              filter: lightweight
                ? undefined
                : `blur(${cssPixelText(
                    intensity,
                    1.8,
                    1.4,
                  )}) saturate(${cssNumber(intensity, 0.35, 1)})`,
              animation: reducedMotion
                ? undefined
                : `hotTakeFlame ${
                    0.3 + i * 0.06
                  }s ease-in-out infinite alternate`,
              animationDelay: `${flame.delay}s`,
              transform: 'translateX(-50%)',
              opacity: cssNumber(intensity, 0.55, 0.45),
            }}
          />
        ))}
      {showParticles &&
        embers.map((ember) => (
          <div
            key={`${ember.left}-${ember.bottom}`}
            data-hot-take-particle="ember"
            style={{
              position: 'absolute',
              left: ember.left,
              bottom: ember.bottom,
              width: ember.size,
              height: ember.size,
              borderRadius: '50%',
              background:
                'radial-gradient(circle, #fff6ba 0%, #ffcb58 22%, #ff7a1a 54%, rgba(255,80,0,0.2) 80%, transparent 100%)',
              boxShadow: lightweight
                ? undefined
                : `0 0 ${ember.size + 3}px rgba(255,120,0,${cssAlpha(
                    intensity,
                    0.55,
                    0.35,
                  )})`,
              animation: reducedMotion
                ? undefined
                : `hotTakeEmber ${ember.duration}s ease-out infinite`,
              animationDelay: `${ember.delay}s`,
              opacity: cssNumber(intensity, 0.7, 0.3),
            }}
          />
        ))}
    </div>
  );
});

const ColdSwipeEffectLayer = React.memo(function ColdSwipeEffectLayer({
  active,
  intensity: fallbackIntensity,
  lightweight,
  reducedMotion,
  useLiveIntensity,
}: FeedbackEffectLayerProps): ReactElement | null {
  if (!active) {
    return null;
  }

  const intensity = getEffectIntensityValue(
    fallbackIntensity,
    COLD_INTENSITY_VAR,
    useLiveIntensity,
  );
  const icicles = lightweight ? LIGHTWEIGHT_ICICLES : ICICLES;
  const snowflakes = lightweight ? LIGHTWEIGHT_SNOWFLAKES : SNOWFLAKES;
  const showParticles = !reducedMotion;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-16"
      style={{ opacity: intensity }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          background: `linear-gradient(180deg, rgba(210,240,255,${cssAlpha(
            intensity,
            0.22,
          )}) 0%, rgba(140,210,255,${cssAlpha(
            intensity,
            0.12,
          )}) 42%, rgba(120,170,255,${cssAlpha(intensity, 0.1)}) 100%)`,
          boxShadow: lightweight
            ? undefined
            : [
                `inset 0 ${cssPixelText(intensity, 52)} ${cssPixelText(
                  intensity,
                  42,
                )} ${cssNegativePixelText(
                  intensity,
                  15,
                )} rgba(150,210,255,0.35)`,
                `inset ${cssPixelText(intensity, 24)} 0 ${cssPixelText(
                  intensity,
                  26,
                )} ${cssNegativePixelText(
                  intensity,
                  15,
                )} rgba(130,200,255,0.12)`,
                `inset ${cssNegativePixelText(intensity, 24)} 0 ${cssPixelText(
                  intensity,
                  26,
                )} ${cssNegativePixelText(
                  intensity,
                  15,
                )} rgba(130,200,255,0.12)`,
              ].join(', '),
          backdropFilter: lightweight
            ? undefined
            : `blur(${cssPixelText(intensity, 1.2)})`,
          animation: reducedMotion
            ? undefined
            : `hotTakeFrostBreath ${cssNumber(
                intensity,
                -0.35,
                1.2,
              )}s ease-in-out infinite`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: cssPercent(intensity, 10, 18),
          background: `linear-gradient(180deg, rgba(225,245,255,${cssAlpha(
            intensity,
            0.42,
          )}) 0%, rgba(170,220,255,${cssAlpha(
            intensity,
            0.14,
          )}) 75%, transparent 100%)`,
          filter: lightweight
            ? undefined
            : `blur(${cssPixelText(intensity, 1.2, 1.5)})`,
          animation: reducedMotion
            ? undefined
            : 'hotTakeFrostBreath 1.2s ease-in-out infinite',
        }}
      />
      {showParticles &&
        icicles.map((icicle, i) => (
          <div
            key={icicle.left}
            data-hot-take-particle="icicle"
            style={{
              position: 'absolute',
              top: -1,
              left: icicle.left,
              width: icicle.width,
              height: cssPixels(intensity, icicle.height),
              background:
                'linear-gradient(180deg, rgba(220,240,255,0.95) 0%, rgba(140,210,255,0.85) 40%, rgba(100,180,255,0.5) 100%)',
              clipPath: ICICLE_SHAPES[icicle.shape],
              transform: `translateX(-50%) rotate(${icicle.rotate}deg)`,
              transformOrigin: 'top center',
              boxShadow: lightweight
                ? undefined
                : `0 2px ${cssPixelText(
                    intensity,
                    4,
                    4,
                  )} rgba(175,220,255,${cssAlpha(intensity, 0.4, 0.3)})`,
              filter: lightweight
                ? undefined
                : `saturate(${cssNumber(intensity, 0.25, 1)})`,
              animation: reducedMotion
                ? undefined
                : `hotTakeIcicleShimmer ${2 + i * 0.2}s ease-in-out infinite`,
              animationDelay: `${icicle.delay}s`,
            }}
          />
        ))}
      {showParticles &&
        snowflakes.map((flake) => (
          <div
            key={`${flake.left}-${flake.top}`}
            data-hot-take-particle="snowflake"
            style={{
              position: 'absolute',
              left: flake.left,
              top: flake.top,
              width: flake.size,
              height: flake.size,
              borderRadius: '50%',
              background:
                'radial-gradient(circle, white 0%, rgba(200,230,255,0.8) 60%, transparent 100%)',
              boxShadow: lightweight
                ? undefined
                : `0 0 ${cssPixelText(
                    intensity,
                    2,
                    flake.size,
                  )} rgba(200,230,255,${cssAlpha(intensity, 0.5, 0.35)})`,
              animation: reducedMotion
                ? undefined
                : `hotTakeSnowfall ${flake.duration}s ease-in-out infinite`,
              animationDelay: `${flake.delay}s`,
              opacity: cssNumber(intensity, 0.65, 0.35),
            }}
          />
        ))}
    </div>
  );
});

const SkipSwipeEffectLayer = React.memo(function SkipSwipeEffectLayer({
  active,
  intensity: fallbackIntensity,
  lightweight,
  reducedMotion,
  useLiveIntensity,
}: FeedbackEffectLayerProps): ReactElement | null {
  if (!active) {
    return null;
  }

  const intensity = getEffectIntensityValue(
    fallbackIntensity,
    SKIP_INTENSITY_VAR,
    useLiveIntensity,
  );
  const sleepZs = lightweight ? LIGHTWEIGHT_SLEEP_ZS : SLEEP_ZS;
  const bubbles = lightweight ? LIGHTWEIGHT_SLEEP_BUBBLES : SLEEP_BUBBLES;
  const showParticles = !reducedMotion;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-16"
      style={{ opacity: intensity }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          background: `linear-gradient(180deg, rgba(222,246,255,${cssAlpha(
            intensity,
            0.2,
          )}) 0%, rgba(180,230,255,${cssAlpha(
            intensity,
            0.12,
          )}) 46%, rgba(120,186,240,${cssAlpha(intensity, 0.16)}) 100%)`,
          boxShadow: lightweight
            ? undefined
            : [
                `inset 0 ${cssPixelText(intensity, 52)} ${cssPixelText(
                  intensity,
                  44,
                )} ${cssNegativePixelText(
                  intensity,
                  15,
                )} rgba(170,225,255,0.32)`,
                `inset ${cssPixelText(intensity, 24)} 0 ${cssPixelText(
                  intensity,
                  24,
                )} ${cssNegativePixelText(
                  intensity,
                  14,
                )} rgba(140,210,255,0.18)`,
                `inset ${cssNegativePixelText(intensity, 24)} 0 ${cssPixelText(
                  intensity,
                  24,
                )} ${cssNegativePixelText(
                  intensity,
                  14,
                )} rgba(140,210,255,0.18)`,
              ].join(', '),
          backdropFilter: lightweight
            ? undefined
            : `blur(${cssPixelText(intensity, 1.5, 0.4)})`,
          animation: reducedMotion
            ? undefined
            : `hotTakeSleepBreath ${cssNumber(
                intensity,
                -0.4,
                1.6,
              )}s ease-in-out infinite`,
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
          background: `radial-gradient(ellipse at 50% 0%, rgba(220,245,255,${cssAlpha(
            intensity,
            0.52,
          )}) 0%, rgba(170,220,255,${cssAlpha(
            intensity,
            0.22,
          )}) 42%, transparent 78%)`,
          filter: lightweight
            ? undefined
            : `blur(${cssPixelText(intensity, 5, 4)})`,
        }}
      />
      {showParticles &&
        sleepZs.map((sleepZ) => (
          <span
            key={`${sleepZ.left}-${sleepZ.bottom}`}
            data-hot-take-particle="sleep-z"
            style={{
              position: 'absolute',
              left: sleepZ.left,
              bottom: sleepZ.bottom,
              fontSize: sleepZ.size,
              fontWeight: 800,
              lineHeight: 1,
              color: `rgba(230,248,255,${cssAlpha(intensity, 0.75, 0.25)})`,
              textShadow: lightweight
                ? undefined
                : `0 0 ${cssPixelText(
                    intensity,
                    10,
                    4,
                  )} rgba(150,220,255,${cssAlpha(intensity, 0.52, 0.18)})`,
              transform: `translateX(-50%) rotate(${sleepZ.rotate}deg)`,
              animation: reducedMotion
                ? undefined
                : `hotTakeSleepFloat ${sleepZ.duration}s ease-in infinite`,
              animationDelay: `${sleepZ.delay}s`,
              opacity: cssNumber(intensity, 0.76, 0.24),
            }}
          >
            Z
          </span>
        ))}
      {showParticles &&
        bubbles.map((bubble) => (
          <div
            key={`${bubble.left}-${bubble.bottom}`}
            data-hot-take-particle="sleep-bubble"
            style={{
              position: 'absolute',
              left: bubble.left,
              bottom: bubble.bottom,
              width: bubble.size,
              height: bubble.size,
              borderRadius: '50%',
              background:
                'radial-gradient(circle at 28% 28%, rgba(255,255,255,0.95) 0%, rgba(225,245,255,0.55) 44%, rgba(170,220,255,0.2) 100%)',
              border: `1px solid rgba(208,240,255,${cssAlpha(
                intensity,
                0.5,
                0.18,
              )})`,
              boxShadow: lightweight
                ? undefined
                : `0 0 ${bubble.size + 4}px rgba(150,220,255,${cssAlpha(
                    intensity,
                    0.48,
                    0.15,
                  )})`,
              animation: reducedMotion
                ? undefined
                : `hotTakeBubbleRise ${bubble.duration}s ease-out infinite`,
              animationDelay: `${bubble.delay}s`,
              opacity: cssNumber(intensity, 0.8, 0.2),
            }}
          />
        ))}
    </div>
  );
});

const HotTakeFeedbackBadges = React.memo(function HotTakeFeedbackBadges({
  active,
  useLiveIntensity,
  hotIntensity,
  coldIntensity,
  skipIntensity,
}: {
  active: boolean;
  useLiveIntensity: boolean;
  hotIntensity: number;
  coldIntensity: number;
  skipIntensity: number;
}): ReactElement | null {
  if (!active) {
    return null;
  }

  const hotOpacity = getEffectIntensityValue(
    hotIntensity,
    HOT_INTENSITY_VAR,
    useLiveIntensity,
  );
  const coldOpacity = getEffectIntensityValue(
    coldIntensity,
    COLD_INTENSITY_VAR,
    useLiveIntensity,
  );
  const skipOpacity = getEffectIntensityValue(
    skipIntensity,
    SKIP_INTENSITY_VAR,
    useLiveIntensity,
  );

  return (
    <>
      <div
        className="z-20 absolute left-1/2 top-4 -translate-x-1/2 rounded-10 bg-accent-ketchup-default px-4 py-1 font-bold text-white typo-title3"
        style={{
          opacity: hotOpacity,
          animation: 'hotTakeBadgePulse 0.18s ease-out',
          boxShadow: `0 6px ${cssPixelText(
            hotOpacity,
            10,
            12,
          )} rgba(0,0,0,${cssAlpha(hotOpacity, 0.18, 0.1)})`,
        }}
      >
        HOT 🔥
      </div>
      <div
        className="z-20 absolute left-1/2 top-4 -translate-x-1/2 rounded-10 px-4 py-1 font-bold text-white typo-title3"
        style={{
          opacity: coldOpacity,
          animation: 'hotTakeBadgePulse 0.18s ease-out',
          backgroundColor: COLD_ACCENT_COLOR,
          boxShadow: `0 6px ${cssPixelText(
            coldOpacity,
            10,
            12,
          )} rgba(0,0,0,${cssAlpha(coldOpacity, 0.18, 0.1)})`,
        }}
      >
        COLD 🥶
      </div>
      <div
        className="z-20 absolute left-1/2 top-4 -translate-x-1/2 rounded-10 bg-accent-blueCheese-default px-4 py-1 font-bold text-white typo-title3"
        style={{
          opacity: skipOpacity,
          animation: 'hotTakeBadgePulse 0.18s ease-out',
          boxShadow: `0 6px ${cssPixelText(
            skipOpacity,
            10,
            12,
          )} rgba(0,0,0,${cssAlpha(skipOpacity, 0.18, 0.1)})`,
        }}
      >
        SKIP 😴
      </div>
    </>
  );
});

type HotTakeCardProps = {
  hotTake: HotTake;
  isTop: boolean;
  offset: number;
  swipeDelta: number;
  skipDeltaY?: number;
  isDismissAnimating: boolean;
  isDragging: boolean;
  dismissDurationMs: number;
  isLightweightEffects: boolean;
  prefersReducedMotion: boolean;
};

const HotTakeCard = React.memo(
  React.forwardRef<HTMLDivElement, HotTakeCardProps>(function HotTakeCard(
    {
      hotTake,
      isTop,
      offset,
      swipeDelta,
      skipDeltaY = 0,
      isDismissAnimating,
      isDragging,
      dismissDurationMs,
      isLightweightEffects,
      prefersReducedMotion,
    },
    ref,
  ): ReactElement {
    const isSkipAnimating = isTop && isDismissAnimating && skipDeltaY !== 0;
    const isSkipDragging = isTop && !isDismissAnimating && skipDeltaY < 0;
    const rotation = isTop ? getSwipeRotation(swipeDelta) : 0;
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

    let skipEffectIntensity = 0;
    if (isTop) {
      if (isSkipAnimating) {
        skipEffectIntensity = dismissProgress;
      } else if (isSkipDragging) {
        skipEffectIntensity = getSkipEffectIntensity(skipDeltaY);
      }
    }
    const feedback = getHotTakeFeedbackState({
      swipeDelta: isTop ? swipeDelta : 0,
      skipEffectIntensity: isTop ? skipEffectIntensity : 0,
      isLightweight: isLightweightEffects,
    });
    const hotEffectIntensity = quantizeIntensity(feedback.hotEffectIntensity);
    const coldEffectIntensity = quantizeIntensity(feedback.coldEffectIntensity);
    const quantizedSkipEffectIntensity = quantizeIntensity(
      feedback.skipEffectIntensity,
    );
    const useLiveIntensity = isTop && isDragging && !isDismissAnimating;
    const feedbackActive =
      isTop &&
      (isDragging ||
        isDismissAnimating ||
        hotEffectIntensity > 0 ||
        coldEffectIntensity > 0 ||
        quantizedSkipEffectIntensity > 0);
    let transition =
      'transform 0.3s ease, border-color 0.2s ease, box-shadow 0.2s ease';
    if (isTop) {
      if (isDismissAnimating) {
        transition = `transform ${dismissDurationMs}ms cubic-bezier(0.16, 0.86, 0.22, 1), opacity ${dismissDurationMs}ms ease-out, filter ${dismissDurationMs}ms ease-out, border-color 0.2s ease, box-shadow 0.2s ease`;
      } else if (isDragging) {
        transition = HOT_TAKE_DRAG_TRANSITION;
      } else {
        transition = HOT_TAKE_REST_TRANSITION;
      }
    }

    return (
      <div
        ref={ref}
        data-testid="hot-take-card"
        data-active-card={isTop ? 'true' : 'false'}
        className={classNames(
          'absolute inset-0 flex select-none flex-col rounded-16 border border-border-subtlest-tertiary bg-background-subtle shadow-2',
          !isTop && 'pointer-events-none',
        )}
        style={
          {
            '--hot-take-hot-intensity': hotEffectIntensity,
            '--hot-take-cold-intensity': coldEffectIntensity,
            '--hot-take-skip-intensity': quantizedSkipEffectIntensity,
            transform: `translateX(${translateX}px) translateY(${translateYWithOutro}px) rotate(${rotation}deg) scale(${scale})`,
            zIndex: 10 - offset,
            transition,
            opacity: isTop ? 1 - dismissProgress * 0.75 : 1,
            filter:
              isTop && isDismissAnimating
                ? `blur(${dismissProgress * 1.8}px)`
                : undefined,
            borderColor: feedback.activeBorderColor,
            boxShadow: feedback.activeBoxShadow,
            willChange: useLiveIntensity ? 'transform' : undefined,
          } as CSSPropertiesWithVars
        }
      >
        <HotSwipeEffectLayer
          active={feedbackActive}
          intensity={hotEffectIntensity}
          lightweight={isLightweightEffects}
          reducedMotion={prefersReducedMotion}
          useLiveIntensity={useLiveIntensity}
        />
        <ColdSwipeEffectLayer
          active={feedbackActive}
          intensity={coldEffectIntensity}
          lightweight={isLightweightEffects}
          reducedMotion={prefersReducedMotion}
          useLiveIntensity={useLiveIntensity}
        />
        <SkipSwipeEffectLayer
          active={feedbackActive}
          intensity={quantizedSkipEffectIntensity}
          lightweight={isLightweightEffects}
          reducedMotion={prefersReducedMotion}
          useLiveIntensity={useLiveIntensity}
        />
        <HotTakeFeedbackBadges
          active={feedbackActive}
          hotIntensity={hotEffectIntensity}
          coldIntensity={coldEffectIntensity}
          skipIntensity={quantizedSkipEffectIntensity}
          useLiveIntensity={useLiveIntensity}
        />

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
              <div className="flex min-w-0 items-center gap-1">
                <span className="min-w-0 truncate font-bold typo-callout">
                  {hotTake.user.name}
                </span>
                {hotTake.user.isPlus && (
                  <PlusUserBadge
                    user={{ isPlus: hotTake.user.isPlus }}
                    tooltip={false}
                  />
                )}
                <span className="min-w-0 truncate text-text-tertiary typo-footnote">
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
  }),
);

type OnboardingPostCardProps = {
  card: OnboardingSwipeCard;
  isTop: boolean;
  offset: number;
  swipeDelta: number;
  skipDeltaY?: number;
  isDismissAnimating: boolean;
  isDragging: boolean;
  dismissDurationMs: number;
  useInstantSwipeTransform?: boolean;
};

const OnboardingPostCard = React.memo(
  React.forwardRef<HTMLDivElement, OnboardingPostCardProps>(
    function OnboardingPostCard(
      {
        card,
        isTop,
        offset,
        swipeDelta,
        skipDeltaY = 0,
        isDismissAnimating,
        isDragging,
        dismissDurationMs,
        useInstantSwipeTransform = false,
      },
      ref,
    ): ReactElement {
      const sourceName = card.source?.name || 'daily.dev';
      const sourceImage = card.source?.image;
      const isSkipAnimating = isTop && isDismissAnimating && skipDeltaY !== 0;
      const swipeDirection = isTop
        ? getSwipeDirectionFromDelta(swipeDelta)
        : null;
      const swipeIntensity = isTop ? getSwipeIntensity(swipeDelta) : 0;
      const rotation = isTop ? getSwipeRotation(swipeDelta) : 0;
      const translateX = isTop ? swipeDelta : 0;
      const stackScale = isTop ? 1 : 1 - offset * 0.05;
      const translateY = isTop ? 0 : offset * 8;
      const dismissDistance = isSkipAnimating
        ? SKIP_DISMISS_FLY_DISTANCE
        : DISMISS_FLY_DISTANCE;
      const dismissProgress =
        isTop && isDismissAnimating
          ? Math.min(
              Math.abs(isSkipAnimating ? skipDeltaY : swipeDelta) /
                dismissDistance,
              1,
            )
          : 0;
      const swipeFadeProgress =
        isTop && (isDragging || isDismissAnimating)
          ? Math.min(Math.abs(swipeDelta) / ONBOARDING_SWIPE_FADE_DISTANCE, 1)
          : 0;
      const scale = isTop ? 1 - dismissProgress * 0.06 : stackScale;
      const dismissLift = isTop ? dismissProgress * -22 : 0;
      const translateYWithOutro =
        translateY + dismissLift + (isTop ? skipDeltaY : 0);

      let transition =
        'transform 0.3s ease, opacity 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease';
      if (isTop) {
        if (isDismissAnimating) {
          transition = `transform ${dismissDurationMs}ms cubic-bezier(0.16, 0.86, 0.22, 1), opacity ${dismissDurationMs}ms ease-out, filter ${dismissDurationMs}ms ease-out`;
        } else if (isDragging || useInstantSwipeTransform) {
          transition = ONBOARDING_DRAG_TRANSITION;
        } else {
          transition = ONBOARDING_REST_TRANSITION;
        }
      }
      const useLiveSwipeIntensity = isTop && isDragging && !isDismissAnimating;
      const leftBadgeIntensity = swipeDirection === 'left' ? swipeIntensity : 0;
      const rightBadgeIntensity =
        swipeDirection === 'right' ? swipeIntensity : 0;
      const leftBadgeOpacity = useLiveSwipeIntensity
        ? ONBOARDING_LEFT_BADGE_INTENSITY_VAR
        : leftBadgeIntensity;
      const rightBadgeOpacity = useLiveSwipeIntensity
        ? ONBOARDING_RIGHT_BADGE_INTENSITY_VAR
        : rightBadgeIntensity;
      const showSwipeBadge =
        isTop &&
        (isDragging ||
          leftBadgeIntensity > 0 ||
          rightBadgeIntensity > 0 ||
          isDismissAnimating);

      let sourceAvatar: ReactElement;
      if (sourceImage) {
        sourceAvatar = (
          <img
            alt={`${sourceName} source icon`}
            className="size-6 rounded-full object-cover"
            draggable={false}
            src={sourceImage}
          />
        );
      } else if (sourceName === 'daily.dev') {
        sourceAvatar = (
          <div
            role="img"
            aria-label="daily.dev source icon"
            className="flex size-6 items-center justify-center rounded-full bg-surface-hover"
          >
            <LogoIcon className={{ container: 'h-2.5 w-auto' }} />
          </div>
        );
      } else {
        sourceAvatar = <div className="size-6 rounded-full bg-surface-hover" />;
      }

      return (
        <div
          ref={ref}
          data-testid="onboarding-post-card"
          data-active-card={isTop ? 'true' : 'false'}
          className={classNames(
            'flex min-h-0 w-full select-none flex-col overflow-hidden rounded-16',
            isTop
              ? 'relative border border-border-subtlest-tertiary bg-background-popover'
              : 'pointer-events-none absolute left-0 right-0 top-0 bg-background-default',
            isTop && 'cursor-grab active:cursor-grabbing',
          )}
          onDragStart={(event) => event.preventDefault()}
          style={
            {
              '--onboarding-swipe-left-badge-intensity': leftBadgeIntensity,
              '--onboarding-swipe-right-badge-intensity': rightBadgeIntensity,
              height: ONBOARDING_POST_CARD_HEIGHT,
              transform: `translateX(${translateX}px) translateY(${translateYWithOutro}px) rotate(${rotation}deg) scale(${scale})`,
              zIndex: 10 - offset,
              transition,
              opacity: isTop ? 1 - swipeFadeProgress : 1,
              filter:
                isTop && isDismissAnimating
                  ? `blur(${dismissProgress * 1.8}px)`
                  : undefined,
              boxShadow: isTop
                ? '0 1.25rem 2.75rem -0.75rem rgba(0, 0, 0, 0.45)'
                : '0 0.75rem 1.75rem -0.75rem rgba(0, 0, 0, 0.32)',
              willChange: useLiveSwipeIntensity ? 'transform' : undefined,
            } as CSSPropertiesWithVars
          }
        >
          <div className="flex min-h-0 flex-1 flex-col gap-4 p-4">
            <div className="flex shrink-0 items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                {sourceAvatar}
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Secondary}
                  className="min-w-0 truncate"
                  bold
                >
                  {sourceName}
                </Typography>
              </div>
              {showSwipeBadge ? (
                <div className="relative h-7 w-16 shrink-0">
                  <div
                    className="absolute inset-0 rounded-10 bg-accent-avocado-default px-3 py-1 text-center font-bold text-white typo-callout"
                    style={{ opacity: rightBadgeOpacity }}
                  >
                    Good
                  </div>
                  <div
                    className="absolute inset-0 rounded-10 bg-accent-bacon-default px-3 py-1 text-center font-bold text-white typo-callout"
                    style={{ opacity: leftBadgeOpacity }}
                  >
                    Meh
                  </div>
                </div>
              ) : null}
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
          </div>
        </div>
      );
    },
  ),
);

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
  onAddOwnHotTakeClick,
  username,
}: {
  onAddOwnHotTakeClick: (e: React.MouseEvent) => void;
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
        href={getAddHotTakeProfileUrl(username)}
        onClick={onAddOwnHotTakeClick}
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
  bodyClassName?: string;
  headerSlot?: ReactNode;
  topSlot?: ReactNode;
  progressSlot?: ReactNode;
  bottomSlot?: ReactNode;
  onboardingFooterSlot?: ReactNode;
  onboardingContent?: ReactNode;
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
  /** Renders onboarding swipe actions under the card or beside it on wider viewports. */
  onboardingActionLayout?: 'bottom' | 'sides';
}

const HotAndColdModal = ({
  onRequestClose,
  title = 'Hot Takes',
  bodyClassName,
  headerSlot,
  topSlot,
  progressSlot,
  bottomSlot,
  onboardingFooterSlot,
  onboardingContent,
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
  onboardingActionLayout = 'bottom',
  className,
  ...props
}: HotAndColdModalProps): ReactElement => {
  const { currentTake, nextTake, isEmpty, isLoading, dismissCurrent } =
    useDiscoverHotTakes();
  const { toggleUpvote, toggleDownvote, cancelHotTakeVote } = useVoteHotTake();
  const { logEvent } = useLogContext();
  const { user } = useAuthContext();
  const isMobileViewport = useViewSize(ViewSize.MobileL);
  const prefersReducedMotion = useMedia(
    PREFERS_REDUCED_MOTION_QUERY,
    MATCHED_MEDIA_VALUES,
    false,
  );
  const isLightweightEffects = isMobileViewport || prefersReducedMotion;
  const [swipeDelta, setSwipeDelta] = useState(0);
  const swipeDeltaRef = useRef(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const [dismissDurationMs, setDismissDurationMs] =
    useState(DISMISS_ANIMATION_MS);
  const [animatingTakeId, setAnimatingTakeId] = useState<string | null>(null);
  const animatingTakeIdRef = useRef<string | null>(null);
  const flyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [skipDelta, setSkipDelta] = useState(0);
  const swipeDeltaYRef = useRef(0);
  const activeCardRef = useRef<HTMLDivElement | null>(null);
  const swipeAreaRef = useRef<HTMLDivElement | null>(null);
  const swipeFrameRef = useRef<{
    swipeDelta: number;
    skipDeltaY: number;
    isHotTake: boolean;
    isLightweight: boolean;
  } | null>(null);
  const swipeFrameRafRef = useRef<number | null>(null);
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

  const hasOnboardingCards = !!onboardingCards;
  const hasOnboardingContent = onboardingContent !== undefined;
  const isOnboardingMode = hasOnboardingCards || hasOnboardingContent;
  const availableOnboardingCards = useMemo(
    () =>
      (onboardingCards ?? []).filter((card) => !dismissedCardIds.has(card.id)),
    [dismissedCardIds, onboardingCards],
  );
  const currentOnboardingCard = availableOnboardingCards[0];
  const nextOnboardingCard = availableOnboardingCards[1];
  const isModalLoading = isOnboardingMode ? onboardingCardsLoading : isLoading;
  const isModalEmpty = isOnboardingMode
    ? !isModalLoading && !hasOnboardingContent && !currentOnboardingCard
    : isEmpty;
  const swipeAreaHeight = isOnboardingMode
    ? ONBOARDING_SWIPE_AREA_HEIGHT
    : HOT_TAKE_CARD_HEIGHT;

  const cancelQueuedSwipeFrame = useCallback(() => {
    if (swipeFrameRafRef.current === null) {
      return;
    }

    cancelSwipeAnimationFrame(swipeFrameRafRef.current);
    swipeFrameRafRef.current = null;
    swipeFrameRef.current = null;
  }, []);

  const clearActiveCardSwipeStyles = useCallback(
    ({ snapToRest }: { snapToRest: boolean }) => {
      const element = activeCardRef.current;
      if (!element) {
        return;
      }

      element.style.removeProperty('will-change');
      if (snapToRest) {
        element.style.setProperty(
          'transition',
          isOnboardingMode
            ? ONBOARDING_REST_TRANSITION
            : HOT_TAKE_REST_TRANSITION,
        );
        element.style.setProperty(
          'transform',
          'translateX(0px) translateY(0px) rotate(0deg) scale(1)',
        );
      }

      if (isOnboardingMode) {
        clearOnboardingFeedbackStyles({
          element,
          swipeAreaElement: swipeAreaRef.current,
        });
        return;
      }

      clearHotTakeFeedbackStyles(element);
    },
    [isOnboardingMode],
  );

  const queueActiveSwipeFrame = useCallback(
    ({
      nextSwipeDelta,
      nextSkipDelta,
    }: {
      nextSwipeDelta: number;
      nextSkipDelta: number;
    }) => {
      swipeFrameRef.current = {
        swipeDelta: nextSwipeDelta,
        skipDeltaY: nextSkipDelta,
        isHotTake: !isOnboardingMode,
        isLightweight: isLightweightEffects,
      };

      if (swipeFrameRafRef.current !== null) {
        return;
      }

      swipeFrameRafRef.current = requestSwipeAnimationFrame(() => {
        swipeFrameRafRef.current = null;
        const frame = swipeFrameRef.current;
        const element = activeCardRef.current;
        if (!frame || !element || !isDraggingRef.current) {
          return;
        }

        applyActiveSwipeFrame({
          element,
          swipeAreaElement: swipeAreaRef.current,
          swipeDelta: frame.swipeDelta,
          skipDeltaY: frame.skipDeltaY,
          isHotTake: frame.isHotTake,
          isLightweight: frame.isLightweight,
        });
      });
    },
    [isLightweightEffects, isOnboardingMode],
  );

  const finishDrag = useCallback(
    ({ snapToRest }: { snapToRest: boolean }) => {
      cancelQueuedSwipeFrame();
      isDraggingRef.current = false;
      setIsDragging(false);
      clearActiveCardSwipeStyles({ snapToRest });
    },
    [cancelQueuedSwipeFrame, clearActiveCardSwipeStyles],
  );

  useEffect(() => {
    animatingTakeIdRef.current = animatingTakeId;
  }, [animatingTakeId]);

  useEffect(() => {
    if (!isAnimating) {
      cancelQueuedSwipeFrame();
      setSwipeDelta(0);
      swipeDeltaRef.current = 0;
      setSkipDelta(0);
      swipeDeltaYRef.current = 0;
      isDraggingRef.current = false;
      setIsDragging(false);
      clearActiveCardSwipeStyles({ snapToRest: true });
    }
  }, [
    cancelQueuedSwipeFrame,
    clearActiveCardSwipeStyles,
    currentTake?.id,
    isAnimating,
  ]);

  useEffect(() => {
    return () => {
      if (flyTimerRef.current) {
        clearTimeout(flyTimerRef.current);
      }
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
      cancelQueuedSwipeFrame();
    };
  }, [cancelQueuedSwipeFrame]);

  useEffect(() => {
    if (
      !hasOnboardingCards ||
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
  }, [hasOnboardingCards, isModalLoading, currentOnboardingCard?.id]);

  useEffect(() => {
    if (hasOnboardingCards) {
      return;
    }

    abortOnboardingIntro();
    cancelQueuedSwipeFrame();
    clearActiveCardSwipeStyles({ snapToRest: false });

    if (flyTimerRef.current) {
      clearTimeout(flyTimerRef.current);
      flyTimerRef.current = null;
    }
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }

    animatingTakeIdRef.current = null;
    setAnimatingTakeId(null);
    setDismissDurationMs(DISMISS_ANIMATION_MS);
    setIsAnimating(false);
    isDraggingRef.current = false;
    setIsDragging(false);
    setSwipeDelta(0);
    swipeDeltaRef.current = 0;
    setSkipDelta(0);
    swipeDeltaYRef.current = 0;
  }, [
    abortOnboardingIntro,
    cancelQueuedSwipeFrame,
    clearActiveCardSwipeStyles,
    hasOnboardingCards,
  ]);

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

      cancelQueuedSwipeFrame();
      isDraggingRef.current = false;
      clearActiveCardSwipeStyles({ snapToRest: false });

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
        if (hasOnboardingCards && currentOnboardingCard) {
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
      cancelQueuedSwipeFrame,
      clearActiveCardSwipeStyles,
      dismissCurrent,
      hasOnboardingCards,
      onboardingCards,
      updateDismissedCardIds,
    ],
  );

  const handleDismiss = useCallback(
    (direction: 'left' | 'right', source: 'swipe' | 'button' = 'swipe') => {
      const currentItemId = hasOnboardingCards
        ? currentOnboardingCard?.id
        : currentTake?.id;

      if (!currentItemId || isAnimating) {
        return;
      }

      abortOnboardingIntro();

      const isButtonSource = source === 'button';
      const currentSwipeDelta = swipeDeltaRef.current;
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
        hasOnboardingCards ? { onboardingCardId: currentItemId } : undefined,
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
            ? Math.max(currentSwipeDelta, SWIPE_THRESHOLD * 1.25)
            : Math.min(currentSwipeDelta, -SWIPE_THRESHOLD * 1.25);
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
      hasOnboardingCards,
      isAnimating,
      isOnboardingMode,
      startDismissAnimation,
      toggleDownvote,
      toggleUpvote,
      logEvent,
      onSwipeAction,
      abortOnboardingIntro,
    ],
  );

  useEffect(() => {
    if (
      !props.isOpen ||
      !hasOnboardingCards ||
      hasOnboardingContent ||
      isModalLoading ||
      !currentOnboardingCard ||
      isAnimating
    ) {
      return undefined;
    }

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.repeat) {
        return;
      }

      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
        return;
      }

      const { target } = event;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.matches('input, textarea, select, [role="textbox"]'))
      ) {
        return;
      }

      event.preventDefault();
      handleDismiss(event.key === 'ArrowRight' ? 'right' : 'left', 'button');
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [
    currentOnboardingCard,
    handleDismiss,
    hasOnboardingCards,
    hasOnboardingContent,
    isAnimating,
    isModalLoading,
    props.isOpen,
  ]);

  const handleSkip = useCallback(
    (source: 'swipe' | 'button' = 'button') => {
      const currentItemId = hasOnboardingCards
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
      hasOnboardingCards,
      isAnimating,
      isOnboardingMode,
      startDismissAnimation,
      logEvent,
      onSwipeAction,
      abortOnboardingIntro,
    ],
  );

  const currentCardId = hasOnboardingCards
    ? currentOnboardingCard?.id
    : currentTake?.id;

  const handleAddOwnHotTakeClick = useCallback(
    (e: React.MouseEvent) => {
      onRequestClose?.(e);
    },
    [onRequestClose],
  );

  const isCurrentTakeAnimating =
    !!currentCardId && isAnimating && animatingTakeId === currentCardId;
  const cardSwipeDelta =
    isAnimating && !isCurrentTakeAnimating ? 0 : swipeDelta;
  const cardSkipDelta = isAnimating && !isCurrentTakeAnimating ? 0 : skipDelta;
  const combinedOnboardingSwipeX =
    hasOnboardingCards && !isDragging && !isCurrentTakeAnimating
      ? cardSwipeDelta + onboardingIntroDelta
      : cardSwipeDelta;
  const onboardingIntroPlaying =
    hasOnboardingCards &&
    !isDragging &&
    !isCurrentTakeAnimating &&
    onboardingIntroDelta !== 0;

  const handleSwiped = (direction: 'left' | 'right') => {
    const currentSwipeDelta = swipeDeltaRef.current;
    finishDrag({ snapToRest: false });
    setSkipDelta(0);
    if (Math.abs(currentSwipeDelta) > SWIPE_THRESHOLD) {
      handleDismiss(direction, 'swipe');
    } else {
      clearActiveCardSwipeStyles({ snapToRest: true });
      setSwipeDelta(0);
      swipeDeltaRef.current = 0;
      swipeDeltaYRef.current = 0;
    }
  };

  const handlers = useSwipeable({
    onSwiping: (e) => {
      if (isAnimating) {
        return;
      }

      if (isOnboardingMode && e.event.cancelable) {
        e.event.preventDefault();
      }

      if (!isDraggingRef.current) {
        abortOnboardingIntro();
        isDraggingRef.current = true;
        setIsDragging(true);
      }

      const nextSkipDelta =
        !isOnboardingMode &&
        e.deltaY < 0 &&
        Math.abs(e.deltaY) > Math.abs(e.deltaX)
          ? getElasticDelta(e.deltaY)
          : 0;

      swipeDeltaRef.current = e.deltaX;
      swipeDeltaYRef.current = e.deltaY;
      queueActiveSwipeFrame({
        nextSwipeDelta: e.deltaX,
        nextSkipDelta,
      });
    },
    onSwipedLeft: () => handleSwiped('left'),
    onSwipedRight: () => handleSwiped('right'),
    onSwipedUp: () => {
      if (isOnboardingMode) {
        finishDrag({ snapToRest: true });
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
        const currentSkipDelta = getElasticDelta(swipeDeltaYRef.current);
        finishDrag({ snapToRest: false });
        setSwipeDelta(0);
        swipeDeltaRef.current = 0;
        setSkipDelta(currentSkipDelta);
        handleSkip('swipe');
      } else {
        finishDrag({ snapToRest: true });
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
  const { ref: swipeableRef, ...swipeHandlers } = handlers;
  const setSwipeAreaRef = useCallback(
    (element: HTMLDivElement | null) => {
      swipeAreaRef.current = element;
      swipeableRef(element);
    },
    [swipeableRef],
  );

  const cardSwipeArea = (
    <div
      {...swipeHandlers}
      ref={setSwipeAreaRef}
      data-testid="hot-takes-swipe-area"
      className={classNames(
        'relative touch-none select-none self-center',
        isOnboardingMode
          ? 'mt-2 w-full max-w-[20rem]'
          : 'mt-4 w-[calc(100%-2rem)]',
      )}
      style={
        {
          '--onboarding-swipe-left-intensity': 0,
          '--onboarding-swipe-right-intensity': 0,
          '--onboarding-swipe-left-badge-intensity': 0,
          '--onboarding-swipe-right-badge-intensity': 0,
          height: swipeAreaHeight,
        } as CSSPropertiesWithVars
      }
    >
      {isOnboardingMode ? (
        <>
          <OnboardingBehindParticlesKeyframes />
          <OnboardingSwipeEdgeHalos
            deltaX={combinedOnboardingSwipeX}
            isDragging={isDragging}
            useLiveIntensity={isDragging && !isCurrentTakeAnimating}
          />
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
              ref={activeCardRef}
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
          <OnboardingCardBehindParticles
            lightweight={isLightweightEffects}
            reducedMotion={prefersReducedMotion}
          />
        </>
      ) : (
        <>
          <HotTakeEffectKeyframes />
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
              isLightweightEffects={isLightweightEffects}
              prefersReducedMotion={prefersReducedMotion}
            />
          )}
          {currentTake && (
            <HotTakeCard
              ref={activeCardRef}
              key={currentTake.id}
              hotTake={currentTake}
              isTop
              offset={0}
              swipeDelta={cardSwipeDelta}
              skipDeltaY={cardSkipDelta}
              isDismissAnimating={isCurrentTakeAnimating}
              isDragging={isDragging}
              dismissDurationMs={dismissDurationMs}
              isLightweightEffects={isLightweightEffects}
              prefersReducedMotion={prefersReducedMotion}
            />
          )}
        </>
      )}
    </div>
  );
  const showOnboardingSideActions = onboardingActionLayout === 'sides';
  const onboardingSwipeActions = showOnboardingSideActions ? (
    <div className="flex flex-col items-center gap-3 tablet:grid tablet:grid-cols-[minmax(3.5rem,1fr)_minmax(0,20rem)_minmax(3.5rem,1fr)] tablet:items-center tablet:gap-3">
      <div className="hidden justify-center tablet:flex">
        <OnboardingSwipeHintButton
          deltaX={combinedOnboardingSwipeX}
          direction="left"
          disabled={isAnimating}
          onClick={() => handleDismiss('left', 'button')}
        />
      </div>
      <div className="flex justify-center px-4 tablet:px-0">
        {cardSwipeArea}
      </div>
      <div className="hidden justify-center tablet:flex">
        <OnboardingSwipeHintButton
          deltaX={combinedOnboardingSwipeX}
          direction="right"
          disabled={isAnimating}
          onClick={() => handleDismiss('right', 'button')}
        />
      </div>
      <div className="flex justify-center px-4 tablet:hidden">
        <OnboardingSwipeHintIcons
          deltaX={combinedOnboardingSwipeX}
          disabled={isAnimating}
          onInteresting={() => handleDismiss('right', 'button')}
          onNotInteresting={() => handleDismiss('left', 'button')}
        />
      </div>
    </div>
  ) : (
    <>
      <div className="flex justify-center px-4">{cardSwipeArea}</div>
      <div className="flex justify-center px-4">
        <OnboardingSwipeHintIcons
          deltaX={combinedOnboardingSwipeX}
          disabled={isAnimating}
          onInteresting={() => handleDismiss('right', 'button')}
          onNotInteresting={() => handleDismiss('left', 'button')}
        />
      </div>
    </>
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
            ? classNames(
                'min-h-0 flex-1 overflow-y-auto overflow-x-hidden',
                bodyClassName === undefined && 'bg-background-default',
              )
            : 'min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-overlay-quaternary-onion',
          bodyClassName,
        )}
      >
        {headerSlot ? (
          <div className="hidden tablet:block">{headerSlot}</div>
        ) : null}
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
          <EmptyState
            onAddOwnHotTakeClick={handleAddOwnHotTakeClick}
            username={user?.username}
          />
        )}

        {!isModalLoading && !isModalEmpty && isOnboardingMode && (
          <>
            <OnboardingScreenTransitionKeyframes />
            <div className="mx-auto flex h-full min-h-0 w-full max-w-[46rem] flex-1 flex-col gap-6 px-4 pb-8 pt-4 tablet:min-h-0 tablet:justify-center tablet:gap-0 tablet:px-6 tablet:pb-8 tablet:pt-4">
              {headerSlot ? (
                <div className="shrink-0 tablet:hidden">{headerSlot}</div>
              ) : null}
              <div
                key={hasOnboardingContent ? 'tags-box' : 'swipe-box'}
                className={classNames(
                  'onboarding-screen-enter w-full rounded-[2rem] bg-background-default shadow-[0_24px_90px_-48px_rgba(0,0,0,0.58)]',
                  'flex h-full min-h-0 flex-1 flex-col tablet:block tablet:h-auto tablet:flex-none',
                  hasOnboardingContent ? 'overflow-visible' : 'overflow-hidden',
                )}
              >
                <div className="flex h-full min-h-0 w-full flex-1 flex-col items-stretch justify-between gap-8 px-5 pb-8 pt-5 tablet:hidden">
                  {topSlot ? <div className="shrink-0">{topSlot}</div> : null}
                  {progressSlot ? (
                    <div className="shrink-0">{progressSlot}</div>
                  ) : null}
                  {hasOnboardingContent ? (
                    <div className="flex min-h-0 flex-1 flex-col">
                      {onboardingContent}
                    </div>
                  ) : (
                    <div className="shrink-0">{onboardingSwipeActions}</div>
                  )}
                  {bottomSlot ? (
                    <div className="shrink-0">{bottomSlot}</div>
                  ) : null}
                </div>
                <div className="hidden min-h-0 w-full flex-col items-stretch gap-5 p-5 tablet:flex tablet:gap-6 tablet:p-7">
                  {topSlot}
                  {hasOnboardingContent
                    ? onboardingContent
                    : onboardingSwipeActions}
                  {bottomSlot}
                </div>
              </div>
            </div>
            {onboardingFooterSlot ? (
              <div className="pointer-events-none absolute inset-x-0 bottom-6 w-full tablet:bottom-8">
                {onboardingFooterSlot}
              </div>
            ) : null}
          </>
        )}

        {!isModalLoading &&
          !isModalEmpty &&
          !isOnboardingMode &&
          currentCardId && (
            <>
              {topSlot}
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
                    href={getAddHotTakeProfileUrl(user.username)}
                    className="w-full"
                    onClick={handleAddOwnHotTakeClick}
                  >
                    Add your own hot take
                  </Button>
                </div>
              )}
            </>
          )}
      </Modal.Body>
    </Modal>
  );
};

export default HotAndColdModal;
