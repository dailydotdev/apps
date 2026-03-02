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
import {
  CoreIcon,
  LockIcon,
  ReputationLightningIcon,
  SparkleIcon,
} from '../../icons';
import { IconSize } from '../../Icon';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { ClaimRewardAnimation } from './ClaimRewardAnimation';
import type { ClaimReward } from './ClaimRewardAnimation';
import { MILESTONE_ICON_URLS } from './icons/milestoneIcons';
import CursorAiIconDark from './icons/cursor-ai-dark.svg';
import CursorAiIconLight from './icons/cursor-ai-light.svg';
import SponsoredGiftImage from './icons/sponsored-gift.png';

interface MilestoneItemProps {
  milestone: StreakMilestone;
  isUnlocked: boolean;
  isNext: boolean;
  isLast: boolean;
  daysAway?: number;
  isClaimed: boolean;
  onClaim?: () => void;
}

interface MilestoneSparkle {
  top: number;
  left: number;
  size: number;
  delayMs: number;
}

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
const sponsoredGiftSrc =
  typeof SponsoredGiftImage === 'string'
    ? SponsoredGiftImage
    : (SponsoredGiftImage as { src?: string })?.src;

const getMilestoneHelperText = (milestone: StreakMilestone): string | null => {
  if (milestone.day === 1) {
    return 'Start your streak journey.';
  }

  return null;
};

const getMilestoneCoresAmount = (milestone: StreakMilestone): string | null => {
  const coresReward = milestone.rewards.find(
    (reward) => reward.type === RewardType.Cores,
  );
  if (!coresReward) {
    return null;
  }

  const amountMatch = coresReward.description.match(/\d[\d,]*/);
  return amountMatch?.[0] ?? null;
};

const getMilestoneHeadline = ({
  milestone,
  helperText,
  isSponsoredMilestone,
}: {
  milestone: StreakMilestone;
  helperText: string | null;
  isSponsoredMilestone: boolean;
}): ReactElement | string => {
  if (isSponsoredMilestone) {
    return '20% discount coupon';
  }

  if (milestone.rewards.length === 0) {
    return helperText ?? milestone.label;
  }

  if (milestone.rewards.length === 1) {
    const reward = milestone.rewards[0];

    if (reward.type === RewardType.Perk && /boost/i.test(reward.description)) {
      return (
        <span className="inline-flex items-center gap-1">
          <ReputationLightningIcon
            secondary
            size={IconSize.XSmall}
            className="shrink-0"
          />
          <span>{reward.description}</span>
        </span>
      );
    }

    if (reward.type !== RewardType.Cores) {
      return reward.description;
    }

    return (
      <span className="inline-flex items-center gap-1">
        <CoreIcon size={IconSize.XSmall} className="shrink-0" />
        <span>{reward.description}</span>
      </span>
    );
  }

  const primaryCoresReward = milestone.rewards.find(
    (reward) => reward.type === RewardType.Cores,
  );
  const primaryReward =
    primaryCoresReward?.description ?? milestone.rewards[0].description;
  if (!primaryCoresReward) {
    const extraRewardsCount = milestone.rewards.length - 1;
    return `${primaryReward} + ${extraRewardsCount} ${
      extraRewardsCount === 1 ? 'reward' : 'rewards'
    }`;
  }

  return (
    <span className="inline-flex items-center gap-1">
      <CoreIcon size={IconSize.XSmall} className="shrink-0" />
      <span>{primaryReward}</span>
    </span>
  );
};

