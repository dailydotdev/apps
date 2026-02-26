import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { ReadingStreakIcon } from '../icons';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { getCurrentTier, getNextMilestone } from '../../lib/streakMilestones';
import { MILESTONE_ICON_URLS } from './popup/icons/milestoneIcons';

type PopoverPhase = 'enter' | 'filling' | 'complete' | 'fading' | 'exit';

interface StreakIncrementPopoverProps {
  fromStreak: number;
  toStreak: number;
}

export function StreakIncrementPopover({
  fromStreak,
  toStreak,
}: StreakIncrementPopoverProps): ReactElement | null {
  const [phase, setPhase] = useState<PopoverPhase>('enter');
  const [isProgressAnimationStarted, setIsProgressAnimationStarted] =
    useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('filling'), 0),
      setTimeout(() => setPhase('complete'), 3000),
      setTimeout(() => setPhase('fading'), 5600),
      setTimeout(() => setPhase('exit'), 6600),
    ];
    const progressAnimationTimer = setTimeout(
      () => setIsProgressAnimationStarted(true),
      500,
    );

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(progressAnimationTimer);
    };
  }, []);

  if (phase === 'exit') {
    return null;
  }

  const currentTier = getCurrentTier(toStreak);
  const nextMilestone = getNextMilestone(toStreak);
  const activeMilestone = nextMilestone ?? currentTier;
  const hasNextMilestone = Boolean(nextMilestone);
  const transitionStartDay = Math.max(fromStreak, 0);
  const transitionEndDay = Math.max(toStreak, transitionStartDay + 1);
  const totalDaysLeft = nextMilestone
    ? Math.max(nextMilestone.day - toStreak, 0)
    : 0;

  const isFilling = phase === 'filling' || phase === 'complete';
  const progress = isProgressAnimationStarted ? 100 : 0;
  return (
    <div
      className={classNames(
        'absolute left-1/2 top-full z-max mt-2 w-56 -translate-x-1/2 rounded-16 border border-border-subtlest-tertiary bg-background-default p-3 shadow-2 transition-all tablet:left-auto tablet:right-0 tablet:translate-x-0 laptop:left-1/2 laptop:right-auto laptop:-translate-x-1/2',
        phase === 'enter' && 'scale-95 opacity-0 duration-300',
        phase === 'fading' && 'scale-95 opacity-0 duration-500',
        phase !== 'enter' && phase !== 'fading' && 'scale-100 opacity-100 duration-300',
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ReadingStreakIcon secondary className="text-accent-bacon-default" />
          <Typography bold type={TypographyType.Callout}>
            Day {toStreak}!
          </Typography>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={classNames(
            'font-bold tabular-nums typo-body transition-all duration-500',
            isFilling ? 'text-text-quaternary' : 'text-text-primary',
          )}
        >
          {transitionStartDay}
        </span>

        <div className="h-1.5 flex-1 overflow-hidden rounded-4 bg-surface-float">
          <div
            className="h-full bg-accent-bacon-default"
            style={{
              width: `${progress}%`,
              transition: isProgressAnimationStarted
                ? 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                : 'none',
            }}
          />
        </div>

        <span
          className={classNames(
            'font-bold tabular-nums typo-body transition-all duration-500',
            isFilling ? 'text-text-primary' : 'text-text-quaternary',
          )}
        >
          {transitionEndDay}
        </span>
      </div>

      {activeMilestone && (
        <div className="mt-2 rounded-12 bg-accent-pepper-subtlest px-2 py-1.5">
          <div className="flex items-center gap-2">
            <img
              src={MILESTONE_ICON_URLS[activeMilestone.tier]}
              alt={activeMilestone.label}
              className={classNames(
                'size-8 object-contain',
                hasNextMilestone && 'grayscale',
              )}
            />
            <Typography bold type={TypographyType.Subhead}>
              {activeMilestone.label}
            </Typography>
            {hasNextMilestone && (
              <Typography
                type={TypographyType.Footnote}
                className="rounded-6 bg-accent-bacon-default px-1.5 py-0.5 font-bold text-white"
              >
                Active
              </Typography>
            )}
          </div>
          {hasNextMilestone && (
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Quaternary}
              className="mt-1"
            >
              {totalDaysLeft === 1
                ? '1 total day left'
                : `${totalDaysLeft} total days left`}
            </Typography>
          )}
        </div>
      )}

    </div>
  );
}
