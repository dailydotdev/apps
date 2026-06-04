import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { FlexCol, FlexRow } from '../../../components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { ProgressBar } from '../../../components/fields/ProgressBar';
import {
  CoreIcon,
  DevPlusIcon,
  GiftIcon,
  LockIcon,
  MedalBadgeIcon,
  StarIcon,
  VIcon,
} from '../../../components/icons';
import ConfettiSvg from '../../../svg/ConfettiSvg';
import { useGivebackContext } from '../GivebackContext';
import { formatDonationAmount } from '../utils';
import type { GivebackLevel } from '../types';
import { GivebackRewardType } from '../types';

const rewardIconByType: Record<GivebackRewardType, ReactElement> = {
  [GivebackRewardType.Cores]: <CoreIcon />,
  [GivebackRewardType.DailyPlus]: <DevPlusIcon />,
  [GivebackRewardType.SwagCoupon]: <GiftIcon />,
  [GivebackRewardType.Badge]: <MedalBadgeIcon />,
  [GivebackRewardType.Other]: <StarIcon />,
};

// Each reward type gets its own accent so the ladder reads like a collectible
// set of prizes rather than a list of rows.
const rewardAccent: Record<GivebackRewardType, { tile: string; text: string }> =
  {
    [GivebackRewardType.Cores]: {
      tile: 'bg-accent-cheese-flat',
      text: 'text-accent-cheese-default',
    },
    [GivebackRewardType.DailyPlus]: {
      tile: 'bg-accent-cabbage-flat',
      text: 'text-accent-cabbage-default',
    },
    [GivebackRewardType.SwagCoupon]: {
      tile: 'bg-accent-bacon-flat',
      text: 'text-accent-bacon-default',
    },
    [GivebackRewardType.Badge]: {
      tile: 'bg-accent-onion-flat',
      text: 'text-accent-onion-default',
    },
    [GivebackRewardType.Other]: {
      tile: 'bg-accent-avocado-flat',
      text: 'text-accent-avocado-default',
    },
  };

interface LevelTierProps {
  level: GivebackLevel;
  index: number;
  total: number;
  currency: string;
  approved: number;
  currentLevelNumber: number;
  nextLevelId?: string;
  nextReached: boolean;
  amountToNext: number;
  isClaimed: boolean;
  onClaim: (rewardId: string) => void;
}

