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
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { StarIcon } from '../../../components/icons';
import { useGivebackContext } from '../GivebackContext';
import { useGivebackNav } from '../GivebackNavContext';
import { formatDonationAmount, getGoalProgressPercentage } from '../utils';

// Persistent personal-progress bar. Keeps your level, contribution and the
// primary "take action" CTA one tap away while you read the rest of the page
// (thumb zone on mobile).
export const GivebackFundingBar = (): ReactElement => {
  const { campaign, levels, userProfile } = useGivebackContext();
  const { setActiveTab } = useGivebackNav();

  const approved = userProfile.approvedContributionAmount;
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
  const percentage = getGoalProgressPercentage(
    approved,
    topLevel.requiredApprovedAmount,
  );

  const hasContributed = approved > 0;
  const cta = hasContributed
    ? 'Take your next action'
    : 'Take your first action';
  const subline = nextLevel
    ? `${formatDonationAmount(amountToNext, campaign.currency)} to ${
        nextLevel.name
      } — one action gets you closer.`
    : `Top level reached. You're a ${topLevel.name}.`;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-3">
      <div className="bg-background-default/95 pointer-events-auto relative mx-auto w-full max-w-6xl border-t border-border-subtlest-secondary px-4 py-3 backdrop-blur tablet:rounded-t-16 tablet:border-x">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-0.5 overflow-hidden tablet:rounded-t-16"
        >
          <div
            className="h-full bg-gradient-to-r from-accent-avocado-default via-accent-cabbage-default to-accent-cheese-default"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <FlexRow className="items-center justify-between gap-4">
          <FlexCol className="min-w-0 gap-0.5">
            <FlexRow className="items-center gap-2">
              <span className="shrink-0 rounded-8 bg-accent-cabbage-flat px-2 py-0.5 font-bold text-accent-cabbage-default typo-caption1">
                Lv {currentLevel.levelNumber}
              </span>
              <Typography
                tag={TypographyTag.Span}
                type={TypographyType.Callout}
                bold
              >
                {formatDonationAmount(approved, campaign.currency)}
              </Typography>
              <Typography
                tag={TypographyTag.Span}
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
              >
                unlocked
              </Typography>
            </FlexRow>
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
              className="truncate"
            >
              {subline}
            </Typography>
          </FlexCol>

          <Button
            type="button"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Medium}
            icon={<StarIcon />}
            onClick={() => setActiveTab('actions')}
            className="shrink-0"
          >
            {cta}
          </Button>
        </FlexRow>
      </div>
    </div>
  );
};
