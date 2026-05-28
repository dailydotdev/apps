import type { CSSProperties, ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import {
  getSwipeOnboardingBarProgress,
  SWIPE_ONBOARDING_REFINE_TARGET,
} from '../../lib/swipeOnboardingGuidance';

/** Keep in sync with .swipe-onboarding-progress-label in swipe-onboarding.css */
const PROGRESS_LABEL_TRANSITION_MS = 340;

export type SwipeOnboardingProgressHeaderProps = {
  /** Swipe count and/or tag selections — same scale as onboarding swipes (0–40+). */
  progressCount: number;
};

function getProgressGradientStyle(fillPercent: number): CSSProperties {
  const gradientProgress = Math.max(fillPercent, 0.01);

  return {
    backgroundImage: `linear-gradient(
      90deg,
      var(--theme-accent-cabbage-default) 0%,
      var(--theme-accent-avocado-default) ${gradientProgress * 0.22}%,
      var(--theme-accent-cheese-default) ${gradientProgress * 0.44}%,
      var(--theme-accent-cabbage-default) ${gradientProgress * 0.66}%,
      var(--theme-accent-avocado-default) ${gradientProgress * 0.88}%,
      var(--theme-accent-cheese-default) ${gradientProgress}%,
      var(--theme-text-quaternary) ${gradientProgress}%,
      var(--theme-text-quaternary) 100%
    )`,
  };
}

function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = (): void => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    updatePreference();
    mediaQuery.addEventListener('change', updatePreference);

    return () => mediaQuery.removeEventListener('change', updatePreference);
  }, []);

  return prefersReducedMotion;
}

function useAnimatedProgressPercent(
  targetPercent: number,
  prefersReducedMotion: boolean,
): number {
  const [displayPercent, setDisplayPercent] = useState(targetPercent);
  const displayPercentRef = useRef(displayPercent);
  displayPercentRef.current = displayPercent;

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayPercent(targetPercent);
      return undefined;
    }

    const startPercent = displayPercentRef.current;
    if (startPercent === targetPercent) {
      return undefined;
    }

    let animationFrame = 0;
    const startTime = performance.now();

    const tick = (now: number): void => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / PROGRESS_LABEL_TRANSITION_MS, 1);
      const eased = 1 - (1 - progress) ** 3;
      const nextPercent = Math.round(
        startPercent + (targetPercent - startPercent) * eased,
      );

      setDisplayPercent(nextPercent);

      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(tick);
      }
    };

    animationFrame = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(animationFrame);
  }, [prefersReducedMotion, targetPercent]);

  return displayPercent;
}

const progressLabelClassName =
  'col-start-1 row-start-1 inline-block max-w-full whitespace-nowrap bg-clip-text text-[min(2rem,7vw)] font-black leading-[1.05] tracking-[-0.05em] text-transparent tablet:text-[2.25rem]';

export function SwipeOnboardingProgressHeader({
  progressCount,
}: SwipeOnboardingProgressHeaderProps): ReactElement {
  const progress = getSwipeOnboardingBarProgress(progressCount);
  const progressValue = Math.min(progressCount, SWIPE_ONBOARDING_REFINE_TARGET);
  const targetPercent = Math.round(progress);
  const isComplete = progressValue >= SWIPE_ONBOARDING_REFINE_TARGET;
  const prefersReducedMotion = usePrefersReducedMotion();
  const displayPercent = useAnimatedProgressPercent(
    targetPercent,
    prefersReducedMotion,
  );
  const progressAnnouncement = isComplete
    ? '100% complete'
    : `${displayPercent}% to complete`;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none grid min-w-0 select-none place-items-center overflow-visible text-center"
    >
      <span className="sr-only">{progressAnnouncement}</span>
      <p
        aria-hidden={isComplete}
        className={classNames(
          progressLabelClassName,
          'swipe-onboarding-progress-label',
          isComplete ? 'opacity-0' : 'opacity-100',
        )}
        style={getProgressGradientStyle(displayPercent)}
      >
        {displayPercent}% to complete
      </p>
      <p
        aria-hidden={!isComplete}
        className={classNames(
          progressLabelClassName,
          'swipe-onboarding-progress-label',
          isComplete ? 'opacity-100' : 'opacity-0',
        )}
        style={getProgressGradientStyle(100)}
      >
        100% complete
      </p>
    </div>
  );
}
