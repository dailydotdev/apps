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
import { LockIcon, VIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { useGivebackContext } from '../GivebackContext';
import {
  formatCompactNumber,
  formatDonationAmount,
  getGoalProgressPercentage,
} from '../utils';
import { GivebackSection } from './GivebackSection';

type TierState = 'unlocked' | 'next' | 'locked';

const stateTag: Record<TierState, string> = {
  unlocked: 'Unlocked',
  next: 'Next up',
  locked: 'Locked',
};

export const GivebackStretchGoals = (): ReactElement => {
  const { campaign } = useGivebackContext();
  const approved = campaign.approvedAmount;

  const goals = [...campaign.stretchGoals].sort((a, b) => a.amount - b.amount);
  const nextIndex = goals.findIndex((goal) => goal.amount > approved);
  const next = nextIndex === -1 ? undefined : goals[nextIndex];
  const previousAmount = nextIndex > 0 ? goals[nextIndex - 1].amount : 0;
  const toNext = next ? next.amount - approved : 0;
  const nextProgress = next
    ? getGoalProgressPercentage(
        approved - previousAmount,
        next.amount - previousAmount,
      )
    : 100;

  return (
    <GivebackSection id="giveback-stretch" title="What we unlock together">
      <FlexCol className="divide-y divide-border-subtlest-tertiary">
        {goals.map((goal, index) => {
          let state: TierState = 'locked';
          if (nextIndex === -1 || index < nextIndex) {
            state = 'unlocked';
          } else if (index === nextIndex) {
            state = 'next';
          }

          const isUnlocked = state === 'unlocked';
          const isNext = state === 'next';

          return (
            <FlexRow key={goal.id} className="items-start gap-4 py-4">
              <span
                className={classNames(
                  'flex size-10 shrink-0 items-center justify-center rounded-full font-bold typo-caption1',
                  isUnlocked && 'bg-accent-avocado-default text-white',
                  isNext &&
                    'bg-accent-cabbage-flat text-accent-cabbage-default ring-2 ring-accent-cabbage-default motion-safe:animate-glow-pulse',
                  state === 'locked' && 'bg-surface-float text-text-tertiary',
                )}
              >
                {isUnlocked ? (
                  <VIcon secondary size={IconSize.Small} />
                ) : (
                  `$${formatCompactNumber(goal.amount)}`
                )}
              </span>

              <FlexCol className="min-w-0 flex-1 gap-1">
                <FlexRow className="flex-wrap items-center justify-between gap-2">
                  <Typography
                    bold
                    type={TypographyType.Callout}
                    color={
                      state === 'locked'
                        ? TypographyColor.Tertiary
                        : TypographyColor.Primary
                    }
                  >
                    {goal.title}
                  </Typography>
                  <FlexRow className="items-center gap-1">
                    {state === 'locked' && (
                      <LockIcon
                        size={IconSize.XSmall}
                        className="text-text-tertiary"
                      />
                    )}
                    <Typography
                      tag={TypographyTag.Span}
                      type={TypographyType.Caption1}
                      bold
                      color={
                        isUnlocked
                          ? TypographyColor.StatusSuccess
                          : TypographyColor.Tertiary
                      }
                      className={classNames(
                        'uppercase tracking-wider',
                        isNext && 'text-accent-cabbage-default',
                      )}
                    >
                      {stateTag[state]}
                    </Typography>
                  </FlexRow>
                </FlexRow>

                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                >
                  {goal.description}
                </Typography>

                {isNext && (
                  <FlexCol className="gap-1 pt-1">
                    <div className="relative overflow-hidden rounded-8">
                      <ProgressBar
                        percentage={nextProgress}
                        shouldShowBg
                        className={{
                          wrapper: 'h-1.5 rounded-8',
                          bar: 'h-full rounded-8',
                          barColor: 'bg-accent-cabbage-default',
                        }}
                      />
                      {[0, 1, 2].map((coin) => (
                        <span
                          key={coin}
                          aria-hidden
                          style={{ animationDelay: `${coin * 0.87}s` }}
                          className="pointer-events-none absolute top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-accent-cheese-default motion-safe:animate-coin-stream"
                        />
                      ))}
                    </div>
                    <Typography
                      type={TypographyType.Caption1}
                      color={TypographyColor.Tertiary}
                    >
                      {formatDonationAmount(toNext, campaign.currency)} to
                      unlock
                    </Typography>
                  </FlexCol>
                )}
              </FlexCol>
            </FlexRow>
          );
        })}
      </FlexCol>
    </GivebackSection>
  );
};
