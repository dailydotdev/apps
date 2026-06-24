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
import {
  ProfilePicture,
  ProfileImageSize,
} from '../../../components/ProfilePicture';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useGivebackContribution } from '../hooks/useGivebackContribution';
import { useContributionActions } from '../hooks/useContributionActions';
import { formatDonationAmount } from '../utils';

// Personal recap shown above the action catalog: how much the visitor has
// unlocked for their causes and the next reward they're working toward. No
// rank, level or leaderboard - the campaign starts from scratch, so this stays
// a purely personal progress cue.
export const GivebackContributionSummary = (): ReactElement => {
  const { user } = useAuthContext();
  const { earnedPoints, nextReward, pointsToNext, currentLevel, isPending } =
    useGivebackContribution(true);
  // Shares the catalog's query key, so this adds no extra request. Sums the
  // visitor's completions across every action into one "actions taken" count.
  const { actions, isPending: isActionsPending } = useContributionActions(true);
  const actionsTaken = actions.reduce(
    (sum, action) => sum + action.userCompletions,
    0,
  );

  if (isPending) {
    return (
      <FlexCol className="gap-1.5">
        <div className="h-3 w-32 animate-pulse rounded-8 bg-surface-float" />
        <div className="h-8 w-44 animate-pulse rounded-8 bg-surface-float" />
      </FlexCol>
    );
  }

  return (
    <FlexRow className="flex-wrap items-center gap-x-5 gap-y-4">
      {user && (
        <div className="relative shrink-0">
          <ProfilePicture
            user={user}
            size={ProfileImageSize.XXLarge}
            rounded={ProfileImageSize.XXLarge}
            className="ring-2 ring-accent-cabbage-default"
          />
          <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-accent-cabbage-default px-2 py-0.5 font-bold uppercase tracking-wide text-white ring-2 ring-background-default typo-caption2">
            Lvl {currentLevel}
          </span>
        </div>
      )}

      <FlexCol className="min-w-0 flex-1 gap-1">
        <FlexRow className="items-center gap-1">
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
        <FlexRow className="items-baseline gap-1.5">
          <Typography
            bold
            type={TypographyType.Title2}
            className="tabular-nums text-status-success"
          >
            {formatDonationAmount(earnedPoints)}
          </Typography>
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
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
        <FlexCol className="shrink-0 items-end gap-0.5">
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Caption2}
            color={TypographyColor.Tertiary}
            bold
            className="uppercase tracking-wider"
          >
            Next reward
          </Typography>
          <FlexRow className="items-center gap-1.5 text-accent-cheese-default [&_svg]:size-4">
            <GiftIcon />
            <Typography bold type={TypographyType.Footnote}>
              {nextReward.title}
            </Typography>
          </FlexRow>
          <Typography
            tag={TypographyTag.Span}
            bold
            type={TypographyType.Caption1}
            className="tabular-nums text-status-success"
          >
            {formatDonationAmount(pointsToNext)} to go
          </Typography>
        </FlexCol>
      )}
    </FlexRow>
  );
};
