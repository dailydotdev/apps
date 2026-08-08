import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Button } from '../../../components/buttons/Button';
import { ButtonSize, ButtonVariant } from '../../../components/buttons/common';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { ShareIcon } from '../../../components/icons';
import type { DealBoost, DealBoostTier } from '../types';
import { formatCompactNumber, formatFullNumber } from '../dealsFormat';

interface DealBoostMeterProps {
  boost: DealBoost;
  onBoost?: () => void;
  compact?: boolean;
  className?: string;
}

interface BoostProgress {
  nextTier?: DealBoostTier;
  reachedPercent: number;
  topPercent: number;
  maxClaims: number;
  claimsToNext: number;
  progress: number;
}

const getBoostProgress = ({
  tiers,
  currentClaims,
}: DealBoost): BoostProgress => {
  const topTier = tiers[tiers.length - 1];

  if (!topTier) {
    throw new Error('DealBoostMeter needs a boost with at least one tier');
  }

  const nextTier = tiers.find((tier) => tier.claims > currentClaims);
  const reachedTier = [...tiers]
    .reverse()
    .find((tier) => tier.claims <= currentClaims);

  return {
    nextTier,
    reachedPercent: reachedTier?.percent ?? 0,
    topPercent: topTier.percent,
    maxClaims: topTier.claims,
    claimsToNext: nextTier ? nextTier.claims - currentClaims : 0,
    progress: nextTier
      ? Math.min(100, Math.round((currentClaims / nextTier.claims) * 100))
      : 100,
  };
};

export const DealBoostMeter = ({
  boost,
  onBoost,
  compact,
  className,
}: DealBoostMeterProps): ReactElement => {
  const { tiers, currentClaims } = boost;
  const {
    nextTier,
    reachedPercent,
    topPercent,
    maxClaims,
    claimsToNext,
    progress,
  } = getBoostProgress(boost);
  const unlockedLabel = reachedPercent
    ? `unlocked ${reachedPercent}% off`
    : 'in so far';

  if (compact) {
    return (
      <div className={classNames('flex flex-col gap-1', className)}>
        <div
          role="progressbar"
          aria-label="Progress to the next community boost tier"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          className="h-1 w-full overflow-hidden rounded-8 bg-surface-float"
        >
          <div
            className="h-full rounded-8 bg-action-upvote-default"
            style={{ width: `${progress}%` }}
          />
        </div>
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
          className="tabular-nums"
        >
          {formatCompactNumber(currentClaims)} claims {unlockedLabel}
          {nextTier
            ? `. ${formatCompactNumber(nextTier.claims)} unlocks ${
                nextTier.percent
              }%`
            : '. Top tier reached'}
        </Typography>
      </div>
    );
  }

  const trackFill = Math.min(100, (currentClaims / maxClaims) * 100);

  return (
    <div
      className={classNames(
        'flex flex-col gap-4 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          Community boost
        </Typography>
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Callout}
          color={
            reachedPercent
              ? TypographyColor.StatusSuccess
              : TypographyColor.Tertiary
          }
          bold
          className="tabular-nums"
        >
          {reachedPercent
            ? `${reachedPercent}% off right now`
            : 'No tier unlocked yet'}
        </Typography>
      </div>

      <div className="flex flex-col gap-2">
        <div
          role="progressbar"
          aria-label="Community claims against the boost ladder"
          aria-valuemin={0}
          aria-valuemax={maxClaims}
          aria-valuenow={Math.min(currentClaims, maxClaims)}
          aria-valuetext={`${formatFullNumber(
            currentClaims,
          )} of ${formatFullNumber(maxClaims)} claims`}
          className="relative h-2 w-full overflow-hidden rounded-8 bg-surface-secondary"
        >
          <div
            className="h-full rounded-8 bg-action-upvote-default"
            style={{ width: `${trackFill}%` }}
          />
          {tiers.slice(1).map((tier) => (
            <span
              key={`tick-${tier.claims}`}
              className="absolute top-0 h-full w-0.5 bg-background-default"
              style={{ left: `${(tier.claims / maxClaims) * 100}%` }}
            />
          ))}
        </div>
        <div className="relative h-8">
          {tiers.map((tier, index) => {
            const isReached = tier.claims <= currentClaims;
            const isLast = index === tiers.length - 1;
            const offset = (tier.claims / maxClaims) * 100;

            return (
              <span
                key={`tier-${tier.claims}`}
                className="absolute top-0 flex flex-col"
                style={{
                  left: isLast ? undefined : `${offset}%`,
                  right: isLast ? 0 : undefined,
                  transform:
                    index === 0 || isLast ? undefined : 'translateX(-50%)',
                  alignItems: isLast ? 'flex-end' : 'flex-start',
                }}
              >
                <Typography
                  tag={TypographyTag.Span}
                  type={TypographyType.Footnote}
                  color={
                    isReached
                      ? TypographyColor.StatusSuccess
                      : TypographyColor.Tertiary
                  }
                  bold
                  className="tabular-nums"
                >
                  {tier.percent}%
                </Typography>
                <Typography
                  tag={TypographyTag.Span}
                  type={TypographyType.Caption2}
                  color={TypographyColor.Quaternary}
                  className="whitespace-nowrap tabular-nums"
                >
                  {tier.claims === 0
                    ? 'from the start'
                    : `at ${formatFullNumber(tier.claims)}`}
                </Typography>
              </span>
            );
          })}
        </div>
      </div>

      <Typography
        tag={TypographyTag.P}
        type={TypographyType.Footnote}
        color={TypographyColor.Primary}
        className="tabular-nums"
      >
        {nextTier
          ? `${formatFullNumber(claimsToNext)} claims to unlock ${
              nextTier.percent
            }% for everyone`
          : `Top tier unlocked. Everyone gets ${topPercent}% off.`}
      </Typography>

      <div className="flex items-center justify-between gap-3">
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
          className="tabular-nums"
        >
          {formatFullNumber(currentClaims)} members claimed so far
        </Typography>
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          icon={<ShareIcon />}
          onClick={onBoost}
        >
          Share to boost
        </Button>
      </div>
    </div>
  );
};
