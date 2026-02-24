import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import type { StreakMilestone } from '../../../lib/streakMilestones';
import {
  STREAK_MILESTONES,
  getNextMilestone,
  RewardType,
} from '../../../lib/streakMilestones';
import { CoreIcon, SparkleIcon } from '../../icons';
import { IconSize } from '../../Icon';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { ClaimRewardAnimation } from './ClaimRewardAnimation';
import { MILESTONE_ICON_URLS } from './icons/milestoneIcons';

interface MilestoneItemProps {
  milestone: StreakMilestone;
  isUnlocked: boolean;
  isNext: boolean;
  isLast: boolean;
  daysAway?: number;
  isClaimed: boolean;
  justClaimed: boolean;
  onClaim?: () => void;
}

interface MilestoneSparkle {
  top: number;
  left: number;
  size: number;
  delayMs: number;
}

const rewardTypeIcon: Record<RewardType, ReactElement | string> = {
  [RewardType.Cores]: (<CoreIcon size={IconSize.XSmall} className="inline" />),
  [RewardType.Cosmetic]: '\u2728',
  [RewardType.Perk]: '\u26A1',
};

const seededRandom = (seed: number): number => {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
};

const getMilestoneSparkles = (
  milestoneDay: number,
  count = 3,
): MilestoneSparkle[] =>
  Array.from({ length: count }, (_, index) => ({
    top: 20 + seededRandom(milestoneDay * 11 + index * 7 + 1) * 60,
    left: 20 + seededRandom(milestoneDay * 13 + index * 5 + 3) * 60,
    size: 8 + seededRandom(milestoneDay * 17 + index * 3 + 2) * 5,
    delayMs: seededRandom(milestoneDay * 19 + index * 9 + 4) * 900,
  }));

const getMilestoneHelperText = (milestone: StreakMilestone): string | null => {
  if (milestone.day === 1) {
    return 'Start your streak journey.';
  }

  return null;
};

function MilestoneItem({
  milestone,
  isUnlocked,
  isNext,
  isLast,
  daysAway,
  isClaimed,
  justClaimed,
  onClaim,
}: MilestoneItemProps): ReactElement {
  const helperText =
    milestone.rewards.length === 0 ? getMilestoneHelperText(milestone) : null;
  const sparklePositions = getMilestoneSparkles(milestone.day);

  return (
    <div className="relative flex gap-3">
      {!isLast && (
        <div
          className={classNames(
            'absolute left-5 top-10 h-[calc(100%-12px)] w-0.5',
            isUnlocked
              ? 'bg-accent-bacon-default'
              : 'bg-border-subtlest-tertiary',
          )}
        />
      )}

      <div
        className="relative z-1 flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-pepper-subtlest"
      >
        {isUnlocked && !isNext && (
          <>
            {sparklePositions.map((sparkle, index) => (
              <SparkleIcon
                key={`${milestone.day}-${index}`}
                className="pointer-events-none absolute z-2 text-white animate-scale-down-pulse"
                style={{
                  top: `${sparkle.top}%`,
                  left: `${sparkle.left}%`,
                  width: `${sparkle.size}px`,
                  height: `${sparkle.size}px`,
                  transform: 'translate(-50%, -50%)',
                  animationDelay: `${sparkle.delayMs}ms`,
                }}
              />
            ))}
          </>
        )}
        <img
          src={MILESTONE_ICON_URLS[milestone.tier]}
          alt={milestone.label}
          className={classNames(
            'size-full object-contain transition-transform duration-300 hover:scale-150 hover:delay-500',
            isNext && 'animate-milestone-glow',
            !isUnlocked && !isNext && 'grayscale opacity-40',
          )}
        />
      </div>

      <div className="flex min-h-[5.5rem] min-w-0 flex-1 flex-col justify-center gap-0.5 pb-5">
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
              isNext && 'bg-accent-bacon-default font-bold text-white',
              (isUnlocked || (!isUnlocked && !isNext)) && 'bg-surface-float',
            )}
          >
            {isNext ? 'Active' : `${milestone.day}d`}
          </Typography>
          {isNext && daysAway !== undefined && (
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Secondary}
            >
              {daysAway === 1 ? '1 day away' : `${daysAway} days away`}
            </Typography>
          )}
          {isUnlocked && milestone.rewards.length > 0 && (
            <Button
              size={ButtonSize.XSmall}
              variant={
                isClaimed ? ButtonVariant.Subtle : ButtonVariant.Primary
              }
              disabled={isClaimed}
              className="ml-auto shrink-0"
              onClick={!isClaimed ? onClaim : undefined}
            >
              {isClaimed ? 'Claimed' : 'Claim'}
            </Button>
          )}
        </div>

        {milestone.rewards.length > 0 && (
          <div className="flex flex-col gap-0.5">
            {justClaimed && (
              <Typography
                bold
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
                className="mb-0.5 animate-fade-in-up uppercase tracking-wider"
                style={{ animationFillMode: 'backwards' }}
              >
                Rewards unlocked
              </Typography>
            )}
            {milestone.rewards.map((reward, rewardIndex) => (
              <Typography
                key={reward.description}
                type={TypographyType.Footnote}
                color={
                  isUnlocked
                    ? TypographyColor.Tertiary
                    : TypographyColor.Quaternary
                }
                className={classNames(justClaimed && 'animate-fade-in-up')}
                style={
                  justClaimed
                    ? {
                        animationDelay: `${(rewardIndex + 1) * 120}ms`,
                        animationFillMode: 'backwards',
                      }
                    : undefined
                }
              >
                {rewardTypeIcon[reward.type]} {reward.description}
              </Typography>
            ))}
          </div>
        )}
        {helperText && (
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Quaternary}
          >
            {helperText}
          </Typography>
        )}
      </div>
    </div>
  );
}

