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
import { QuestLevelProgressCircle } from '../../../components/quest/QuestLevelProgressCircle';
import { ProgressBar } from '../../../components/fields/ProgressBar';
import { useGivebackContext } from '../GivebackContext';
import { formatDonationAmount } from '../utils';
import { SecretRewardTile } from './SecretRewardTile';

export const PersonalRoadmap = (): ReactElement => {
  const { levels, userProfile, campaign } = useGivebackContext();
  const approved = userProfile.approvedContributionAmount;

  const currentLevel =
    levels.find((level) => level.levelNumber === userProfile.currentLevel) ??
    levels[0];
  const nextLevel = levels.find(
    (level) => level.requiredApprovedAmount > approved,
  );

  const segmentBase = currentLevel.requiredApprovedAmount;
  const segmentTarget = nextLevel?.requiredApprovedAmount ?? segmentBase;
  const segmentSpan = segmentTarget - segmentBase;
  const segmentProgress =
    segmentSpan > 0
      ? Math.max(
          0,
          Math.min(100, ((approved - segmentBase) / segmentSpan) * 100),
        )
      : 100;
  const amountToNext = nextLevel
    ? Math.max(0, nextLevel.requiredApprovedAmount - approved)
    : 0;

  return (
    <FlexCol
      id="giveback-roadmap"
      className="w-full scroll-mt-16 gap-5 rounded-24 border border-border-subtlest-tertiary bg-surface-float p-6"
    >
      <FlexCol className="gap-1">
        <Typography tag={TypographyTag.H2} type={TypographyType.Title3} bold>
          Your roadmap
        </Typography>
        <Typography
          tag={TypographyTag.P}
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {nextLevel
            ? `You're ${formatDonationAmount(
                amountToNext,
                campaign.currency,
              )} away from Level ${nextLevel.levelNumber} · ${nextLevel.name}`
            : "You've reached the top level. Legend!"}
        </Typography>
      </FlexCol>

      {nextLevel && (
        <ProgressBar
          percentage={segmentProgress}
          shouldShowBg
          className={{
            wrapper: 'h-2 rounded-12',
            bar: 'h-full rounded-12',
            barColor: 'bg-accent-cabbage-default',
          }}
        />
      )}

      <FlexRow className="gap-3 overflow-x-auto pb-2">
        {levels.map((level) => {
          const isReached = approved >= level.requiredApprovedAmount;
          const isCurrent = level.levelNumber === userProfile.currentLevel;

          return (
            <FlexCol
              key={level.id}
              className={classNames(
                'min-w-36 flex-1 items-center gap-2 rounded-16 border p-4 text-center transition-colors',
                isCurrent
                  ? 'border-accent-cabbage-default bg-accent-cabbage-subtlest'
                  : 'border-border-subtlest-tertiary bg-surface-secondary',
              )}
            >
              <QuestLevelProgressCircle
                level={level.levelNumber}
                progress={isReached ? 100 : 0}
                className={classNames(!isReached && 'opacity-60')}
              />
              <Typography
                tag={TypographyTag.Span}
                type={TypographyType.Caption1}
                color={
                  isReached ? TypographyColor.Primary : TypographyColor.Tertiary
                }
                bold
              >
                {level.name}
              </Typography>
              <Typography
                tag={TypographyTag.Span}
                type={TypographyType.Caption2}
                color={TypographyColor.Tertiary}
              >
                {level.requiredApprovedAmount === 0
                  ? 'Start here'
                  : formatDonationAmount(
                      level.requiredApprovedAmount,
                      campaign.currency,
                    )}
              </Typography>
              {level.reward && (
                <SecretRewardTile
                  reward={level.reward}
                  isUnlocked={isReached}
                />
              )}
            </FlexCol>
          );
        })}
      </FlexRow>
    </FlexCol>
  );
};
