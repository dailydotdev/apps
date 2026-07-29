import type { ReactElement } from 'react';
import React, { createContext, useContext } from 'react';
import classNames from 'classnames';
import type { FunnelPosition } from '../types/funnel';
import { useOnboardingChrome } from './useOnboardingChrome';

export interface FunnelProgressValue {
  chapters: { steps: number }[];
  position: FunnelPosition;
  /**
   * True only inside the post-signup onboarding funnel (`/onboarding`). Steps
   * shared with the paid funnel (`/helloworld`) read this to opt into the
   * onboarding treatment — docked glass CTA, shared headline, 440px rail —
   * without changing how they look in the paid flow.
   */
  isOnboarding?: boolean;
}

/**
 * The stepper owns the funnel's position, but the dots live at the bottom of
 * the docked CTA — several layers down, inside components that receive only
 * their own step. The default `null` means "no funnel around me", so a step
 * rendered on its own (tests, Storybook) simply shows no dots.
 */
export const FunnelProgressContext = createContext<FunnelProgressValue | null>(
  null,
);

export const useIsOnboardingFunnel = (): boolean =>
  !!useContext(FunnelProgressContext)?.isOnboarding;

/**
 * One dot per step of the current chapter, filled up to the step the user is
 * on — how far through the flow they are, and how much is left.
 *
 * Part of the same experiment arm as the edge aura (see `useOnboardingChrome`),
 * so the control funnel shows the CTA with nothing under it.
 */
export function FunnelStepDots({
  className,
}: {
  className?: string;
}): ReactElement | null {
  const progress = useContext(FunnelProgressContext);
  const { hasDots } = useOnboardingChrome(progress?.isOnboarding);
  const total = progress?.chapters?.[progress.position.chapter]?.steps ?? 0;

  // A single dot communicates nothing.
  if (!progress || !hasDots || total < 2) {
    return null;
  }

  const { step: currentIndex } = progress.position;

  return (
    <div
      aria-hidden
      className={classNames(
        'flex items-center justify-center gap-1.5',
        className,
      )}
      data-testid="funnel-step-dots"
    >
      {Array.from({ length: total }, (_, index) => {
        const isCurrent = index === currentIndex;
        const isVisited = index < currentIndex;

        return (
          <span
            key={index}
            className={classNames(
              'h-1.5 rounded-50 transition-all duration-200 ease-in-out',
              // The current step reads as a pill so the position is legible at
              // a glance without colour alone carrying it.
              isCurrent ? 'w-4' : 'w-1.5',
              // `text-primary` rather than a literal white: it is white on the
              // dark theme and flips with the page, so the dots stay legible
              // against the scrim in both.
              isCurrent || isVisited
                ? 'bg-text-primary'
                : 'bg-border-subtlest-tertiary',
            )}
          />
        );
      })}
    </div>
  );
}
