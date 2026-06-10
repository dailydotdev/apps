import type { ReactElement } from 'react';
import React from 'react';
import { FlexCol, FlexRow } from '../../../components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import {
  GiftIcon,
  MedalBadgeIcon,
  OpenLinkIcon,
  SparkleIcon,
} from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent } from '../../../lib/log';
import { anchorDefaultRel } from '../../../lib/strings';
import { useGivebackContribution } from '../hooks/useGivebackContribution';
import { useContributionImpact } from '../hooks/useContributionImpact';
import { CauseEmblem } from './CauseEmblem';
import { UserContributionRewardStatus } from '../types';
import type { ContributionCauseStat, UserContributionReward } from '../types';
import { formatDonationAmount, formatDonationAmountCents } from '../utils';

const StatTile = ({
  label,
  value,
  accentClass,
}: {
  label: string;
  value: string;
  accentClass?: string;
}): ReactElement => (
  <FlexCol className="gap-1 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4">
    <Typography
      bold
      type={TypographyType.Title2}
      className={accentClass ?? 'text-text-primary'}
    >
      {value}
    </Typography>
    <Typography
      tag={TypographyTag.Span}
      type={TypographyType.Caption1}
      color={TypographyColor.Tertiary}
      className="uppercase tracking-wider"
    >
      {label}
    </Typography>
  </FlexCol>
);

const CauseStatRow = ({
  stat,
  index,
  share,
  onCauseClick,
}: {
  stat: ContributionCauseStat;
  index: number;
  // 0-100 width of the bar, scaled so the largest cause reads as full.
  share: number;
  onCauseClick: (stat: ContributionCauseStat) => void;
}): ReactElement => {
  const { cause } = stat;

  return (
    <FlexRow className="items-center gap-3 rounded-16 border border-border-subtlest-tertiary p-3">
      <CauseEmblem cause={cause} index={index} />
      <FlexCol className="min-w-0 flex-1 gap-1.5">
        <FlexRow className="items-center gap-1.5">
          {cause.url ? (
            <a
              href={cause.url}
              target="_blank"
              rel={anchorDefaultRel}
              onClick={() => onCauseClick(stat)}
              className="group/cause inline-flex min-w-0 items-center gap-1 text-text-primary hover:text-text-link"
            >
              <Typography
                tag={TypographyTag.Span}
                bold
                type={TypographyType.Callout}
                className="truncate"
              >
                {cause.title}
              </Typography>
              <OpenLinkIcon
                size={IconSize.Size16}
                className="shrink-0 opacity-0 transition-opacity group-hover/cause:opacity-100"
              />
            </a>
          ) : (
            <Typography
              tag={TypographyTag.Span}
              bold
              type={TypographyType.Callout}
              className="truncate"
            >
              {cause.title}
            </Typography>
          )}
        </FlexRow>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-float">
          <div
            className="h-full rounded-full bg-accent-cabbage-default"
            style={{ width: `${share}%` }}
          />
        </div>
      </FlexCol>
      <Typography
        bold
        type={TypographyType.Callout}
        className="shrink-0 tabular-nums text-status-success"
      >
        {formatDonationAmountCents(stat.amountCents)}
      </Typography>
    </FlexRow>
  );
};

const rewardStatusLabel: Record<UserContributionRewardStatus, string> = {
  [UserContributionRewardStatus.Claimed]: 'Claimed',
  [UserContributionRewardStatus.Fulfilled]: 'Delivered',
};

const RewardRow = ({
  reward,
}: {
  reward: UserContributionReward;
}): ReactElement => (
  <FlexRow className="items-center gap-3 rounded-16 border border-border-subtlest-tertiary p-3">
    <span className="flex size-11 shrink-0 items-center justify-center rounded-16 bg-accent-cheese-flat text-accent-cheese-default">
      <GiftIcon size={IconSize.Medium} />
    </span>
    <Typography
      tag={TypographyTag.Span}
      bold
      type={TypographyType.Callout}
      className="min-w-0 flex-1 truncate"
    >
      {reward.tier.title}
    </Typography>
    <FlexRow className="shrink-0 items-center gap-1 rounded-full bg-surface-float px-2.5 py-1 text-accent-avocado-default">
      <MedalBadgeIcon size={IconSize.Size16} />
      <Typography tag={TypographyTag.Span} bold type={TypographyType.Caption1}>
        {rewardStatusLabel[reward.status]}
      </Typography>
    </FlexRow>
  </FlexRow>
);