interface MilestoneTimelineProps {
  currentStreak: number;
  isVisible?: boolean;
}

const getCoresAmount = (milestone: StreakMilestone): string | null => {
  const coresReward = milestone.rewards.find(
    (r) => r.type === RewardType.Cores,
  );

  if (!coresReward) {
    return null;
  }

  const match = coresReward.description.match(/\d+/);
  return match?.[0] ?? null;
};

export function MilestoneTimeline({
  currentStreak,
  isVisible = true,
}: MilestoneTimelineProps): ReactElement {
  const nextMilestone = getNextMilestone(currentStreak);
  const activeDay =
    nextMilestone?.day ??
    STREAK_MILESTONES.filter((m) => m.day <= currentStreak).at(-1)?.day ??
    STREAK_MILESTONES[0]?.day;
  const activeMilestoneRef = useRef<HTMLDivElement>(null);
  const [claimedDays, setClaimedDays] = useState<Set<number>>(new Set());
  const [claimAnimation, setClaimAnimation] = useState<{
    amount: string;
  } | null>(null);

  const handleClaim = useCallback((milestone: StreakMilestone) => {
    const cores = getCoresAmount(milestone);
    const displayAmount = cores ?? milestone.rewards[0]?.description ?? '1';

    setClaimAnimation({ amount: displayAmount });
    setClaimedDays((prev) => new Set([...prev, milestone.day]));
  }, []);

  const handleAnimationComplete = useCallback(() => {
    setClaimAnimation(null);
  }, []);

  useEffect(() => {
    if (!isVisible) {
      return undefined;
    }

    const timer = setTimeout(() => {
      const active = activeMilestoneRef.current;

      if (!active) {
        return;
      }

      active.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, 200);

    return () => clearTimeout(timer);
  }, [currentStreak, nextMilestone?.day, isVisible]);

  return (
    <div className="flex min-h-0 flex-1 flex-col border-t border-border-subtlest-tertiary px-4 pt-3">
      <Typography
        bold
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
        className="mb-3 uppercase tracking-wider"
      >
        Milestones &amp; Rewards
      </Typography>

      <div
        className="flex min-h-0 flex-1 flex-col overflow-y-auto px-2 -mx-2 pt-4 pb-2"
        style={{
          maskImage:
            'linear-gradient(to bottom, transparent, black 24px, black calc(100% - 24px), transparent)',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent, black 24px, black calc(100% - 24px), transparent)',
        }}
      >
        {STREAK_MILESTONES.map((milestone, index) => {
          const isUnlocked = currentStreak >= milestone.day;
          const isNext =
            nextMilestone !== null && milestone.day === nextMilestone.day;
          const isLast = index === STREAK_MILESTONES.length - 1;
          const daysAway = isNext ? milestone.day - currentStreak : undefined;
          const shouldScrollToMilestone = milestone.day === activeDay;
          const wasJustClaimed = claimedDays.has(milestone.day);
          const isClaimed = wasJustClaimed || (isUnlocked && index < 3);

          return (
            <div
              key={milestone.day}
              ref={shouldScrollToMilestone ? activeMilestoneRef : undefined}
            >
              <MilestoneItem
                milestone={milestone}
                isUnlocked={isUnlocked}
                isNext={isNext}
                isLast={isLast}
                daysAway={daysAway}
                isClaimed={isClaimed}
                justClaimed={wasJustClaimed}
                onClaim={() => handleClaim(milestone)}
              />
            </div>
          );
        })}
      </div>
      {claimAnimation && (
        <ClaimRewardAnimation
          amount={claimAnimation.amount}
          onComplete={handleAnimationComplete}
        />
      )}
    </div>
  );
}
