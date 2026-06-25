import type { ReactElement } from 'react';
import React from 'react';
import { FlexCol, FlexRow } from '../../../components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { InfoIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import {
  ProfilePicture,
  ProfileImageSize,
} from '../../../components/ProfilePicture';
import ProgressCircle from '../../../components/ProgressCircle';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useGivebackContribution } from '../hooks/useGivebackContribution';
import { useContributionActions } from '../hooks/useContributionActions';
import { formatDonationAmount } from '../utils';

// Personal status banner above the action catalog. Your face anchors it (this is
// about you), wrapped in a progress ring toward your next level with a level
// badge — status you can feel — and the money you've unlocked is the hero stat.
// The "next reward" detail lives on the sticky footer, so it's not repeated here.
export const GivebackContributionSummary = (): ReactElement => {
  const { user } = useAuthContext();
  const { earnedPoints, currentLevel, progressPercentage, isPending } =
    useGivebackContribution(true);
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
    <FlexRow className="items-center gap-4 tablet:gap-5">
      {user && (
        // Flat, no card: the avatar in a progress ring (momentum to next level)
        // with the level as a quiet label beneath - status without a loud pill.
        <FlexCol className="shrink-0 items-center gap-1.5">
          <div className="relative flex size-[72px] items-center justify-center">
            <div className="absolute inset-0">
              <ProgressCircle progress={progressPercentage} size={72} />
            </div>
            <ProfilePicture
              user={user}
              size={ProfileImageSize.Large}
              rounded={ProfileImageSize.Large}
            />
          </div>
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Caption2}
            bold
            className="uppercase tracking-wider text-accent-cabbage-default"
          >
            Level {currentLevel}
          </Typography>
        </FlexCol>
      )}

      <FlexCol className="min-w-0 flex-1 gap-1">
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
    </FlexRow>
  );
};