const SectionHeader = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}): ReactElement => (
  <FlexCol className="gap-0.5">
    <Typography tag={TypographyTag.H3} bold type={TypographyType.Body}>
      {title}
    </Typography>
    <Typography type={TypographyType.Footnote} color={TypographyColor.Tertiary}>
      {subtitle}
    </Typography>
  </FlexCol>
);

// The Impact tab: a purely personal recap of what the visitor has funded and
// the rewards they've earned. No leaderboard or live community feed — the
// campaign starts from scratch, so this stays the visitor's own story. The
// per-cause breakdown reflects only finalized payments, so it carries a clear
// empty state until the first contribution is processed.
export const GivebackImpactPanel = (): ReactElement => {
  const { logEvent } = useLogContext();
  const { earnedPoints, isPending: isContributionPending } =
    useGivebackContribution(true);
  const { causeStats, rewards, isPending } = useContributionImpact(true);

  const onCauseClick = (stat: ContributionCauseStat) => {
    logEvent({
      event_name: LogEvent.ClickGivebackImpactCause,
      target_id: stat.cause.id,
    });
  };

  if (isPending || isContributionPending) {
    return (
      <FlexCol role="status" aria-label="Loading impact" className="gap-6">
        <div className="grid gap-3 tablet:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              className="h-20 animate-pulse rounded-16 bg-surface-float"
            />
          ))}
        </div>
        <div className="h-40 animate-pulse rounded-16 bg-surface-float" />
      </FlexCol>
    );
  }

  const maxAmount = causeStats.reduce(
    (max, stat) => Math.max(max, stat.amountCents),
    0,
  );

  return (
    <FlexCol className="gap-8">
      <div className="grid gap-3 tablet:grid-cols-3">
        <StatTile
          label="Unlocked for causes"
          value={formatDonationAmount(earnedPoints)}
          accentClass="text-status-success"
        />
        <StatTile
          label={
            causeStats.length === 1 ? 'Cause supported' : 'Causes supported'
          }
          value={`${causeStats.length}`}
        />
        <StatTile
          label={rewards.length === 1 ? 'Reward earned' : 'Rewards earned'}
          value={`${rewards.length}`}
        />
      </div>

      <FlexCol className="gap-3">
        <SectionHeader
          title="Where your funding goes"
          subtitle="Your contribution, split across the causes you've funded."
        />
        {causeStats.length > 0 ? (
          <FlexCol className="gap-2">
            {causeStats.map((stat, index) => (
              <CauseStatRow
                key={stat.cause.id}
                stat={stat}
                index={index}
                share={maxAmount > 0 ? (stat.amountCents / maxAmount) * 100 : 0}
                onCauseClick={onCauseClick}
              />
            ))}
          </FlexCol>
        ) : (
          <FlexCol className="items-center gap-2 rounded-16 border border-dashed border-border-subtlest-tertiary p-8 text-center">
            <span className="flex size-12 items-center justify-center rounded-16 bg-accent-cabbage-flat text-accent-cabbage-default">
              <SparkleIcon size={IconSize.Medium} />
            </span>
            <Typography bold type={TypographyType.Callout}>
              Your funded causes will show up here
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              className="max-w-sm"
            >
              The moment your contributions are processed, you&apos;ll see
              exactly how much you sent to each cause.
            </Typography>
          </FlexCol>
        )}
      </FlexCol>

      <FlexCol className="gap-3">
        <SectionHeader
          title="Rewards earned"
          subtitle="Perks you've unlocked by crossing reward tiers."
        />
        {rewards.length > 0 ? (
          <FlexCol className="gap-2">
            {rewards.map((reward) => (
              <RewardRow key={reward.tier.id} reward={reward} />
            ))}
          </FlexCol>
        ) : (
          <FlexRow className="items-center gap-3 rounded-16 border border-dashed border-border-subtlest-tertiary p-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-16 bg-surface-float text-text-tertiary">
              <GiftIcon size={IconSize.Medium} />
            </span>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              No rewards yet. Cross a reward tier on the Take action tab to
              unlock your first perk.
            </Typography>
          </FlexRow>
        )}
      </FlexCol>
    </FlexCol>
  );
};
