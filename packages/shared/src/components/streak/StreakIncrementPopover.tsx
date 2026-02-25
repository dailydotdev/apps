import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { CoreIcon, ReadingStreakIcon } from '../icons';
import { IconSize } from '../Icon';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import {
  getCurrentTier,
  getNextMilestone,
  RewardType,
} from '../../lib/streakMilestones';
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
  const activeMilestone = nextMilestone;
  const activeRangeStart = currentTier.day;
  const activeRangeEnd = nextMilestone?.day ?? currentTier.day;
  const activeRangeDelta = Math.max(activeRangeEnd - activeRangeStart, 1);
  const clampedFromStreak = Math.max(
    activeRangeStart,
    Math.min(fromStreak, activeRangeEnd),
  );
  const clampedToStreak = Math.max(
    activeRangeStart,
    Math.min(toStreak, activeRangeEnd),
  );

  const isFilling = phase === 'filling' || phase === 'complete';
  const fromProgress =
    nextMilestone === null
      ? 100
      : ((clampedFromStreak - activeRangeStart) / activeRangeDelta) * 100;
  const toProgress =
    nextMilestone === null
      ? 100
      : ((clampedToStreak - activeRangeStart) / activeRangeDelta) * 100;
  const previewProgress = Math.min(fromProgress + 8, 100);
  const progress = isProgressAnimationStarted
    ? isFilling
      ? Math.max(toProgress, previewProgress)
      : fromProgress
    : fromProgress;
  const rewardTypeIcon: Record<RewardType, ReactElement | string> = {
    [RewardType.Cores]: (<CoreIcon size={IconSize.XSmall} className="inline" />),
    [RewardType.Cosmetic]: '✨',
    [RewardType.Perk]: '⚡',
  };

  return (
    <div
      className={classNames(
        'absolute left-1/2 top-full z-max mt-2 w-56 -translate-x-1/2 rounded-16 border border-border-subtlest-tertiary bg-background-default p-3 shadow-2 transition-all',
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
          {activeRangeStart}
        </span>

        <div className="h-1.5 flex-1 overflow-hidden rounded-4 bg-surface-float">
          <div
            className="h-full bg-accent-bacon-default"
            style={{
              width: `${progress}%`,
              transition: isFilling && isProgressAnimationStarted
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
          {activeRangeEnd}
        </span>
      </div>

      {activeMilestone && (
        <div className="mt-2 rounded-12 bg-accent-pepper-subtlest px-2 py-1.5">
          <div className="flex items-center gap-2">
            <img
              src={MILESTONE_ICON_URLS[activeMilestone.tier]}
              alt={activeMilestone.label}
              className="size-8 object-contain grayscale"
            />
            <Typography bold type={TypographyType.Subhead}>
              {activeMilestone.label}
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              className="rounded-6 bg-accent-bacon-default px-1.5 py-0.5 font-bold text-white"
            >
              Active
            </Typography>
          </div>
          <div className="mt-0.5 flex flex-col gap-0.5">
            {activeMilestone.rewards.map((reward) => (
              <Typography
                key={reward.description}
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
              >
                {rewardTypeIcon[reward.type]} {reward.description}
              </Typography>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
