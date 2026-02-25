import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import type { StreakMilestone } from '../../../lib/streakMilestones';
import {
  STREAK_MILESTONES,
  getNextMilestone,
  RewardType,
} from '../../../lib/streakMilestones';
import { useIsLightTheme } from '../../../hooks/utils';
import { CoreIcon, LockIcon, SparkleIcon } from '../../icons';
import { IconSize } from '../../Icon';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { ClaimRewardAnimation } from './ClaimRewardAnimation';
import type { ClaimReward } from './ClaimRewardAnimation';
import { MILESTONE_ICON_URLS } from './icons/milestoneIcons';
import CursorAiIconDark from './icons/cursor-ai-dark.svg';
import CursorAiIconLight from './icons/cursor-ai-light.svg';

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

const SPONSORED_MILESTONE_DAY = 4;
const SPONSORED_COUPON_CODE = 'CURSOR-4D-STREAK';

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
  const isSponsoredMilestone = milestone.day === SPONSORED_MILESTONE_DAY;
  const isLightTheme = useIsLightTheme();
  const hasActiveLineStyle = isNext || isSponsoredMilestone;
  const showClaimButton = milestone.rewards.length > 0 && isUnlocked;
  const canClaim = isUnlocked && !isClaimed;
  const canShowSponsoredReward = isSponsoredMilestone && isClaimed;
  const CursorAiIcon = isLightTheme ? CursorAiIconLight : CursorAiIconDark;

  return (
    <div
      className={classNames(
        'relative isolate z-0 flex gap-3 rounded-12',
        isSponsoredMilestone &&
          'z-1 mb-6 items-center bg-background-default px-2 py-1',
      )}
    >
      {isSponsoredMilestone && (
        <>
          <div
            className="pointer-events-none absolute inset-0 z-0 rounded-12 bg-[length:220%_220%] animate-sponsored-gradient-slide"
            style={{
              backgroundImage:
                'linear-gradient(120deg, color-mix(in srgb, var(--theme-accent-bacon-default), transparent 84%) 0%, color-mix(in srgb, var(--theme-accent-cabbage-default), transparent 86%) 50%, color-mix(in srgb, var(--theme-accent-blueCheese-default), transparent 84%) 100%)',
            }}
          />
          <div
            className="pointer-events-none absolute inset-0 z-0 rounded-12 bg-[length:260%_260%] opacity-32 animate-sponsored-lines-slide"
            style={{
              backgroundImage:
                'repeating-linear-gradient(120deg, transparent 0px, transparent 10px, color-mix(in srgb, var(--theme-text-primary), transparent 86%) 10px, color-mix(in srgb, var(--theme-text-primary), transparent 86%) 11px)',
            }}
          />
        </>
      )}
      {!isLast && (
        <div
          className={classNames(
            'absolute -z-1 left-5 w-px',
            isSponsoredMilestone ? 'top-full h-7' : 'top-10 h-[calc(100%-12px)]',
            isUnlocked
              ? 'bg-accent-bacon-default'
              : 'bg-border-subtlest-tertiary',
          )}
        />
      )}

      <div className="relative z-1 flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-pepper-subtlest">
        {isNext && (
          <div className="pointer-events-none absolute -inset-2 z-0 rounded-full bg-accent-bacon-default/50 blur-lg animate-streak-pulse" />
        )}
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
        {isSponsoredMilestone ? (
          <CursorAiIcon
            className="relative z-1 size-full object-contain"
            aria-label={milestone.label}
          />
        ) : !isUnlocked && !isNext ? (
          <LockIcon
            size={IconSize.Small}
            className="relative z-1 text-text-quaternary"
          />
        ) : (
          <img
            src={MILESTONE_ICON_URLS[milestone.tier]}
            alt={milestone.label}
            className="relative z-1 size-full object-contain transition-transform duration-300 hover:scale-150 hover:delay-500"
            style={
              isNext && !isSponsoredMilestone
                ? { filter: 'grayscale(100%)' }
                : undefined
            }
          />
        )}
      </div>

      <div
        className={classNames(
          'relative z-1 flex min-w-0 flex-1 flex-col justify-start gap-0.5',
          isSponsoredMilestone ? 'min-h-0 py-1' : 'min-h-[5.5rem] pb-5',
        )}
      >
        <div className="flex items-center gap-2">
          <Typography
            bold
            type={TypographyType.Subhead}
            color={
              isUnlocked || hasActiveLineStyle
                ? TypographyColor.Primary
                : TypographyColor.Quaternary
            }
          >
            {milestone.label}
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={isNext ? TypographyColor.Secondary : TypographyColor.Quaternary}
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
          {showClaimButton && (
            <Button
              size={ButtonSize.XSmall}
              variant={
                canShowSponsoredReward || isClaimed
                  ? ButtonVariant.Tertiary
                  : ButtonVariant.Primary
              }
              disabled={!canClaim && !canShowSponsoredReward}
              className="ml-auto shrink-0"
              onClick={canClaim || canShowSponsoredReward ? onClaim : undefined}
            >
              {canShowSponsoredReward ? 'Show' : isClaimed ? 'Claimed' : 'Claim'}
            </Button>
          )}
        </div>

        {milestone.rewards.length > 0 && (
          <div className="flex flex-col gap-0.5">
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
                {isSponsoredMilestone ? '🎁' : rewardTypeIcon[reward.type]}{' '}
                {reward.description}
              </Typography>
            ))}
            {isSponsoredMilestone && (
              <Typography
                tag={TypographyTag.Span}
                type={TypographyType.Caption2}
                className="relative inline-flex w-fit overflow-hidden rounded-6 px-1 py-0 text-surface-invert"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-0 bg-[length:220%_220%] animate-sponsored-gradient-slide"
                  style={{
                    backgroundImage:
                      'linear-gradient(120deg, color-mix(in srgb, var(--theme-accent-bacon-default), transparent 20%) 0%, color-mix(in srgb, var(--theme-accent-cabbage-default), transparent 25%) 50%, color-mix(in srgb, var(--theme-accent-blueCheese-default), transparent 20%) 100%)',
                  }}
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-0 bg-[length:260%_260%] opacity-40 animate-sponsored-lines-slide"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(120deg, transparent 0px, transparent 5px, color-mix(in srgb, var(--theme-text-primary), transparent 84%) 5px, color-mix(in srgb, var(--theme-text-primary), transparent 84%) 6px)',
                  }}
                />
                <span className="relative z-1">Sponsored</span>
              </Typography>
            )}
          </div>
        )}
        {helperText && (
          <Typography
            type={TypographyType.Subhead}
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
  const [claimAnimation, setClaimAnimation] = useState<ClaimReward | null>(null);

  const handleClaim = useCallback((milestone: StreakMilestone) => {
    if (milestone.day === SPONSORED_MILESTONE_DAY) {
      setClaimAnimation({
        type: 'coupon',
        code: SPONSORED_COUPON_CODE,
        title: 'Cursor AI discount coupon',
      });
      setClaimedDays((prev) => new Set([...prev, milestone.day]));
      return;
    }

    const cores = getCoresAmount(milestone);
    const displayAmount = cores ?? milestone.rewards[0]?.description ?? '1';

    setClaimAnimation({ type: 'cores', amount: displayAmount });
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
        type={TypographyType.Subhead}
        color={TypographyColor.Tertiary}
        className="mb-3 capitalize"
      >
        milestones &amp; rewards
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
          const isAutoClaimed =
            isUnlocked &&
            index < 3 &&
            milestone.day !== SPONSORED_MILESTONE_DAY;
          const isClaimed = wasJustClaimed || isAutoClaimed;

          return (
            <div
              key={milestone.day}
              ref={shouldScrollToMilestone ? activeMilestoneRef : undefined}
              className={classNames(
                'relative z-0',
                milestone.day === SPONSORED_MILESTONE_DAY &&
                  "z-10 before:pointer-events-none before:absolute before:inset-y-0 before:left-5 before:w-px before:bg-background-default before:content-['']",
              )}
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
          reward={claimAnimation}
          onComplete={handleAnimationComplete}
        />
      )}
    </div>
  );
}
