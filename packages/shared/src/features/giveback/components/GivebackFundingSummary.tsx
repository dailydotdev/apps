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
import { useCountUp, useInView } from '../useGivebackMotion';
import { formatDonationAmount, getGoalProgressPercentage } from '../utils';
import { GivebackMeterShine } from './GivebackMeterShine';

// Compact funding block for the hero sidebar — the Kickstarter "pledge panel"
// summary: raised, goal, progress, backers and time left, at a glance.
export const GivebackFundingSummary = (): ReactElement => {
  const { campaign } = useGivebackContext();
  const percentage = getGoalProgressPercentage(
    campaign.approvedAmount,
    campaign.goalAmount,
  );
  const { ref: meterRef, inView } = useInView<HTMLDivElement>();
  const animatedPercentage = useCountUp(Math.round(percentage), inView);
  return (
    <FlexCol className="gap-3">
      <FlexRow className="items-end gap-2">
        <Typography tag={TypographyTag.Span} type={TypographyType.Title1} bold>
          {formatDonationAmount(campaign.approvedAmount, campaign.currency)}
        </Typography>
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
          className="pb-1"
        >
          pledged of{' '}
          {formatDonationAmount(campaign.goalAmount, campaign.currency)} goal
        </Typography>
      </FlexRow>

      <div className="relative" ref={meterRef}>
        <ProgressBar
          percentage={animatedPercentage}
          shouldShowBg
          className={{
            wrapper: 'h-3 rounded-12',
            bar: 'h-full rounded-12 transition-[width] duration-700 ease-out',
            barColor:
              'bg-gradient-to-r from-accent-avocado-default via-accent-cabbage-default to-accent-cheese-default',
          }}
        />
        <GivebackMeterShine
          percentage={animatedPercentage}
          radiusClassName="rounded-12"
        />
      </div>

      <FlexRow className="flex-wrap items-baseline gap-1">
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Footnote}
          color={TypographyColor.StatusSuccess}
          bold
        >
          {Math.round(percentage)}%
        </Typography>
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          funded · {campaign.backersCount.toLocaleString('en-US')} backers
        </Typography>
      </FlexRow>
    </FlexCol>
  );
};
