import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol, FlexRow } from '../../../components/utilities';
import { useGivebackContext } from '../GivebackContext';
import { formatDonationAmount, getGoalProgressPercentage } from '../utils';
import { GivebackSection } from './GivebackSection';

const getMilestoneHeadline = (
  celebrationState: 'none' | 'milestone' | 'complete',
  progress: number,
  amount: string,
): string => {
  if (celebrationState === 'complete' || progress >= 100) {
    return `We unlocked the full ${amount} goal.`;
  }

  if (celebrationState === 'milestone' || progress >= 50) {
    return `We just unlocked ${amount} for good causes.`;
  }

  return `Help unlock ${amount} for good causes.`;
};

const campaignSteps: [string, string][] = [
  ['Now', 'Celebrate'],
  ['Next', 'Report receipts'],
  ['Then', 'Next campaign'],
];

// Lemonade's strongest move: translate donations into tangible human outcomes,
// not just dollars. These are illustrative projections for the goal, mapped to
// the real causes the community can pick.
const impactOutcomes: [string, string, string, string][] = [
  [
    '3,200 students',
    'introduced to computer science',
    'Code.org',
    'text-accent-cabbage-default',
  ],
  [
    '750 girls',
    'join their first coding club',
    'Girls Who Code',
    'text-accent-cheese-default',
  ],
  [
    '40,000 pages',
    'kept free and online for everyone',
    'Internet Archive',
    'text-accent-avocado-default',
  ],
  [
    '1,100 people',
    'with digital rights defended',
    'EFF',
    'text-accent-onion-default',
  ],
];

export const CommunityImpactSection = (): ReactElement => {
  const {
    campaign,
    celebrationState,
    communityEvents,
    donationAccounting,
    showCommunityFeed,
  } = useGivebackContext();
  const progress = getGoalProgressPercentage(
    campaign.approvedAmount,
    campaign.goalAmount,
  );
  const milestoneHeadline = getMilestoneHeadline(
    celebrationState,
    progress,
    formatDonationAmount(campaign.approvedAmount, campaign.currency),
  );

  const transparencyStats: [string, number][] = [
    ['Approved', campaign.approvedAmount],
    ['Pending', campaign.pendingAmount],
    ['User approved', donationAccounting.approvedDonationAmount],
    ['User rejected', donationAccounting.rejectedDonationAmount],
  ];

  return (
    <GivebackSection id="giveback-impact" title="Community impact">
      <FlexCol className="gap-1 border-l-2 border-accent-cheese-default pl-4">
        <Typography bold type={TypographyType.Title4}>
          {progress >= 100
            ? 'The full goal is ready for reporting.'
            : `${Math.round(progress)}% unlocked by the community`}
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          Money moved from ad platforms to real causes. Share it.
        </Typography>
      </FlexCol>

      <FlexCol className="gap-4">
        <FlexCol className="gap-1">
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
            bold
            className="uppercase tracking-wider"
          >
            In real terms
          </Typography>
          <Typography bold type={TypographyType.Title4}>
            Your dollars become real outcomes
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            What the{' '}
            {formatDonationAmount(campaign.goalAmount, campaign.currency)} goal
            can fund for the causes you pick.
          </Typography>
        </FlexCol>
        <div className="grid grid-cols-2 gap-x-6 gap-y-5 tablet:grid-cols-4 tablet:divide-x tablet:divide-border-subtlest-tertiary">
          {impactOutcomes.map(([value, label, cause, accent], index) => (
            <FlexCol
              key={cause}
              className={classNames('gap-1', index > 0 && 'tablet:pl-6')}
            >
              <Typography bold type={TypographyType.Title3} className={accent}>
                {value}
              </Typography>
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Secondary}
              >
                {label}
              </Typography>
              <Typography
                type={TypographyType.Caption2}
                color={TypographyColor.Tertiary}
                bold
                className="uppercase tracking-wider"
              >
                {cause}
              </Typography>
            </FlexCol>
          ))}
        </div>
      </FlexCol>

      <div className="grid gap-6 tablet:grid-cols-[1.2fr_0.8fr]">
        <FlexCol className="gap-2">
          <Typography
            type={TypographyType.Caption1}
            bold
            className="uppercase tracking-wider text-accent-onion-default"
          >
            In the feed
          </Typography>
          <Typography bold type={TypographyType.Title4}>
            {milestoneHeadline}
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            Milestone moments your whole community sees.
          </Typography>
        </FlexCol>

        <FlexCol className="gap-2.5 tablet:border-l tablet:border-border-subtlest-tertiary tablet:pl-6">
          {campaignSteps.map(([label, value]) => (
            <FlexRow key={label} className="items-center gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-10 bg-surface-float font-bold text-text-secondary typo-caption1">
                {label}
              </span>
              <Typography type={TypographyType.Footnote}>{value}</Typography>
            </FlexRow>
          ))}
        </FlexCol>
      </div>

      <FlexCol className="gap-3 border-t border-border-subtlest-tertiary pt-6">
        <FlexCol className="gap-1">
          <Typography bold type={TypographyType.Callout}>
            Impact transparency
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            daily.dev funds it. Only approved value counts.
          </Typography>
        </FlexCol>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 tablet:grid-cols-4 tablet:divide-x tablet:divide-border-subtlest-tertiary">
          {transparencyStats.map(([label, value], index) => (
            <FlexCol
              key={label}
              className={classNames('gap-0.5', index > 0 && 'tablet:pl-6')}
            >
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
              >
                {label}
              </Typography>
              <Typography bold type={TypographyType.Title4}>
                {formatDonationAmount(value, campaign.currency)}
              </Typography>
            </FlexCol>
          ))}
        </div>
      </FlexCol>

      <FlexCol className="gap-3 border-t border-border-subtlest-tertiary pt-6">
        <FlexRow className="items-center justify-between gap-3">
          <Typography bold tag={TypographyTag.H3} type={TypographyType.Callout}>
            Community activity
          </Typography>
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            anonymized by default
          </Typography>
        </FlexRow>

        {showCommunityFeed && communityEvents.length ? (
          <FlexCol className="divide-y divide-border-subtlest-tertiary border-t border-border-subtlest-tertiary">
            {communityEvents.map((event) => (
              <FlexRow
                key={event.id}
                className="items-start justify-between gap-3 py-3"
              >
                <FlexCol className="gap-0.5">
                  <Typography bold type={TypographyType.Footnote}>
                    {event.actorLabel} {event.actionLabel}
                  </Typography>
                  {event.causeName && (
                    <Typography
                      type={TypographyType.Caption1}
                      color={TypographyColor.Tertiary}
                    >
                      Supporting {event.causeName}
                    </Typography>
                  )}
                </FlexCol>
                <Typography
                  bold
                  type={TypographyType.Footnote}
                  className="text-status-success"
                >
                  {event.amount
                    ? formatDonationAmount(event.amount, event.currency)
                    : 'Love'}
                </Typography>
              </FlexRow>
            ))}
          </FlexCol>
        ) : (
          <FlexCol className="items-center gap-1 py-10 text-center">
            <Typography bold type={TypographyType.Callout}>
              Community feed hidden
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              Use the QA panel to show or hide anonymized community activity.
            </Typography>
          </FlexCol>
        )}
      </FlexCol>
    </GivebackSection>
  );
};
