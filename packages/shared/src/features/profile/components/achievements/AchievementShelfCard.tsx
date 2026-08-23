import type { MouseEvent, ReactElement } from 'react';
import React, { useState } from 'react';
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
import { ProgressBar } from '../../../../components/fields/ProgressBar';
import CloseButton from '../../../../components/CloseButton';
import { Modal } from '../../../../components/modals/common/Modal';
import {
  ModalKind,
  ModalSize,
} from '../../../../components/modals/common/types';
import { PinIcon } from '../../../../components/icons';
import {
  AchievementRarityTier,
  getAchievementRarityTier,
  rarityGlowClasses,
} from './achievementRarity';

interface AchievementShelfCardProps {
  userAchievement: UserAchievement;
  isOwner?: boolean;
  isTracked?: boolean;
  isTrackPending?: boolean;
  onTrack?: (achievementId: string) => Promise<void>;
  onUntrack?: () => Promise<void>;
  isUntrackPending?: boolean;
}

const fallbackImage = 'https://daily.dev/default-achievement.png';

export function AchievementShelfCard({
  userAchievement,
  isOwner = false,
  isTracked = false,
  isTrackPending = false,
  onTrack,
  onUntrack,
  isUntrackPending = false,
}: AchievementShelfCardProps): ReactElement {
  const [isExpanded, setIsExpanded] = useState(false);
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
  const canTrack = !isUnlocked && isOwner && !!onTrack;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsExpanded(true)}
        className={classNames(
          'group relative flex h-[232px] w-44 shrink-0 flex-col justify-end overflow-hidden rounded-16 border text-left transition-transform hover:-translate-y-1',
          rarityTier
            ? rarityGlowClasses[rarityTier]
            : 'border-border-subtlest-tertiary',
        )}
      >
        <LazyImage
          imgSrc={achievement.image}
          imgAlt={achievement.name}
          className={classNames(
            'absolute inset-0 size-full object-cover',
            !isUnlocked && 'brightness-[.6] grayscale',
          )}
          fallbackSrc={fallbackImage}
        />
        <div className="via-surface-invert/70 absolute inset-0 bg-gradient-to-t from-surface-invert to-transparent" />

        {rarityTier && (
          <span className="absolute left-2.5 top-2.5 z-2 rounded-8 border border-white/24 bg-overlay-secondary-pepper px-2 py-0.5 font-bold text-white backdrop-blur-md typo-caption2">
            {rarityLabel} rare
          </span>
        )}

        {canTrack && (
          <span className="absolute right-2.5 top-2.5 z-2">
            {isTracked ? (
              <Button
                size={ButtonSize.XSmall}
                variant={ButtonVariant.Secondary}
                icon={<PinIcon />}
                disabled={isUntrackPending}
                onClick={(event: MouseEvent) => {
                  event.stopPropagation();
                  onUntrack?.();
                }}
              >
                Tracked
              </Button>
            ) : (
              <Button
                size={ButtonSize.XSmall}
                variant={ButtonVariant.Secondary}
                icon={<PinIcon />}
                disabled={isTrackPending}
                onClick={(event: MouseEvent) => {
                  event.stopPropagation();
                  onTrack(achievement.id);
                }}
              >
                Track
              </Button>
            )}
          </span>
        )}

        <div className="relative z-1 flex flex-col gap-1 p-3">
          <Typography
            type={TypographyType.Callout}
            tag={TypographyTag.H3}
            className="truncate !text-white"
            bold
          >
            {achievement.name}
          </Typography>
          <Typography
            type={TypographyType.Caption1}
            className="text-white/70 line-clamp-1"
          >
            {achievement.description}
          </Typography>
          {showProgress ? (
            <div className="mt-1 flex flex-col gap-1">
              <Typography
                type={TypographyType.Caption1}
                className="text-white/70"
              >
                {progress}/{targetCount}
              </Typography>
              <ProgressBar
                percentage={progressPercentage}
                shouldShowBg
                className={{
                  wrapper: '!bg-white/25 h-1.5 rounded-14',
                  bar: 'h-full rounded-14',
                  barColor: 'bg-white',
                }}
              />
            </div>
          ) : (
            isUnlocked &&
            unlockedAt && (
              <Typography
                type={TypographyType.Caption1}
                className="text-white/70 mt-1"
              >
                Unlocked{' '}
                {formatDate({ value: unlockedAt, type: TimeFormatType.Post })}
              </Typography>
            )
          )}
        </div>
      </button>

      {isExpanded && (
        <Modal
          isOpen
          onRequestClose={() => setIsExpanded(false)}
          kind={ModalKind.FlexibleCenter}
          size={ModalSize.XSmall}
        >
          <div className="relative flex flex-col">
            <div className="relative aspect-square w-full overflow-hidden bg-background-subtle">
              <img
                src={achievement.image}
                alt={achievement.name}
                className={classNames(
                  'size-full object-cover',
                  !isUnlocked && 'brightness-[.6] grayscale',
                )}
              />
              {rarityTier && (
                <span className="absolute left-3 top-3 rounded-8 border border-white/24 bg-overlay-secondary-pepper px-2 py-0.5 font-bold text-white backdrop-blur-md typo-caption1">
                  {rarityLabel} rare
                </span>
              )}
              <CloseButton
                size={ButtonSize.Small}
                variant={ButtonVariant.Primary}
                className="absolute right-3 top-3"
                onClick={() => setIsExpanded(false)}
              />
            </div>
            <div className="flex flex-col gap-2 p-4">
              <Typography
                type={TypographyType.Title3}
                tag={TypographyTag.H3}
                color={TypographyColor.Primary}
                bold
              >
                {achievement.name}
              </Typography>
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Secondary}
              >
                {achievement.description}
              </Typography>
              {showProgress ? (
                <div className="mt-1 flex flex-col gap-1.5">
                  <Typography
                    type={TypographyType.Footnote}
                    color={TypographyColor.Tertiary}
                  >
                    {progress}/{targetCount}
                  </Typography>
                  <ProgressBar
                    percentage={progressPercentage}
                    shouldShowBg
                    className={{
                      wrapper: 'h-1.5 rounded-14',
                      bar: 'h-full rounded-14',
                    }}
                  />
                </div>
              ) : (
                isUnlocked &&
                unlockedAt && (
                  <Typography
                    type={TypographyType.Footnote}
                    color={TypographyColor.Tertiary}
                  >
                    Unlocked{' '}
                    {formatDate({
                      value: unlockedAt,
                      type: TimeFormatType.Post,
                    })}
                  </Typography>
                )
              )}
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
