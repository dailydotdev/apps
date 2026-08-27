import type { ReactElement } from 'react';
import React, { createContext, useContext } from 'react';
import classNames from 'classnames';
import type { FunnelPosition } from '../types/funnel';
import { useOnboardingChrome } from './useOnboardingChrome';

export interface FunnelProgressValue {
  chapters: { steps: number }[];
  position: FunnelPosition;
  /** True only inside `/onboarding`; shared steps read it to opt in. */
  isOnboarding?: boolean;
}

/** `null` means no funnel around me — a step rendered alone shows no dots. */
export const FunnelProgressContext = createContext<FunnelProgressValue | null>(
  null,
);

export const useIsOnboardingFunnel = (): boolean =>
  !!useContext(FunnelProgressContext)?.isOnboarding;

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
              // A pill, so position is not carried by colour alone.
              isCurrent ? 'w-4' : 'w-1.5',
              // `text-primary` flips with the page; a literal white would not.
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
