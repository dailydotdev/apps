import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { ReadingStreakIcon } from '../icons';
import { Typography, TypographyColor, TypographyType } from '../typography/Typography';
import { getCurrentTier, getNextMilestone } from '../../lib/streakMilestones';
import { MILESTONE_ICON_URLS } from './popup/icons/milestoneIcons';

type PopoverPhase = 'enter' | 'visible' | 'fading' | 'exit';

interface StreakReminderPopoverProps {
  currentStreak: number;
}

export function StreakReminderPopover({
  currentStreak,
}: StreakReminderPopoverProps): ReactElement | null {
  const [phase, setPhase] = useState<PopoverPhase>('enter');

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('visible'), 200),
      setTimeout(() => setPhase('fading'), 3200),
      setTimeout(() => setPhase('exit'), 3800),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  if (phase === 'exit') {
    return null;
  }

  const currentTier = getCurrentTier(currentStreak);
  const nextMilestone = getNextMilestone(currentStreak);
  const activeMilestone = nextMilestone ?? currentTier;
  const hasNextMilestone = Boolean(nextMilestone);
  const activeRangeStart = currentTier.day;
  const activeRangeEnd = nextMilestone?.day ?? currentTier.day;
  const activeRangeDelta = Math.max(activeRangeEnd - activeRangeStart, 1);
  const clampedCurrentStreak = Math.max(
    activeRangeStart,
    Math.min(currentStreak, activeRangeEnd),
  );
  const progress =
    nextMilestone === null
      ? 100
      : ((clampedCurrentStreak - activeRangeStart) / activeRangeDelta) * 100;

  return (
    <div
      className={classNames(
        'absolute left-1/2 top-full z-max mt-2 w-56 -translate-x-1/2 rounded-16 border border-border-subtlest-tertiary bg-background-default p-3 shadow-2 transition-all tablet:left-auto tablet:right-0 tablet:translate-x-0 laptop:left-1/2 laptop:right-auto laptop:-translate-x-1/2',
        phase === 'enter' && 'scale-95 opacity-0 duration-300',
        phase === 'fading' && 'scale-95 opacity-0 duration-500',
        phase !== 'enter' &&
          phase !== 'fading' &&
          'scale-100 opacity-100 duration-300',
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ReadingStreakIcon secondary className="text-accent-bacon-default" />
          <Typography bold type={TypographyType.Callout}>
            Don&apos;t lose your streak!
          </Typography>
        </div>
      </div>

      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
        className="mb-2"
      >
        Read today to keep your {currentStreak}-day streak alive.
      </Typography>

      <div className="flex items-center gap-2">
        <span className="font-bold tabular-nums typo-body text-text-primary">
          {activeRangeStart}
        </span>

        <div className="h-1.5 flex-1 overflow-hidden rounded-4 bg-surface-float">
          <div
            className="h-full bg-accent-bacon-default"
            style={{ width: `${progress}%` }}
          />
        </div>

        <span className="font-bold tabular-nums typo-body text-text-quaternary">
          {activeRangeEnd}
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
        </div>
      )}
    </div>
  );
}