function MilestoneItem({
  milestone,
  isUnlocked,
  isNext,
  isLast,
  daysAway,
  isClaimed,
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
  const claimButtonVariant =
    canShowSponsoredReward || isClaimed
      ? ButtonVariant.Tertiary
      : ButtonVariant.Primary;
  let claimButtonLabel = 'Claim';
  if (canShowSponsoredReward) {
    claimButtonLabel = 'Show';
  } else if (isClaimed) {
    claimButtonLabel = 'Claimed';
  }
  let milestoneDescriptionColor = TypographyColor.Quaternary;
  if (isNext) {
    milestoneDescriptionColor = TypographyColor.Primary;
  } else if (isUnlocked) {
    milestoneDescriptionColor = TypographyColor.Tertiary;
  }
  const milestoneHeadline = getMilestoneHeadline({
    milestone,
    helperText,
    isSponsoredMilestone,
  });
  const shouldShowLockedIcon = !isUnlocked && !isNext;
  const milestoneIconStyle =
    isNext && !isSponsoredMilestone ? { filter: 'grayscale(100%)' } : undefined;
  let milestoneIcon: ReactElement;
  if (isSponsoredMilestone) {
    milestoneIcon = (
      <img
        src={sponsoredGiftSrc}
        alt={`${milestone.label} gift`}
        className="relative z-1 size-full object-contain transition-transform duration-300 hover:scale-150 hover:delay-500"
      />
    );
  } else if (shouldShowLockedIcon) {
    milestoneIcon = (
      <LockIcon
        size={IconSize.Small}
        className="relative z-1 text-text-quaternary"
      />
    );
  } else {
    milestoneIcon = (
      <img
        src={MILESTONE_ICON_URLS[milestone.tier]}
        alt={milestone.label}
        className="relative z-1 size-full object-contain transition-transform duration-300 hover:scale-150 hover:delay-500"
        style={milestoneIconStyle}
      />
    );
  }

  return (
    <div
      className={classNames(
        'relative isolate z-0 flex gap-3 rounded-12',
        isSponsoredMilestone &&
          'z-1 -mx-2 mb-6 items-center bg-background-default px-2 py-1',
      )}
    >
      {isSponsoredMilestone && (
        <>
          <div
            className="pointer-events-none absolute inset-0 z-0 animate-sponsored-gradient-slide rounded-12 bg-[length:220%_220%]"
            style={{
              backgroundImage:
                'radial-gradient(140% 120% at 8% 12%, color-mix(in srgb, var(--theme-accent-bacon-default), transparent 78%) 0%, transparent 58%), radial-gradient(120% 120% at 88% 20%, color-mix(in srgb, var(--theme-accent-cabbage-default), transparent 80%) 0%, transparent 60%), radial-gradient(130% 130% at 48% 82%, color-mix(in srgb, var(--theme-accent-blueCheese-default), transparent 80%) 0%, transparent 62%), radial-gradient(100% 90% at 72% 72%, color-mix(in srgb, var(--theme-accent-pepper-default), transparent 88%) 0%, transparent 65%)',
            }}
          />
        </>
      )}
      {!isLast && (
        <div
          className={classNames(
            'absolute -z-1 w-px',
            isSponsoredMilestone
              ? 'left-7 top-full h-7'
              : 'left-5 top-10 h-[calc(100%-12px)]',
            isUnlocked
              ? 'bg-accent-bacon-default'
              : 'bg-border-subtlest-tertiary',
          )}
        />
      )}

      <div
        className={classNames(
          'relative z-1 flex size-10 shrink-0 items-center justify-center rounded-full',
          isSponsoredMilestone ? 'bg-transparent' : 'bg-accent-pepper-subtlest',
        )}
      >
        {isNext && (
          <div className="bg-accent-bacon-default/50 pointer-events-none absolute -inset-2 z-0 animate-streak-pulse rounded-full blur-lg" />
        )}
        {isUnlocked && !isNext && (
          <>
            {sparklePositions.map((sparkle) => (
              <SparkleIcon
                key={`${milestone.day}-${sparkle.top}-${sparkle.left}-${sparkle.delayMs}`}
                className="pointer-events-none absolute z-2 animate-scale-down-pulse text-white"
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
        {milestoneIcon}
      </div>

      <div
        className={classNames(
          'relative z-1 flex min-w-0 flex-1 flex-col justify-start gap-0.5',
          isSponsoredMilestone && 'min-h-0 py-1',
          !isSponsoredMilestone && 'min-h-[4.5rem] pb-3',
        )}
      >
        <div className="flex items-center gap-2">
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
            {`${milestone.day}d`}
          </Typography>
          <Typography
            bold
            type={TypographyType.Subhead}
            color={
              isUnlocked || hasActiveLineStyle
                ? TypographyColor.Primary
                : TypographyColor.Quaternary
            }
            className="min-w-0 flex-1 truncate"
          >
            {milestoneHeadline}
          </Typography>
          {showClaimButton && (
            <Button
              size={ButtonSize.XSmall}
              variant={claimButtonVariant}
              disabled={!canClaim && !canShowSponsoredReward}
              className="ml-auto shrink-0"
              onClick={canClaim || canShowSponsoredReward ? onClaim : undefined}
            >
              {claimButtonLabel}
            </Button>
          )}
        </div>
        <div className="flex min-w-0 items-center gap-1">
          <Typography
            type={TypographyType.Subhead}
            color={milestoneDescriptionColor}
            className="truncate"
          >
            {isSponsoredMilestone
              ? `A gift from ${milestone.label}`
              : milestone.label}
          </Typography>
          {isNext && daysAway !== undefined && (
            <Typography
              type={TypographyType.Subhead}
              color={TypographyColor.Primary}
              className="shrink-0"
            >
              · {daysAway === 1 ? '1 day away' : `${daysAway} days away`}
            </Typography>
          )}
          {isSponsoredMilestone && (
            <CursorAiIcon
              className="size-4 shrink-0 object-contain"
              aria-label={`${milestone.label} logo`}
            />
          )}
        </div>
      </div>
    </div>
  );
}

interface MilestoneTimelineProps {
  currentStreak: number;
  isVisible?: boolean;
  claimResetNonce?: number;
}

export function MilestoneTimeline({
  currentStreak,
  isVisible = true,
  claimResetNonce,
}: MilestoneTimelineProps): ReactElement {
  const nextMilestone = getNextMilestone(currentStreak);
  const activeDay =
    nextMilestone?.day ??
    STREAK_MILESTONES.filter((m) => m.day <= currentStreak).at(-1)?.day ??
    STREAK_MILESTONES[0]?.day;
  const activeMilestoneRef = useRef<HTMLDivElement>(null);
  const [claimedDays, setClaimedDays] = useState<Set<number>>(new Set());
  const [claimAnimation, setClaimAnimation] = useState<ClaimReward | null>(
    null,
  );

  const handleClaim = useCallback((milestone: StreakMilestone) => {
    if (milestone.day === SPONSORED_MILESTONE_DAY) {
      setClaimAnimation({
        type: 'coupon',
        code: SPONSORED_COUPON_CODE,
        title: 'Cursor AI discount coupon',
        milestoneDay: milestone.day,
        milestoneLabel: milestone.label,
      });
      setClaimedDays((prev) => new Set([...prev, milestone.day]));
      return;
    }

    const coresAmount = getMilestoneCoresAmount(milestone);
    if (coresAmount) {
      setClaimAnimation({
        type: 'cores',
        amount: coresAmount,
        milestoneDay: milestone.day,
        milestoneLabel: milestone.label,
      });
    }

    setClaimedDays((prev) => new Set([...prev, milestone.day]));
  }, []);

  const handleAnimationComplete = useCallback(() => {
    setClaimAnimation(null);
  }, []);

  useEffect(() => {
    setClaimedDays(new Set());
    setClaimAnimation(null);
  }, [claimResetNonce]);

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
        className="-mx-2 flex min-h-0 flex-1 flex-col overflow-y-auto px-2 pb-2 pt-4"
        style={{
          maskImage:
            'linear-gradient(to bottom, transparent, black 24px, black calc(100% - 24px), transparent)',
          maskRepeat: 'no-repeat',
          maskSize: '100% 100%',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent, black 24px, black calc(100% - 24px), transparent)',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskSize: '100% 100%',
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
          const isClaimed = wasJustClaimed;

          return (
            <div
              key={milestone.day}
              ref={shouldScrollToMilestone ? activeMilestoneRef : undefined}
              className={classNames(
                'relative z-0',
                milestone.day === SPONSORED_MILESTONE_DAY &&
                  "z-10 before:pointer-events-none before:absolute before:inset-y-0 before:left-7 before:w-px before:bg-background-default before:content-['']",
              )}
            >
              <MilestoneItem
                milestone={milestone}
                isUnlocked={isUnlocked}
                isNext={isNext}
                isLast={isLast}
                daysAway={daysAway}
                isClaimed={isClaimed}
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
