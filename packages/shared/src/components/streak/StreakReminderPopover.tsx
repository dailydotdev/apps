import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
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
  const daysAway = nextMilestone
    ? Math.max(nextMilestone.day - currentStreak, 0)
    : 0;

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
      <div className="mb-2 flex items-center justify-start gap-1.5 whitespace-nowrap">
        <div className="relative flex size-7 items-center justify-center rounded-full bg-transparent">
          <span className="pointer-events-none absolute inset-0.5 rounded-full border border-white/70 animate-streak-day-pop" />
          <div className="absolute size-4 rounded-full border-[1.5px] border-border-subtlest-tertiary" />
        </div>
        <Typography bold type={TypographyType.Callout}>
          Day {currentStreak}!
        </Typography>
      </div>

      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
        className="mb-2"
      >
        Read today to keep your {currentStreak}-day streak alive.
      </Typography>

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
            <Typography type={TypographyType.Subhead}>
              {hasNextMilestone
                ? `${activeMilestone.label} · ${
                    daysAway === 1 ? '1 day away' : `${daysAway} days away`
                  }`
                : activeMilestone.label}
            </Typography>
          </div>
        </div>
      )}
    </div>
  );
}
