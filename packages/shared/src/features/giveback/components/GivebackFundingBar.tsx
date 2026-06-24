import type { ReactElement, ReactNode } from 'react';
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
import ProgressCircle from '../../../components/ProgressCircle';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent } from '../../../lib/log';
import { useGivebackContribution } from '../hooks/useGivebackContribution';
import { formatDonationAmount } from '../utils';

interface GivebackFundingBarProps {
  onTakeAction: () => void;
}

// Persistent personal-progress bar for the onboarded experience. Deliberately
// spare: the exact amount you've unlocked, one explicit next reward, and the
// CTA - nothing else competing for attention in the thumb zone.
export const GivebackFundingBar = ({
  onTakeAction,
}: GivebackFundingBarProps): ReactElement => {
  const { logEvent } = useLogContext();
  const {
    earnedPoints,
    nextReward,
    pointsToNext,
    progressPercentage,
    hasRewards,
    isPending,
  } = useGivebackContribution(true);

  const handleTakeAction = () => {
    logEvent({
      event_name: LogEvent.ClickGivebackTakeAction,
      extra: JSON.stringify({ origin: 'funding_bar' }),
    });
    onTakeAction();
  };

  const renderNextStep = (): ReactNode => {
    if (isPending) {
      return (
        <span className="my-0.5 block h-3 w-40 animate-pulse rounded-8 bg-surface-float" />
      );
    }

    if (nextReward) {
      return (
        <>
          <span className="font-bold text-accent-avocado-default">
            {formatDonationAmount(pointsToNext)}
          </span>{' '}
          to unlock{' '}
          <span className="font-bold text-text-primary">
            {nextReward.title}
          </span>
        </>
      );
    }

    if (hasRewards) {
      return <>You&apos;ve unlocked every reward. Keep the good going.</>;
    }

    return <>Take an action to start unlocking donations.</>;
  };

  return (
    <div className="pointer-events-none sticky bottom-0 z-3">
      <div className="bg-background-default/80 pointer-events-auto relative mx-auto w-full max-w-6xl border-t border-border-subtlest-secondary px-4 py-3 backdrop-blur-xl tablet:rounded-t-16 tablet:border-x">
        {/* Brand hairline along the top edge, matching the sticky tabs bar. */}
        <div
          aria-hidden
          className="via-accent-cabbage-default/40 pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent"
        />

        <FlexRow className="items-center justify-between gap-4">
          <FlexRow className="min-w-0 flex-1 items-center gap-3">
            <div className="shrink-0">
              <ProgressCircle
                progress={isPending ? 0 : progressPercentage}
                size={46}
                showPercentage
              />
            </div>

            <FlexCol className="min-w-0 gap-0.5">
              <FlexRow className="min-w-0 items-baseline gap-1.5">
                <Typography
                  tag={TypographyTag.Span}
                  type={TypographyType.Callout}
                  bold
                  className="shrink-0 tabular-nums text-status-success"
                >
                  {formatDonationAmount(earnedPoints)}
                </Typography>
                <Typography
                  tag={TypographyTag.Span}
                  type={TypographyType.Caption1}
                  color={TypographyColor.Tertiary}
                  className="truncate"
                >
                  unlocked
                  <span className="hidden tablet:inline"> for your causes</span>
                </Typography>
              </FlexRow>

              <Typography
                tag={TypographyTag.Span}
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
                className="truncate"
              >
                {renderNextStep()}
              </Typography>
            </FlexCol>
          </FlexRow>

          <Button
            type="button"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Medium}
            onClick={handleTakeAction}
            className="shrink-0"
          >
            Take action
          </Button>
        </FlexRow>
      </div>
    </div>
  );
};
