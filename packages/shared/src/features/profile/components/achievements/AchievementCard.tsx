import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { UserAchievement } from '../../../../graphql/user/achievements';
import {
  AchievementType,
  getTargetCount,
} from '../../../../graphql/user/achievements';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../../components/typography/Typography';
import { formatDate, TimeFormatType } from '../../../../lib/dateFormat';
import { LazyImage } from '../../../../components/LazyImage';

interface AchievementCardProps {
  userAchievement: UserAchievement;
}

export function AchievementCard({
  userAchievement,
}: AchievementCardProps): ReactElement {
  const { achievement, progress, unlockedAt } = userAchievement;
  const targetCount = getTargetCount(achievement);
  const isUnlocked = unlockedAt !== null;
  const progressPercentage = Math.min((progress / targetCount) * 100, 100);
  const showProgress =
    achievement.type === AchievementType.Milestone && !isUnlocked;

  return (
    <div
      className={classNames(
        'flex flex-col rounded-16 border p-4 transition-colors',
        isUnlocked
          ? 'border-border-subtlest-tertiary bg-surface-float'
          : 'bg-surface-subtle border-border-subtlest-tertiary',
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={classNames(
            'relative flex size-12 shrink-0 items-center justify-center rounded-12',
            !isUnlocked && 'opacity-50 grayscale',
          )}
        >
          <LazyImage
            imgSrc={achievement.image}
            imgAlt={achievement.name}
            className="size-12 rounded-12 object-cover"
            fallbackSrc="https://daily.dev/default-achievement.png"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <Typography
            type={TypographyType.Callout}
            tag={TypographyTag.H3}
            color={
              isUnlocked ? TypographyColor.Primary : TypographyColor.Tertiary
            }
            bold
            className="truncate"
          >
            {achievement.name}
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            className="mt-0.5 line-clamp-2"
          >
            {achievement.description}
          </Typography>
        </div>
        <div className="flex shrink-0 items-center self-center">
          <Typography
            type={TypographyType.Callout}
            color={
              isUnlocked ? TypographyColor.Primary : TypographyColor.Tertiary
            }
            bold
          >
            {achievement.points}
          </Typography>
        </div>
      </div>

      {showProgress && (
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between">
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              Progress
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              {progress}/{targetCount}
            </Typography>
          </div>
          <div className="bg-surface-subtle h-1.5 w-full overflow-hidden rounded-full">
            <div
              className="h-full rounded-full bg-accent-cabbage-default transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {isUnlocked && unlockedAt && (
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Quaternary}
          className="mt-3"
        >
          Unlocked{' '}
          {formatDate({ value: unlockedAt, type: TimeFormatType.Post })}
        </Typography>
      )}
    </div>
  );
}
