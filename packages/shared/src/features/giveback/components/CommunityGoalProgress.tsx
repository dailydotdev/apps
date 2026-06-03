import type { ReactElement } from 'react';
import React from 'react';
import { FlexCol, FlexRow } from '../../../components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { ProgressBar } from '../../../components/fields/ProgressBar';
import { useGivebackContext } from '../GivebackContext';
import { formatDonationAmount, getGoalProgressPercentage } from '../utils';

export const CommunityGoalProgress = (): ReactElement => {
  const { campaign } = useGivebackContext();
  const percentage = getGoalProgressPercentage(
    campaign.approvedAmount,
    campaign.goalAmount,
  );

  return (
    <FlexCol className="w-full gap-4 rounded-24 border border-border-subtlest-tertiary bg-surface-float p-6">
      <FlexRow className="flex-wrap items-end justify-between gap-2">
        <FlexCol className="gap-1">
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            Community goal
          </Typography>
          <Typography tag={TypographyTag.Span} type={TypographyType.Mega2} bold>
            {formatDonationAmount(campaign.approvedAmount, campaign.currency)}
          </Typography>
        </FlexCol>
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Title3}
          color={TypographyColor.Tertiary}
        >
          of {formatDonationAmount(campaign.goalAmount, campaign.currency)}
        </Typography>
      </FlexRow>

      <FlexCol className="gap-2">
        <ProgressBar
          percentage={percentage}
          shouldShowBg
          className={{
            wrapper: 'h-3 rounded-12',
            bar: 'h-full rounded-12',
            barColor: 'bg-accent-avocado-default',
          }}
        />
        <FlexRow className="items-center justify-between">
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Caption1}
            color={TypographyColor.StatusSuccess}
            bold
          >
            {Math.round(percentage)}% unlocked
          </Typography>
          {campaign.pendingAmount > 0 && (
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
            >
              +{formatDonationAmount(campaign.pendingAmount, campaign.currency)}{' '}
              pending validation
            </Typography>
          )}
        </FlexRow>
      </FlexCol>

      <Typography
        tag={TypographyTag.P}
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        daily.dev funds the donation. Approved actions move the community closer
        to the goal.
      </Typography>
    </FlexCol>
  );
};
