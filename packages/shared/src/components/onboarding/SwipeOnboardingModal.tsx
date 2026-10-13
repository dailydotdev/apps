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
import type { ModalProps } from '../modals/common/Modal';
import { Modal } from '../modals/common/Modal';
import { ModalSize } from '../modals/common/types';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { IconSize } from '../Icon';
import { MiniCloseIcon, VIcon } from '../icons';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../typography/Typography';
import { Loader } from '../Loader';
import LogoIcon from '../../svg/LogoIcon';

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
/** Title3 × 3 lines (typo-title3 line-height 1.625rem in tailwind/typography.ts). */
const ONBOARDING_CARD_TITLE_MIN_HEIGHT = '4.875rem';
/** Fixed onboarding post card (source, title, and topic tags). */
const ONBOARDING_POST_CARD_HEIGHT = 'clamp(13rem, 28dvh, 16rem)';
/** Swipe stack area: card height plus back-card vertical offset (8px). */
const ONBOARDING_SWIPE_AREA_HEIGHT = `calc(${ONBOARDING_POST_CARD_HEIGHT} + 0.5rem)`;
const ONBOARDING_SWIPE_FADE_DISTANCE = SWIPE_THRESHOLD * 4;

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

const OnboardingSwipeEdgeHalos = ({
  deltaX,
  isDragging,
}: {
  deltaX: number;
  isDragging: boolean;
}): ReactElement | null => {
  if (!isDragging) {
    return null;
  }

  const intensity = Math.min(
    Math.max(Math.abs(deltaX) / SWIPE_THRESHOLD, 0.18),
    1,
  );
  const activeDirection = deltaX >= 0 ? 'right' : 'left';

  const renderHalo = (direction: 'left' | 'right'): ReactElement => {
    const isRight = direction === 'right';
    const accentColor = isRight
      ? 'var(--theme-accent-avocado-default)'
      : 'var(--theme-accent-bacon-default)';
    const strength =
      direction === activeDirection ? intensity : intensity * 0.35;

    return (
      <span
        key={direction}
        aria-hidden
        className="pointer-events-none absolute inset-y-6 z-[7] w-8 rounded-full blur-lg transition-opacity duration-150"
        style={{
          [direction]: 0,
          opacity: strength * 0.48,
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

const OnboardingPostCard = ({
  card,
  isTop,
  offset,
  swipeDelta,
  isDismissAnimating,
  isDragging,
  dismissDurationMs,
  useInstantSwipeTransform = false,
}: {
  card: OnboardingSwipeCard;
  isTop: boolean;
  offset: number;
  swipeDelta: number;
  isDismissAnimating: boolean;
  isDragging: boolean;
  dismissDurationMs: number;
  useInstantSwipeTransform?: boolean;
}): ReactElement => {
  const sourceName = card.source?.name || 'daily.dev';
  const sourceImage = card.source?.image;
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
  const dismissProgress =
    isTop && isDismissAnimating
      ? Math.min(Math.abs(swipeDelta) / DISMISS_FLY_DISTANCE, 1)
      : 0;
  const swipeFadeProgress =
    isTop && (isDragging || isDismissAnimating)
      ? Math.min(Math.abs(swipeDelta) / ONBOARDING_SWIPE_FADE_DISTANCE, 1)
      : 0;
  const scale = isTop ? 1 - dismissProgress * 0.06 : stackScale;
  const dismissLift = isTop ? dismissProgress * -22 : 0;
  const translateYWithOutro = translateY + dismissLift;

  let transition =
    'transform 0.3s ease, opacity 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease';
  if (isTop) {
    if (isDismissAnimating) {
      transition = `transform ${dismissDurationMs}ms cubic-bezier(0.16, 0.86, 0.22, 1), opacity ${dismissDurationMs}ms ease-out, filter ${dismissDurationMs}ms ease-out`;
    } else if (isDragging || useInstantSwipeTransform) {
      transition = 'none';
    } else {
      transition = 'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1)';
    }
  }

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
        opacity: isTop ? 1 - swipeFadeProgress : 1,
        filter:
          isTop && isDismissAnimating
            ? `blur(${dismissProgress * 1.8}px)`
            : undefined,
        boxShadow: isTop
          ? '0 1.25rem 2.75rem -0.75rem rgba(0, 0, 0, 0.45)'
          : '0 0.75rem 1.75rem -0.75rem rgba(0, 0, 0, 0.32)',
      }}
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
          {swipeDirection ? (
            <div
              className={classNames(
                'shrink-0 rounded-10 px-3 py-1 font-bold text-white typo-callout',
                swipeDirection === 'right'
                  ? 'bg-accent-avocado-default'
                  : 'bg-accent-bacon-default',
              )}
              style={{ opacity: swipeIntensity }}
            >
              {swipeDirection === 'right' ? 'Good' : 'Meh'}
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

type SwipeActionDirection = 'left' | 'right';

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

interface SwipeOnboardingModalProps extends ModalProps {
  bodyClassName?: string;
  headerSlot?: ReactNode;
  topSlot?: ReactNode;
  progressSlot?: ReactNode;
  bottomSlot?: ReactNode;
  onboardingFooterSlot?: ReactNode;
  onboardingContent?: ReactNode;
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

const SwipeOnboardingModal = ({
  onRequestClose,
  bodyClassName,
  headerSlot,
  topSlot,
  progressSlot,
  bottomSlot,
  onboardingFooterSlot,
  onboardingContent,
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
}: SwipeOnboardingModalProps): ReactElement => {
  const [swipeDelta, setSwipeDelta] = useState(0);
  const swipeDeltaRef = useRef(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dismissDurationMs, setDismissDurationMs] =
    useState(DISMISS_ANIMATION_MS);
  const [animatingCardId, setAnimatingCardId] = useState<string | null>(null);
  const animatingCardIdRef = useRef<string | null>(null);
  const flyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const swipeStartedOnButtonRef = useRef(false);
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
  const availableOnboardingCards = useMemo(
    () =>
      (onboardingCards ?? []).filter((card) => !dismissedCardIds.has(card.id)),
    [dismissedCardIds, onboardingCards],
  );
  const currentOnboardingCard = availableOnboardingCards[0];
  const nextOnboardingCard = availableOnboardingCards[1];
  const isModalLoading = onboardingCardsLoading;
  const isModalEmpty =
    !isModalLoading && !hasOnboardingContent && !currentOnboardingCard;

  useEffect(() => {
    animatingCardIdRef.current = animatingCardId;
  }, [animatingCardId]);

  useEffect(() => {
    if (!isAnimating) {
      setSwipeDelta(0);
      swipeDeltaRef.current = 0;
      setIsDragging(false);
    }
  }, [isAnimating]);

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

    if (flyTimerRef.current) {
      clearTimeout(flyTimerRef.current);
      flyTimerRef.current = null;
    }
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }

    animatingCardIdRef.current = null;
    setAnimatingCardId(null);
    setDismissDurationMs(DISMISS_ANIMATION_MS);
    setIsAnimating(false);
    setIsDragging(false);
    setSwipeDelta(0);
    swipeDeltaRef.current = 0;
  }, [hasOnboardingCards, abortOnboardingIntro]);

  const startDismissAnimation = useCallback(
    ({
      cardId,
      durationMs,
      flyDelayMs,
      onFly,
    }: {
      cardId: string;
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

      animatingCardIdRef.current = cardId;
      setAnimatingCardId(cardId);
      setDismissDurationMs(durationMs);
      setIsAnimating(true);
      setIsDragging(false);

      flyTimerRef.current = setTimeout(() => {
        if (animatingCardIdRef.current !== cardId) {
          flyTimerRef.current = null;
          return;
        }
        onFly();
        flyTimerRef.current = null;
      }, flyDelayMs);

      dismissTimerRef.current = setTimeout(() => {
        if (animatingCardIdRef.current !== cardId) {
          dismissTimerRef.current = null;
          return;
        }
        setSwipeDelta(0);
        swipeDeltaRef.current = 0;
        animatingCardIdRef.current = null;
        setAnimatingCardId(null);
        if (currentOnboardingCard) {
          updateDismissedCardIds((prev) => {
            const next = new Set(prev);
            next.add(currentOnboardingCard.id);
            const deck = onboardingCards ?? [];
            if (deck.length > 0 && deck.every((c) => next.has(c.id))) {
              return new Set<string>();
            }
            return next;
          });
        }
        setIsAnimating(false);
        dismissTimerRef.current = null;
      }, durationMs);
    },
    [currentOnboardingCard, onboardingCards, updateDismissedCardIds],
  );

  const handleDismiss = useCallback(
    (direction: SwipeActionDirection, source: 'swipe' | 'button' = 'swipe') => {
      const currentItemId = currentOnboardingCard?.id;

      if (!currentItemId || isAnimating) {
        return;
      }

      abortOnboardingIntro();

      const isButtonSource = source === 'button';
      const durationMs = isButtonSource
        ? BUTTON_DISMISS_ANIMATION_MS
        : DISMISS_ANIMATION_MS;

      onSwipeAction?.(direction, { onboardingCardId: currentItemId });

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
        cardId: currentItemId,
        durationMs,
        flyDelayMs: isButtonSource ? BUTTON_FLY_KICK_DELAY_MS : 0,
        onFly: () => setSwipeDelta(flyDistance),
      });
    },
    [
      currentOnboardingCard,
      isAnimating,
      startDismissAnimation,
      onSwipeAction,
      swipeDelta,
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

  const currentCardId = currentOnboardingCard?.id;
  const isCurrentCardAnimating =
    !!currentCardId && isAnimating && animatingCardId === currentCardId;
  const cardSwipeDelta =
    isAnimating && !isCurrentCardAnimating ? 0 : swipeDelta;
  const combinedOnboardingSwipeX =
    hasOnboardingCards && !isDragging && !isCurrentCardAnimating
      ? cardSwipeDelta + onboardingIntroDelta
      : cardSwipeDelta;
  const onboardingIntroPlaying =
    hasOnboardingCards &&
    !isDragging &&
    !isCurrentCardAnimating &&
    onboardingIntroDelta !== 0;

  const handleSwiped = (direction: SwipeActionDirection) => {
    setIsDragging(false);
    if (Math.abs(swipeDeltaRef.current) > SWIPE_THRESHOLD) {
      handleDismiss(direction, 'swipe');
    } else {
      setSwipeDelta(0);
      swipeDeltaRef.current = 0;
    }
  };

  const handlers = useSwipeable({
    onTouchStartOrOnMouseDown: ({ event }) => {
      swipeStartedOnButtonRef.current =
        event.target instanceof Element && !!event.target.closest('button');
    },
    onSwiping: (e) => {
      if (!isAnimating && !swipeStartedOnButtonRef.current) {
        if (e.event.cancelable) {
          e.event.preventDefault();
        }
        abortOnboardingIntro();
        setIsDragging(true);
        setSwipeDelta(e.deltaX);
        swipeDeltaRef.current = e.deltaX;
      }
    },
    onSwipedLeft: () => handleSwiped('left'),
    onSwipedRight: () => handleSwiped('right'),
    onSwipedUp: () => {
      setIsDragging(false);
      setSwipeDelta(0);
      swipeDeltaRef.current = 0;
    },
    trackMouse: true,
    preventScrollOnSwipe: true,
    touchEventOptions: { passive: false },
  });

  const cardSwipeArea = (
    <div
      {...handlers}
      className="relative mt-2 w-full max-w-[20rem] touch-none select-none self-center"
      style={{ height: ONBOARDING_SWIPE_AREA_HEIGHT }}
    >
      <OnboardingSwipeEdgeHalos
        deltaX={combinedOnboardingSwipeX}
        isDragging={isDragging}
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
          key={currentOnboardingCard.id}
          card={currentOnboardingCard}
          isTop
          offset={0}
          swipeDelta={combinedOnboardingSwipeX}
          isDismissAnimating={isCurrentCardAnimating}
          isDragging={isDragging}
          dismissDurationMs={dismissDurationMs}
          useInstantSwipeTransform={onboardingIntroPlaying}
        />
      )}
      <OnboardingCardBehindParticles />
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
      className={classNames('tablet:!max-h-[calc(100vh-2rem)]', className)}
      onRequestClose={onRequestClose}
      size={ModalSize.Small}
    >
      <Modal.Body
        className={classNames(
          'min-h-0 flex-1 overflow-y-auto overflow-x-hidden !p-0',
          bodyClassName === undefined && 'bg-background-default',
          bodyClassName,
        )}
      >
        {headerSlot ? (
          <div className="hidden tablet:block">{headerSlot}</div>
        ) : null}
        {isModalLoading && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6">
            <Loader />
            <Typography
              type={TypographyType.Body}
              color={TypographyColor.Tertiary}
            >
              Loading stories…
            </Typography>
          </div>
        )}

        {!isModalLoading && isModalEmpty && (
          <OnboardingFeedEmptyState
            isRefetching={onboardingFeedRefetching}
            onRetry={onOnboardingFeedRetry}
          />
        )}

        {!isModalLoading && !isModalEmpty && (
          <>
            {/* eslint-disable-next-line react/no-unknown-property -- style tag for scoped onboarding transition */}
            <style>{ONBOARDING_SCREEN_TRANSITION_KEYFRAMES}</style>
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
                <div className="flex h-full min-h-0 w-full flex-1 flex-col items-stretch justify-between gap-8 px-5 pt-5 pb-safe-or-8 tablet:hidden">
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
      </Modal.Body>
    </Modal>
  );
};

export default SwipeOnboardingModal;
