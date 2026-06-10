import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import { FlexCol, FlexRow } from '../../../components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { ProgressBar } from '../../../components/fields/ProgressBar';
import { useContributionStatus } from '../hooks/useContributionStatus';
import { useContributionSponsors } from '../hooks/useContributionSponsors';
import { useCountUp, useInView } from '../useGivebackMotion';
import { formatDonationAmount, getGoalProgressPercentage } from '../utils';
import { GivebackSection } from './GivebackSection';
import { GivebackMeterShine } from './GivebackMeterShine';
import { GivebackSponsorBudgetBar } from './GivebackSponsorBudgetBar';
import type { BudgetSponsor } from './GivebackSponsorBudgetBar';

const milestones = [25, 50, 75, 100];

// Campaign funding for the Impact tab: how much the community has unlocked of
// the goal, plus the sponsors topping up the pot. All numbers are live from the
// public contribution status; sponsor amounts come back in cents.
export const GivebackCommunityGoalProgress = (): ReactElement => {
  const { status } = useContributionStatus();
  const { sponsors } = useContributionSponsors();

  const approvedAmount = status?.currentCyclePoints ?? 0;
  const goalAmount = status?.currentCycleTargetPoints ?? 0;
  const backersCount = status?.contributorsCount ?? 0;

  const budgetSponsors = useMemo<BudgetSponsor[]>(
    () =>
      sponsors.map((sponsor) => ({
        id: sponsor.id,
        name: sponsor.name,
        amount: sponsor.amountCents / 100,
        logoUrl: sponsor.logoUrl,
      })),
    [sponsors],
  );
  const sponsoredAmount = budgetSponsors.reduce(
    (sum, sponsor) => sum + sponsor.amount,
    0,
  );
  const hasSponsors = sponsoredAmount > 0;

  const percentage = getGoalProgressPercentage(approvedAmount, goalAmount);
  // Bar (and milestone dots) grow from 0 the first time the meter scrolls in, so
  // the money raised visibly "fills up". The numeric label counts up to the
  // exact amount, including when the pot grows after an action lands.
  const { ref: meterRef, inView } = useInView<HTMLDivElement>();
  const animatedPercentage = useCountUp(Math.round(percentage), inView);
  const animatedAmount = useCountUp(approvedAmount, inView, 900);

  const sponsorGoalShare = goalAmount
    ? Math.round((sponsoredAmount / goalAmount) * 100)
    : 0;

  if (!status || goalAmount === 0) {
    return (
      <GivebackSection id="giveback-goal" title="Funding progress">
        <FlexCol className="gap-3">
          <div className="h-10 w-48 animate-pulse rounded-8 bg-surface-float" />
          <div className="h-5 w-full animate-pulse rounded-16 bg-surface-float" />
          <div className="h-4 w-40 animate-pulse rounded-8 bg-surface-float" />
        </FlexCol>
      </GivebackSection>
    );
  }

  return (
    <GivebackSection id="giveback-goal" title="Funding progress">
      <FlexCol className="gap-2">
        <div
          className={classNames(
            'grid items-start gap-8',
            hasSponsors && 'laptop:grid-cols-2 laptop:gap-12',
          )}
        >
          <FlexCol className="gap-6">
            <FlexCol className="gap-3">
              <FlexRow className="items-end gap-2">
                <Typography
                  tag={TypographyTag.Span}
                  type={TypographyType.Mega1}
                  bold
                  className="tabular-nums"
                >
                  {formatDonationAmount(animatedAmount)}
                </Typography>
                <Typography
                  tag={TypographyTag.Span}
                  type={TypographyType.Title4}
                  color={TypographyColor.Tertiary}
                  className="pb-1"
                >
                  pledged of {formatDonationAmount(goalAmount)}
                </Typography>
              </FlexRow>

              <div className="relative" ref={meterRef}>
                <ProgressBar
                  percentage={animatedPercentage}
                  shouldShowBg
                  className={{
                    wrapper: 'h-5 rounded-16',
                    bar: 'h-full rounded-16 transition-[width] duration-700 ease-out',
                    barColor:
                      'bg-gradient-to-r from-accent-avocado-default via-accent-cabbage-default to-accent-cheese-default',
                  }}
                />
                <GivebackMeterShine percentage={animatedPercentage} />
                <FlexRow className="absolute left-0 right-0 top-0 h-5 items-center justify-between px-1">
                  {milestones.map((milestone) => (
                    <span
                      key={milestone}
                      className={classNames(
                        'size-2 rounded-full ring-2 ring-background-default transition-colors duration-300',
                        animatedPercentage >= milestone
                          ? 'bg-accent-cheese-default'
                          : 'bg-accent-pepper-subtler',
                      )}
                    />
                  ))}
                </FlexRow>
              </div>

              <FlexRow className="flex-wrap items-center justify-between gap-2">
                <Typography
                  tag={TypographyTag.Span}
                  type={TypographyType.Callout}
                  color={TypographyColor.StatusSuccess}
                  bold
                >
                  {Math.round(percentage)}% funded
                </Typography>
              </FlexRow>

              <Typography
                tag={TypographyTag.Span}
                type={TypographyType.Callout}
                color={TypographyColor.Tertiary}
              >
                <span className="font-bold text-text-primary">
                  {backersCount.toLocaleString('en-US')}
                </span>{' '}
                total backers
              </Typography>
            </FlexCol>
          </FlexCol>

          {hasSponsors && (
            <FlexCol className="gap-2 border-t border-border-subtlest-tertiary pt-4 laptop:border-t-0 laptop:pt-0">
              <FlexRow className="items-center justify-between gap-3">
                <Typography
                  tag={TypographyTag.Span}
                  type={TypographyType.Callout}
                  bold
                >
                  Sponsors topping up the pot
                </Typography>
                <Typography
                  tag={TypographyTag.Span}
                  type={TypographyType.Title3}
                  bold
                  className="tabular-nums text-status-success"
                >
                  {formatDonationAmount(sponsoredAmount)}
                </Typography>
              </FlexRow>

              <GivebackSponsorBudgetBar sponsors={budgetSponsors} />

              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
                className="mt-2"
              >
                {sponsorGoalShare}% of the {formatDonationAmount(goalAmount)}{' '}
                goal · {budgetSponsors.length} sponsors
              </Typography>
            </FlexCol>
          )}
        </div>

        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
        >
          Funded by daily.dev, not you. Only approved actions count toward the
          goal.
        </Typography>
      </FlexCol>
    </GivebackSection>
  );
};
