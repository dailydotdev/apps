import type { ReactElement } from 'react';
import React, { useState } from 'react';
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
import { useCountUp, useInView } from '../useGivebackMotion';
import { formatDonationAmount, getGoalProgressPercentage } from '../utils';
import { GivebackSection } from './GivebackSection';
import { GivebackMeterShine } from './GivebackMeterShine';
import { SponsorBudgetBar } from './SponsorBudgetBar';
import { GivebackSponsorModal } from './GivebackSponsorModal';

const milestones = [25, 50, 75, 100];

export const CommunityGoalProgress = (): ReactElement => {
  const { campaign } = useGivebackContext();
  const [isSponsorModalOpen, setIsSponsorModalOpen] = useState(false);
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

  const sponsorGoalShare = campaign.goalAmount
    ? Math.round((campaign.sponsoredAmount / campaign.goalAmount) * 100)
    : 0;
  const hasSponsors = campaign.sponsoredAmount > 0;

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
                      {campaign.backersLast24h} developers backed in the last
                      24h
                    </Typography>
                  </FlexRow>
                )}
              </FlexRow>

              <Typography
                tag={TypographyTag.Span}
                type={TypographyType.Callout}
                color={TypographyColor.Tertiary}
              >
                <span className="font-bold text-text-primary">
                  {campaign.backersCount.toLocaleString('en-US')}
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
                  {formatDonationAmount(
                    campaign.sponsoredAmount,
                    campaign.currency,
                  )}
                </Typography>
              </FlexRow>

              <SponsorBudgetBar
                sponsors={campaign.sponsors}
                onSelect={() => setIsSponsorModalOpen(true)}
              />

              <FlexCol className="items-start gap-2">
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
                  onClick={() => setIsSponsorModalOpen(true)}
                  className="mt-2"
                >
                  Become a sponsor
                </Button>
              </FlexCol>
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

      {isSponsorModalOpen && (
        <GivebackSponsorModal onClose={() => setIsSponsorModalOpen(false)} />
      )}
    </GivebackSection>
  );
};
