import type { ReactElement, RefObject } from 'react';
import React from 'react';
import { FlexCol, FlexRow } from '../../../components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { ProgressBar } from '../../../components/fields/ProgressBar';
import { useContributionStatus } from '../hooks/useContributionStatus';
import { useCountUp, useInView } from '../useGivebackMotion';
import { formatDonationAmount, getGoalProgressPercentage } from '../utils';
import { GivebackMeterShine } from './GivebackMeterShine';

const barColor =
  'bg-gradient-to-r from-accent-avocado-default via-accent-cabbage-default to-accent-cheese-default';

const Meter = ({
  meterRef,
  percentage,
  empty = false,
}: {
  meterRef: RefObject<HTMLDivElement>;
  percentage: number;
  empty?: boolean;
}): ReactElement => (
  // The track owns the styling: a dark (primary background) fill with a hairline
  // border so the meter reads as a crisp, contained gauge rather than a flat bar.
  <div
    ref={meterRef}
    className="relative h-3 overflow-hidden rounded-12 border border-border-subtlest-tertiary bg-background-default"
  >
    <ProgressBar
      percentage={percentage}
      className={{
        bar: 'block h-full rounded-12 transition-[width] duration-700 ease-out',
        barColor,
      }}
    />
    {empty ? (
      // A faint shimmer travelling across the empty track so a $0 meter reads as
      // "ready to fill" rather than broken.
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-12"
      >
        <div className="via-accent-cabbage-default/40 absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent to-transparent motion-safe:animate-meter-shine" />
      </div>
    ) : (
      <GivebackMeterShine
        percentage={percentage}
        radiusClassName="rounded-12"
      />
    )}
  </div>
);

// Compact funding block for the hero sidebar - the crowdfunding "pledge panel":
// raised, goal and progress at a glance. Points come back from the contribution
// API as whole currency units, so they format directly as dollars.
export const GivebackFundingSummary = (): ReactElement => {
  const { status } = useContributionStatus();
  const { ref: meterRef, inView } = useInView<HTMLDivElement>();

  const raised = status?.currentCyclePoints ?? 0;
  const goal = status?.currentCycleTargetPoints ?? 0;
  const contributorsCount = status?.contributorsCount ?? 0;
  const percentage = getGoalProgressPercentage(raised, goal);
  const animatedPercentage = useCountUp(Math.round(percentage), inView);

  // No data yet (or no goal configured): a quiet skeleton so we never flash a
  // wall of zeros before the campaign numbers land.
  if (!status || goal === 0) {
    return (
      <FlexCol className="gap-3">
        <div className="h-8 w-40 animate-pulse rounded-8 bg-surface-float" />
        <div className="h-3 w-full rounded-12 bg-surface-float" />
        <div className="h-4 w-48 animate-pulse rounded-8 bg-surface-float" />
      </FlexCol>
    );
  }

  // Empty state: nothing pledged yet. Lead with the goal so the panel feels
  // aspirational instead of showing "$0 · 0% · 0 backers" everywhere.
  if (raised === 0) {
    return (
      <FlexCol className="gap-3">
        <FlexRow className="items-end gap-2">
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Title1}
            bold
          >
            {formatDonationAmount(goal)}
          </Typography>
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
            className="pb-1"
          >
            goal to unlock for good causes
          </Typography>
        </FlexRow>

        <Meter meterRef={meterRef} percentage={0} empty />

        <FlexRow className="flex-wrap items-baseline gap-1">
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Footnote}
            color={TypographyColor.Primary}
            bold
          >
            Be the first to back this.
          </Typography>
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            Take an action to start the meter.
          </Typography>
        </FlexRow>
      </FlexCol>
    );
  }

  return (
    <FlexCol className="gap-3">
      <FlexRow className="items-end gap-2">
        <Typography tag={TypographyTag.Span} type={TypographyType.Title1} bold>
          {formatDonationAmount(raised)}
        </Typography>
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
          className="pb-1"
        >
          pledged of {formatDonationAmount(goal)} goal
        </Typography>
      </FlexRow>

      <Meter meterRef={meterRef} percentage={animatedPercentage} />

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
          funded · {contributorsCount.toLocaleString('en-US')} backers
        </Typography>
      </FlexRow>
    </FlexCol>
  );
};