const LevelTier = ({
  level,
  index,
  total,
  currency,
  approved,
  currentLevelNumber,
  nextLevelId,
  nextReached,
  amountToNext,
  isClaimed,
  onClaim,
}: LevelTierProps): ReactElement => {
  const { reward } = level;
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const isReached = approved >= level.requiredApprovedAmount;
  const isCurrent = level.levelNumber === currentLevelNumber;
  const isNext = level.id === nextLevelId;
  const isRevealed = isReached || isNext || !reward?.isSecret;
  const canClaim = isReached && !!reward && !isClaimed;
  const accent = reward ? rewardAccent[reward.type] : null;
  const [celebrate, setCelebrate] = useState(false);

  const handleClaim = () => {
    if (!reward) {
      return;
    }
    setCelebrate(true);
    onClaim(reward.id);
  };

  const medallionClassName = classNames(
    'relative flex size-12 shrink-0 items-center justify-center rounded-16 [&_svg]:size-6',
    isLast && isReached
      ? 'bg-gradient-to-br from-accent-cheese-default to-accent-bacon-default text-white shadow-2'
      : isReached && accent
      ? classNames(accent.tile, accent.text)
      : 'bg-surface-float text-text-quaternary',
  );

  return (
    <li className="relative grid grid-cols-[3rem_1fr] gap-3">
      {celebrate && (
        <ConfettiSvg
          aria-hidden
          className="pointer-events-none absolute left-8 top-0 z-1 h-20 w-40"
        />
      )}

      <div className="relative flex w-12 flex-col items-center">
        {!isFirst && (
          <span
            aria-hidden
            className={classNames(
              'absolute left-1/2 top-0 h-6 w-0.5 -translate-x-1/2',
              isReached
                ? 'bg-accent-avocado-default'
                : 'bg-border-subtlest-tertiary',
            )}
          />
        )}
        {!isLast && (
          <span
            aria-hidden
            className={classNames(
              'absolute bottom-0 left-1/2 top-12 w-0.5 -translate-x-1/2',
              nextReached
                ? 'bg-accent-avocado-default'
                : 'bg-border-subtlest-tertiary',
            )}
          />
        )}

        {isCurrent && (
          <span
            aria-hidden
            className="bg-accent-cabbage-default/25 absolute left-1/2 top-0 size-12 -translate-x-1/2 rounded-16 motion-safe:animate-ping"
          />
        )}
        <span
          className={classNames(
            'relative z-1 flex size-12 items-center justify-center rounded-16 font-bold tabular-nums typo-title3',
            isCurrent &&
              'bg-accent-cabbage-default text-white shadow-2-cabbage',
            isReached && !isCurrent && 'bg-accent-avocado-default text-white',
            !isReached &&
              'border border-border-subtlest-tertiary bg-background-subtle text-text-quaternary',
          )}
        >
          {level.levelNumber}
        </span>
      </div>

      <FlexRow
        className={classNames(
          'min-w-0 items-center gap-3 rounded-16 p-2',
          isCurrent && 'bg-accent-cabbage-flat',
        )}
      >
        <span
          className={classNames(
            medallionClassName,
            isNext && 'motion-safe:animate-glow-pulse',
          )}
        >
          {reward ? (
            isRevealed ? (
              rewardIconByType[reward.type]
            ) : (
              <LockIcon />
            )
          ) : (
            <StarIcon secondary />
          )}
        </span>

        <FlexCol className="min-w-0 flex-1 gap-1">
          <FlexRow className="flex-wrap items-center gap-x-2 gap-y-0.5">
            <Typography
              bold
              type={TypographyType.Callout}
              color={
                isReached ? TypographyColor.Primary : TypographyColor.Secondary
              }
            >
              {reward
                ? isRevealed
                  ? reward.title
                  : reward.secretTitle
                : 'Starting line'}
            </Typography>
            {isLast && (
              <span className="rounded-6 bg-accent-bacon-flat px-1.5 py-0.5 font-bold uppercase tracking-wider text-accent-bacon-default typo-caption2">
                Final level
              </span>
            )}
          </FlexRow>

          <FlexRow className="flex-wrap items-center gap-x-2 gap-y-0.5">
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
            >
              Level {level.levelNumber} · {level.name}
            </Typography>
            <span
              aria-hidden
              className="size-1 rounded-full bg-border-subtlest-secondary"
            />
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
              className="tabular-nums"
            >
              {level.requiredApprovedAmount === 0
                ? 'Start'
                : formatDonationAmount(level.requiredApprovedAmount, currency)}
            </Typography>
          </FlexRow>

          {reward && isRevealed && reward.description && (
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
            >
              {reward.description}
            </Typography>
          )}
        </FlexCol>

        <FlexCol className="shrink-0 items-end gap-1">
          {canClaim ? (
            <Button
              type="button"
              size={ButtonSize.Small}
              variant={ButtonVariant.Primary}
              onClick={handleClaim}
            >
              Claim
            </Button>
          ) : isReached && reward ? (
            <FlexRow
              className={classNames(
                'items-center gap-1 text-accent-avocado-default',
                celebrate && 'motion-safe:animate-reward-pop',
              )}
            >
              <VIcon />
              <Typography bold type={TypographyType.Caption1}>
                Claimed
              </Typography>
            </FlexRow>
          ) : isCurrent ? (
            <span className="rounded-8 bg-accent-cabbage-default px-2 py-0.5 font-bold text-white typo-caption1">
              You are here
            </span>
          ) : isNext && amountToNext > 0 ? (
            <Typography
              bold
              type={TypographyType.Caption1}
              className="text-accent-cabbage-default"
            >
              {formatDonationAmount(amountToNext, currency)} away
            </Typography>
          ) : (
            !isReached && (
              <FlexRow className="items-center gap-1 text-text-quaternary">
                <LockIcon />
                <Typography type={TypographyType.Caption1}>Locked</Typography>
              </FlexRow>
            )
          )}
        </FlexCol>
      </FlexRow>
    </li>
  );
};

