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
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { formatDate, TimeFormatType } from '../../../../lib/dateFormat';
import { LazyImage } from '../../../../components/LazyImage';
import HoverCard from '../../../../components/cards/common/HoverCard';
import { anchorDefaultRel } from '../../../../lib/strings';
import { PinIcon } from '../../../../components/icons';
import {
  AchievementRarityTier,
  getAchievementRarityTier,
  rarityGlowClasses,
} from './achievementRarity';
import { RaritySparkles } from './RaritySparkles';

interface AchievementCardProps {
  userAchievement: UserAchievement;
  isOwner?: boolean;
  isTracked?: boolean;
  isTrackPending?: boolean;
  onTrack?: (achievementId: string) => Promise<unknown>;
}

export function AchievementCard({
  userAchievement,
  isOwner = false,
  isTracked = false,
  isTrackPending = false,
  onTrack,
}: AchievementCardProps): ReactElement {
  const { achievement, progress, unlockedAt } = userAchievement;
  const targetCount = getTargetCount(achievement);
  const isUnlocked = unlockedAt !== null;
  const progressPercentage = Math.min((progress / targetCount) * 100, 100);
  const showProgress =
    achievement.type === AchievementType.Milestone && !isUnlocked;
  const rarityTier = isUnlocked
    ? getAchievementRarityTier(achievement.rarity)
    : null;
  const rarityLabel =
    rarityTier === AchievementRarityTier.Emerald
      ? '<1%'
      : `${Math.round(achievement.rarity ?? 0)}%`;

  return (
    <div
      className={classNames(
        'relative flex flex-col rounded-16 border p-4 transition-colors',
        isUnlocked ? 'bg-surface-float' : 'bg-surface-subtle',
        rarityTier
          ? ['overflow-visible', rarityGlowClasses[rarityTier]]
          : 'border-border-subtlest-tertiary',
      )}
    >
      {rarityTier && <RaritySparkles tier={rarityTier} />}
      <div className="flex items-start gap-3">
        <HoverCard
          sideOffset={8}
          openDelay={500}
          trigger={
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
          }
        >
          <a href={achievement.image} target="_blank" rel={anchorDefaultRel}>
            <img
              src={achievement.image}
              alt={achievement.name}
              className="size-60 cursor-pointer rounded-16 border border-border-subtlest-tertiary bg-background-popover p-2"
            />
          </a>
        </HoverCard>
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
          <div className="rounded-sm h-1.5 w-full overflow-hidden bg-accent-pepper-subtler">
            <div
              className="rounded-sm h-full bg-accent-cabbage-default transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {!isUnlocked && isOwner && onTrack && (
        <Button
          className="mt-3 self-start"
          size={ButtonSize.XSmall}
          variant={isTracked ? ButtonVariant.Secondary : ButtonVariant.Primary}
          icon={<PinIcon />}
          disabled={isTrackPending || isTracked}
          onClick={() => onTrack(achievement.id)}
        >
          {isTracked ? 'Tracking' : 'Track this'}
        </Button>
      )}

      {isUnlocked && unlockedAt && (
        <div className="mt-3 flex flex-col">
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Quaternary}
          >
            Unlocked{' '}
            {formatDate({ value: unlockedAt, type: TimeFormatType.Post })}
          </Typography>
          {achievement.rarity != null && (
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Quaternary}
              className="mt-1"
            >
              Earned by {rarityLabel} of users
            </Typography>
          )}
        </div>
      )}
    </div>
  );
}
