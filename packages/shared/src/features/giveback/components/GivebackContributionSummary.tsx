import type { ReactElement } from 'react';
import React from 'react';
import { FlexCol, FlexRow } from '../../../components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { GiftIcon, InfoIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import ProgressCircle from '../../../components/ProgressCircle';
import { useGivebackContribution } from '../hooks/useGivebackContribution';
import { useContributionActions } from '../hooks/useContributionActions';
import { formatDonationAmount } from '../utils';

// Personal recap above the action catalog. Stat-first: the money you've unlocked
// is the hero number, with a quiet progress ring toward your next reward. No
// level badge or avatar - the campaign is about the donation, not a game rank.
export const GivebackContributionSummary = (): ReactElement => {
  const {
    earnedPoints,
    nextReward,
    pointsToNext,
    progressPercentage,
    isPending,
  } = useGivebackContribution(true);
  // Shares the catalog's query key, so this adds no extra request.
  const { actions, isPending: isActionsPending } = useContributionActions(true);
  const actionsTaken = actions.reduce(
    (sum, action) => sum + action.userCompletions,
    0,
  );

  if (isPending) {
    return <div className="h-28 animate-pulse rounded-16 bg-surface-float" />;
  }

  return (
    <FlexRow className="flex-wrap items-center justify-between gap-x-6 gap-y-4 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4 tablet:p-5">
      <FlexCol className="min-w-0 gap-1">
        <FlexRow className="items-center gap-1.5">
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
            bold
            className="uppercase tracking-wider"
          >
            Your contribution
          </Typography>
          <span className="group/info relative flex">
            <button
              type="button"
              aria-label="How your contribution is counted"
              className="flex text-text-tertiary transition-colors hover:text-text-primary group-focus-within/info:text-text-primary"
            >
              <InfoIcon size={IconSize.Size16} />
            </button>
            <span
              role="tooltip"
              className="pointer-events-none absolute left-0 top-full z-3 mt-2 w-56 rounded-10 border border-border-subtlest-tertiary bg-background-default p-2.5 text-left opacity-0 shadow-2 transition-opacity duration-150 group-focus-within/info:opacity-100 group-hover/info:opacity-100"
            >
              <Typography
                tag={TypographyTag.Span}
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
              >
                Counts the moment you act, because we trust you. If a submission
                is rejected, we&apos;ll subtract it.
              </Typography>
            </span>
          </span>
        </FlexRow>

        <FlexRow className="items-baseline gap-2">
          <Typography
            bold
            type={TypographyType.LargeTitle}
            className="tabular-nums text-status-success"
          >
            {formatDonationAmount(earnedPoints)}
          </Typography>
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Callout}
            color={TypographyColor.Secondary}
          >
            unlocked for your causes
          </Typography>
        </FlexRow>

        {!isActionsPending && (
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            {actionsTaken} {actionsTaken === 1 ? 'action' : 'actions'} taken
          </Typography>
        )}
      </FlexCol>

      {nextReward && (
        <FlexRow className="items-center gap-3 rounded-12 border border-border-subtlest-tertiary bg-background-default px-4 py-3">
          <ProgressCircle progress={progressPercentage} size={44} />
          <FlexCol className="gap-0.5">
            <FlexRow className="items-center gap-1.5 text-accent-cabbage-default [&_svg]:size-4">
              <GiftIcon />
              <Typography
                tag={TypographyTag.Span}
                type={TypographyType.Caption2}
                color={TypographyColor.Tertiary}
                bold
                className="uppercase tracking-wider"
              >
                Next reward
              </Typography>
            </FlexRow>
            <Typography bold type={TypographyType.Footnote}>
              {nextReward.title}
            </Typography>
            <Typography
              tag={TypographyTag.Span}
              bold
              type={TypographyType.Caption1}
              className="tabular-nums text-status-success"
            >
              {formatDonationAmount(pointsToNext)} to go
            </Typography>
          </FlexCol>
        </FlexRow>
      )}
    </FlexRow>
  );
};
