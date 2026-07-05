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
import { useAuthContext } from '../../../contexts/AuthContext';
import { useGivebackContribution } from '../hooks/useGivebackContribution';
import { useContributionActions } from '../hooks/useContributionActions';
import { formatDonationAmount } from '../utils';

// Personal stat card above the action catalog. A rounded-square avatar (matching
// daily.dev's app tiles) carries identity with a small level badge tucked in its
// corner; the money you've unlocked is the hero number beside it. Clean and
// concrete, no floating ring, no game-y framing.
export const GivebackContributionSummary = (): ReactElement => {
  const { user } = useAuthContext();
  const { earnedPoints, currentLevel, isPending } =
    useGivebackContribution(true);
  // Shares the catalog's query key, so this adds no extra request.
  const { actions, isPending: isActionsPending } = useContributionActions(true);
  const actionsTaken = actions.reduce(
    (sum, action) => sum + action.userCompletions,
    0,
  );

  if (isPending) {
    // Matches the flat loaded layout (avatar + stat lines) so it doesn't flash
    // from a card into a flat row when data lands.
    return (
      <FlexRow className="items-center gap-4 tablet:gap-5">
        <div className="size-[72px] shrink-0 animate-pulse rounded-16 bg-surface-float" />
        <FlexCol className="min-w-0 flex-1 gap-2">
          <div className="h-7 w-48 max-w-full animate-pulse rounded-8 bg-surface-float" />
          <div className="h-4 w-32 max-w-full animate-pulse rounded-8 bg-surface-float" />
        </FlexCol>
      </FlexRow>
    );
  }

  return (
    <FlexRow className="items-center gap-4 tablet:gap-5">
      {user && (
        <div className="relative shrink-0">
          <ProfilePicture
            user={user}
            size={ProfileImageSize.XXLarge}
            rounded={ProfileImageSize.XXLarge}
            className="ring-1 ring-border-subtlest-tertiary"
          />
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-6 border border-border-subtlest-tertiary bg-background-default px-2 py-0.5 font-bold text-accent-cabbage-default ring-2 ring-background-default typo-caption2">
            Lvl {currentLevel}
          </span>
        </div>
      )}

      <FlexCol className="min-w-0 flex-1 gap-1">
        <Typography
          bold
          type={TypographyType.LargeTitle}
          className="tabular-nums text-status-success"
        >
          {formatDonationAmount(earnedPoints)}
        </Typography>

        {!isActionsPending && (
          <FlexRow className="items-center gap-1.5">
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
            >
              {actionsTaken} {actionsTaken === 1 ? 'action' : 'actions'} taken
            </Typography>
            <span className="group/info relative flex">
              <button
                type="button"
                aria-label="How your contribution is counted"
                className="flex text-text-tertiary transition-colors hover:text-text-primary group-focus-within/info:text-text-primary"
              >
                <InfoIcon size={IconSize.Size16} />
              </button>
              {/* Center on the icon rather than left-anchor: left-0 + w-56 ran
                  the (always-in-layout, opacity-0) tooltip past the right edge,
                  widening the document and expanding the mobile layout viewport
                  - which broke every fixed overlay (e.g. the funnel) on Android. */}
              <span
                role="tooltip"
                className="pointer-events-none absolute left-1/2 top-full z-3 mt-2 w-56 -translate-x-1/2 rounded-10 border border-border-subtlest-tertiary bg-background-default p-2.5 text-left opacity-0 shadow-2 transition-opacity duration-150 group-focus-within/info:opacity-100 group-hover/info:opacity-100"
              >
                <Typography
                  tag={TypographyTag.Span}
                  type={TypographyType.Caption1}
                  color={TypographyColor.Tertiary}
                >
                  It counts the moment you act. We trust you. If something gets
                  rejected, we just subtract it.
                </Typography>
              </span>
            </span>
          </FlexRow>
        )}
      </FlexCol>
    </FlexRow>
  );
};
