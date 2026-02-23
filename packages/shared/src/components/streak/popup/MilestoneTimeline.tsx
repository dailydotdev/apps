import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { StreakMilestone } from '../../../lib/streakMilestones';
import {
  STREAK_MILESTONES,
  getNextMilestone,
  RewardType,
} from '../../../lib/streakMilestones';
import { LockIcon, VIcon } from '../../icons';
import { IconSize } from '../../Icon';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';

interface MilestoneItemProps {
  milestone: StreakMilestone;
  isUnlocked: boolean;
  isNext: boolean;
  isLast: boolean;
  daysAway?: number;
}

const rewardTypeIcon: Record<RewardType, string> = {
  [RewardType.Cores]: '\uD83D\uDCB0',
  [RewardType.Cosmetic]: '\u2728',
  [RewardType.Perk]: '\u26A1',
};

function MilestoneItem({
  milestone,
  isUnlocked,
  isNext,
  isLast,
  daysAway,
}: MilestoneItemProps): ReactElement {
  return (
    <div className="relative flex gap-3">
      {!isLast && (
        <div
          className={classNames(
            'absolute left-[15px] top-8 h-[calc(100%-8px)] w-0.5',
            isUnlocked
              ? 'bg-accent-bacon-default'
              : 'bg-border-subtlest-tertiary',
          )}
        />
      )}

      <div
        className={classNames(
          'relative z-1 flex size-8 shrink-0 items-center justify-center rounded-full',
          isUnlocked && 'bg-accent-bacon-default text-white',
          isNext &&
            'animate-streak-pulse border-2 border-accent-bacon-default bg-background-default',
          !isUnlocked &&
            !isNext &&
            'border border-border-subtlest-tertiary bg-surface-float',
        )}
      >
        {isUnlocked && <VIcon size={IconSize.XSmall} />}
        {!isUnlocked && (
          <LockIcon
            size={IconSize.XSmall}
            className={
              isNext ? 'text-accent-bacon-default' : 'text-text-disabled'
            }
          />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5 pb-5">
        <div className="flex items-center gap-2">
          <Typography
            bold
            type={TypographyType.Callout}
            color={
              isUnlocked || isNext
                ? TypographyColor.Primary
                : TypographyColor.Quaternary
            }
          >
            {milestone.label}
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={
              isNext ? TypographyColor.Secondary : TypographyColor.Quaternary
            }
            className={classNames(
              'rounded-6 px-1.5 py-0.5',
              isNext && 'bg-accent-bacon-subtlest font-bold',
              (isUnlocked || (!isUnlocked && !isNext)) && 'bg-surface-float',
            )}
          >
            {milestone.day}d
          </Typography>
          {isNext && daysAway !== undefined && (
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Secondary}
            >
              {daysAway === 1 ? '1 day away' : `${daysAway} days away`}
            </Typography>
          )}
        </div>

        {milestone.rewards.length > 0 && (
          <div className="flex flex-col gap-0.5">
            {milestone.rewards.map((reward) => (
              <Typography
                key={reward.description}
                type={TypographyType.Footnote}
                color={
                  isUnlocked
                    ? TypographyColor.Tertiary
                    : TypographyColor.Quaternary
                }
              >
                {rewardTypeIcon[reward.type]} {reward.description}
              </Typography>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface MilestoneTimelineProps {
  currentStreak: number;
}

export function MilestoneTimeline({
  currentStreak,
}: MilestoneTimelineProps): ReactElement {
  const nextMilestone = getNextMilestone(currentStreak);

  return (
    <div className="flex flex-col border-t border-border-subtlest-tertiary px-4 pt-3">
      <Typography
        bold
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
        className="mb-3 uppercase tracking-wider"
      >
        Milestones &amp; Rewards
      </Typography>

      <div className="flex max-h-64 flex-col overflow-y-auto">
        {STREAK_MILESTONES.map((milestone, index) => {
          const isUnlocked = currentStreak >= milestone.day;
          const isNext =
            nextMilestone !== null && milestone.day === nextMilestone.day;
          const isLast = index === STREAK_MILESTONES.length - 1;
          const daysAway = isNext ? milestone.day - currentStreak : undefined;

          return (
            <MilestoneItem
              key={milestone.day}
              milestone={milestone}
              isUnlocked={isUnlocked}
              isNext={isNext}
              isLast={isLast}
              daysAway={daysAway}
            />
          );
        })}
      </div>
    </div>
  );
}
