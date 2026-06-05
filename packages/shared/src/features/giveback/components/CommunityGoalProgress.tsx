import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { FlexCol, FlexRow } from '../../../components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { ProgressBar } from '../../../components/fields/ProgressBar';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { useGivebackContext } from '../GivebackContext';
import { useGivebackNav } from '../GivebackNavContext';
import { useCountUp, useInView } from '../useGivebackMotion';
import { formatDonationAmount, getGoalProgressPercentage } from '../utils';
import { GivebackSection } from './GivebackSection';
import { GivebackMeterShine } from './GivebackMeterShine';
import { SponsorBudgetBar } from './SponsorBudgetBar';

const milestones = [25, 50, 75, 100];

export const CommunityGoalProgress = (): ReactElement => {
  const { campaign } = useGivebackContext();
  const { setActiveTab } = useGivebackNav();
  const percentage = getGoalProgressPercentage(
    campaign.approvedAmount,
    campaign.goalAmount,
  );
  // Bar (and milestone dots) grow from 0 the first time the meter scrolls in,
  // so the money raised visibly "fills up". The numeric label counts up to the
  // exact amount, including when the pot grows after an action lands.
  const { ref: meterRef, inView } = useInView<HTMLDivElement>();
  const animatedPercentage = useCountUp(Math.round(percentage), inView);
  const animatedAmount = useCountUp(campaign.approvedAmount, inView, 900);

  const remaining = Math.max(campaign.goalAmount - campaign.approvedAmount, 0);
  const sponsorGoalShare = campaign.goalAmount
    ? Math.round((campaign.sponsoredAmount / campaign.goalAmount) * 100)
    : 0;

  // The funding-stats triplet every backer scans: who's in, how much is still
  // needed to hit the budget, and what's being validated right now.
  const stats: [string, string][] = [
    ['Backers', campaign.backersCount.toLocaleString('en-US')],
    ['Still to raise', formatDonationAmount(remaining, campaign.currency)],
    [
      'In review',
      formatDonationAmount(campaign.pendingAmount, campaign.currency),
    ],
  ];

  return (
    <GivebackSection
      id="giveback-goal"
      title="Funding progress"
      headerActions={
        <FlexCol className="text-right">
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            Goal
          </Typography>
          <Typography type={TypographyType.Title3} bold>
            {formatDonationAmount(campaign.goalAmount, campaign.currency)}
          </Typography>
        </FlexCol>
      }
    >
      <FlexCol className="gap-3">
        <FlexRow className="items-end gap-2">
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Mega1}
            bold
            className="tabular-nums"
          >
            {formatDonationAmount(animatedAmount, campaign.currency)}
          </Typography>
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Title4}
            color={TypographyColor.Tertiary}
            className="pb-1"
          >
            pledged of{' '}
            {formatDonationAmount(campaign.goalAmount, campaign.currency)}
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
          {campaign.backersLast24h > 0 && (
            <FlexRow className="items-center gap-1.5">
              <span className="relative flex size-2">
                <span className="bg-accent-avocado-default/60 absolute inline-flex size-full rounded-full motion-safe:animate-glow-pulse" />
                <span className="relative inline-flex size-2 rounded-full bg-accent-avocado-default" />
              </span>
              <Typography
                tag={TypographyTag.Span}
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
              >
                {campaign.backersLast24h} developers backed in the last 24h
              </Typography>
            </FlexRow>
          )}
        </FlexRow>
      </FlexCol>

      <div className="grid grid-cols-3 divide-x divide-border-subtlest-tertiary">
        {stats.map(([label, value], index) => (
          <FlexCol
            key={label}
            className={classNames(
              'gap-0.5',
              index === 1 && 'px-4 tablet:px-6',
              index === 2 && 'pl-4 tablet:pl-6',
            )}
          >
            <Typography type={TypographyType.Title3} bold>
              {value}
            </Typography>
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
            >
              {label}
            </Typography>
          </FlexCol>
        ))}
      </div>

      {campaign.sponsoredAmount > 0 && (
        <FlexCol className="gap-2 border-t border-border-subtlest-tertiary pt-4">
          <FlexRow className="items-center justify-between gap-3">
            <FlexRow className="items-center gap-2">
              <span className="size-2.5 shrink-0 rounded-full bg-accent-bacon-default" />
              <Typography
                tag={TypographyTag.Span}
                type={TypographyType.Callout}
                bold
              >
                Sponsors topping up the pot
              </Typography>
            </FlexRow>
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Title3}
              bold
              className="tabular-nums text-accent-bacon-default"
            >
              {formatDonationAmount(
                campaign.sponsoredAmount,
                campaign.currency,
              )}
            </Typography>
          </FlexRow>

          <SponsorBudgetBar sponsors={campaign.sponsors} />

          <FlexRow className="flex-wrap items-center justify-between gap-2">
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
            >
              {sponsorGoalShare}% of the{' '}
              {formatDonationAmount(campaign.goalAmount, campaign.currency)}{' '}
              goal · {campaign.sponsors.length} sponsors
            </Typography>
            <Button
              type="button"
              size={ButtonSize.Small}
              variant={ButtonVariant.Float}
              onClick={() => setActiveTab('sponsors')}
            >
              Become a sponsor
            </Button>
          </FlexRow>
        </FlexCol>
      )}

      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
      >
        Funded by daily.dev, not you. Only approved actions count toward the
        goal.
      </Typography>
    </GivebackSection>
  );
};