export const PersonalRoadmap = (): ReactElement => {
  const { levels, userProfile, campaign } = useGivebackContext();
  const approved = userProfile.approvedContributionAmount;
  const [claimedRewardIds, setClaimedRewardIds] = useState<Set<string>>(
    new Set(),
  );

  const currentLevel =
    levels.find((level) => level.levelNumber === userProfile.currentLevel) ??
    levels[0];
  const topLevel = levels[levels.length - 1];
  const nextLevel = levels.find(
    (level) => level.requiredApprovedAmount > approved,
  );
  const amountToNext = nextLevel
    ? Math.max(0, nextLevel.requiredApprovedAmount - approved)
    : 0;
  const reachedCount = levels.filter(
    (level) => approved >= level.requiredApprovedAmount,
  ).length;
  const journeyPercentage =
    topLevel.requiredApprovedAmount > 0
      ? Math.min(100, (approved / topLevel.requiredApprovedAmount) * 100)
      : 100;

  const onClaim = (rewardId: string) =>
    setClaimedRewardIds((prev) => new Set(prev).add(rewardId));

  return (
    <section
      id="giveback-roadmap"
      className="relative w-full scroll-mt-16 border-t border-border-subtlest-tertiary pt-8"
    >
      <FlexCol className="gap-6">
        <FlexCol className="gap-1.5">
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
            bold
            className="uppercase tracking-wider"
          >
            Your journey
          </Typography>
          <Typography tag={TypographyTag.H2} type={TypographyType.Title2} bold>
            Your road to {topLevel.name}
          </Typography>
          <Typography
            tag={TypographyTag.P}
            type={TypographyType.Callout}
            color={TypographyColor.Secondary}
          >
            {nextLevel
              ? `${reachedCount} of ${
                  levels.length
                } levels unlocked. ${formatDonationAmount(
                  amountToNext,
                  campaign.currency,
                )} to ${nextLevel.name}.`
              : `All ${levels.length} levels conquered. You're a ${topLevel.name}.`}
          </Typography>
        </FlexCol>

        <FlexRow className="flex-wrap items-center gap-4 rounded-20 bg-surface-float p-4">
          <FlexCol className="size-20 shrink-0 items-center justify-center gap-0.5 rounded-24 bg-gradient-to-br from-accent-cabbage-default to-accent-onion-default text-white shadow-2-cabbage">
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Caption2}
              bold
              className="opacity-90 uppercase tracking-wider"
            >
              Level
            </Typography>
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Title1}
              bold
              className="leading-none"
            >
              {currentLevel.levelNumber}
            </Typography>
          </FlexCol>

          <FlexCol className="min-w-0 flex-1 gap-2">
            <FlexRow className="flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
              <Typography bold type={TypographyType.Title3}>
                {currentLevel.name}
              </Typography>
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
                bold
              >
                {reachedCount} / {levels.length} levels
              </Typography>
            </FlexRow>

            <ProgressBar
              percentage={journeyPercentage}
              shouldShowBg
              className={{
                wrapper: 'h-3 rounded-12',
                bar: 'h-full rounded-12 transition-[width] duration-500',
                barColor:
                  'bg-gradient-to-r from-accent-avocado-default via-accent-cabbage-default to-accent-cheese-default',
              }}
            />

            <FlexRow className="items-center justify-between gap-2">
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.StatusSuccess}
                bold
                className="tabular-nums"
              >
                {formatDonationAmount(approved, campaign.currency)} earned
              </Typography>
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
                className="tabular-nums"
              >
                {nextLevel
                  ? `${formatDonationAmount(
                      topLevel.requiredApprovedAmount,
                      campaign.currency,
                    )} to ${topLevel.name}`
                  : 'Summit reached'}
              </Typography>
            </FlexRow>
          </FlexCol>
        </FlexRow>

        <ol className="flex flex-col gap-2">
          {levels.map((level, index) => {
            const nextNode = levels[index + 1];
            const nextReached = nextNode
              ? approved >= nextNode.requiredApprovedAmount
              : false;

            return (
              <LevelTier
                key={level.id}
                level={level}
                index={index}
                total={levels.length}
                currency={campaign.currency}
                approved={approved}
                currentLevelNumber={userProfile.currentLevel}
                nextLevelId={nextLevel?.id}
                nextReached={nextReached}
                amountToNext={amountToNext}
                isClaimed={
                  !!level.reward && claimedRewardIds.has(level.reward.id)
                }
                onClaim={onClaim}
              />
            );
          })}
        </ol>
      </FlexCol>
    </section>
  );
};
