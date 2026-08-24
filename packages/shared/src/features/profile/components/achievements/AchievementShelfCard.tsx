import type { MouseEvent, ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import type { UserAchievement } from '../../../../graphql/user/achievements';
import { getTargetCount } from '../../../../graphql/user/achievements';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../../components/typography/Typography';
import {
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { LazyImage } from '../../../../components/LazyImage';
import CloseButton from '../../../../components/CloseButton';
import { Modal } from '../../../../components/modals/common/Modal';
import {
  ModalKind,
  ModalSize,
} from '../../../../components/modals/common/types';
import {
  AchievementRarityTier,
  getAchievementRarityTier,
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

// The slab always spells the unlock date out as "Aug 2". The shared post
// formatter zero-pads the day and swaps in "Today"/"Yesterday", so it can't be
// reused here.
const formatUnlockedAt = (value: string): string => {
  const date = new Date(value);
  const now = new Date();
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(date.getFullYear() === now.getFullYear() ? {} : { year: 'numeric' }),
  });
};

// The slab treatment only distinguishes two rarity bands; the shared four-tier
// scale collapses onto them so the other achievement surfaces keep their tiers.
const isEmerald = (tier: AchievementRarityTier | null) =>
  tier === AchievementRarityTier.Emerald;

const slabRingClasses: Record<'gold' | 'emerald', string> = {
  gold: 'border-[#efab27] shadow-[0_0_16px_-2px_#efab27]',
  emerald: 'border-[#1dbf8c] shadow-[0_0_16px_-2px_#1dbf8c]',
};

const slabPillClasses: Record<'gold' | 'emerald', string> = {
  gold: 'bg-[#efab27]',
  emerald: 'bg-[#1dbf8c]',
};

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
  const rarityTier = isUnlocked
    ? getAchievementRarityTier(achievement.rarity)
    : null;
  const slabTier = rarityTier
    ? ((isEmerald(rarityTier) ? 'emerald' : 'gold') as 'gold' | 'emerald')
    : null;
  const rarityLabel = isEmerald(rarityTier)
    ? '<1%'
    : `${Math.round(achievement.rarity ?? 0)}%`;
  const canTrack = !isUnlocked && isOwner && !!onTrack;
  const progressLabel = `${progress.toLocaleString()} / ${targetCount.toLocaleString()}`;

  return (
    <>
      <article className="group relative flex h-[272px] w-52 shrink-0 flex-col justify-end overflow-hidden rounded-16 bg-background-subtle text-left transition-transform hover:-translate-y-1">
        {/* `absolute` has to come from the prop: LazyImage appends its own
            `relative` after our classes, and that wins in the compiled CSS. */}
        <LazyImage
          absolute
          imgSrc={achievement.image}
          imgAlt={achievement.name}
          className={classNames(
            'inset-0 size-full',
            !isUnlocked && 'brightness-[.6] grayscale-[.85]',
          )}
          fallbackSrc={fallbackImage}
        />

        <div className="absolute inset-0 z-1 bg-[linear-gradient(to_top,rgba(6,8,11,0.94)_0%,rgba(6,8,11,0.72)_34%,rgba(6,8,11,0.12)_66%,rgba(6,8,11,0)_100%)]" />

        {slabTier && (
          <div
            className={classNames(
              'pointer-events-none absolute inset-0 z-3 rounded-16 border-2',
              slabRingClasses[slabTier],
            )}
          />
        )}

        {/* Covers the slab so the whole card opens the detail modal, without
            nesting the track control inside another button. */}
        <button
          type="button"
          aria-label={`View ${achievement.name}`}
          className="absolute inset-0 z-2"
          onClick={() => setIsExpanded(true)}
        />

        {slabTier && (
          <span
            className={classNames(
              'absolute left-2.5 top-2.5 z-3 rounded-max px-2 py-1 text-[14px] font-semibold leading-none text-[#08110c]',
              slabPillClasses[slabTier],
            )}
          >
            {rarityLabel} rare
          </span>
        )}

        {canTrack && (
          <button
            type="button"
            disabled={isTracked ? isUntrackPending : isTrackPending}
            className="absolute right-2.5 top-2.5 z-3 inline-flex h-6 items-center rounded-8 border border-[rgba(255,255,255,0.28)] bg-[rgba(8,10,13,0.55)] px-2 text-[14px] font-medium leading-none text-white backdrop-blur-[6px]"
            onClick={(event: MouseEvent) => {
              event.stopPropagation();
              if (isTracked) {
                onUntrack?.();
                return;
              }
              onTrack(achievement.id);
            }}
          >
            {isTracked ? 'Tracked' : 'Track'}
          </button>
        )}

        <div className="pointer-events-none relative z-2 px-[13px] pb-[13px] pt-3">
          <Typography
            tag={TypographyTag.H3}
            className="text-[14.5px] font-semibold leading-[1.2] tracking-[-0.01em] text-white"
          >
            {achievement.name}
          </Typography>
          <Typography className="mt-[3px] line-clamp-1 text-[14px] leading-[1.32] text-[rgba(255,255,255,0.78)]">
            {achievement.description}
          </Typography>

          {isUnlocked ? (
            <Typography className="mt-[7px] text-[14px] text-[rgba(255,255,255,0.7)]">
              Unlocked {formatUnlockedAt(unlockedAt)}
            </Typography>
          ) : (
            <>
              <Typography className="mt-[7px] text-[14px] text-[rgba(255,255,255,0.7)]">
                {progressLabel}
              </Typography>
              <div className="mt-2 h-[5px] overflow-hidden rounded-max bg-[rgba(255,255,255,0.22)]">
                <div
                  className="h-full rounded-max bg-accent-cabbage-default"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </>
          )}
        </div>
      </article>

      {isExpanded && (
        <Modal
          isOpen
          onRequestClose={() => setIsExpanded(false)}
          kind={ModalKind.FlexibleCenter}
          size={ModalSize.XSmall}
          className="overflow-hidden"
        >
          <div className="relative flex flex-col">
            <div className="relative aspect-square w-full overflow-hidden bg-background-subtle">
              <img
                src={achievement.image}
                alt={achievement.name}
                className={classNames(
                  'size-full object-cover',
                  !isUnlocked && 'brightness-[.6] grayscale-[.85]',
                )}
              />
              {slabTier && (
                <span
                  className={classNames(
                    'absolute left-3 top-3 rounded-max px-2.5 py-1 text-xs font-semibold leading-none text-[#08110c]',
                    slabPillClasses[slabTier],
                  )}
                >
                  {rarityLabel} rare
                </span>
              )}
              <CloseButton
                size={ButtonSize.Small}
                variant={ButtonVariant.Primary}
                className="absolute right-2.5 top-2.5"
                onClick={() => setIsExpanded(false)}
              />
            </div>
            <div className="px-[18px] pb-[18px] pt-4">
              <Typography
                tag={TypographyTag.H3}
                className="text-[17px] font-semibold leading-tight tracking-[-0.01em] text-text-primary"
              >
                {achievement.name}
              </Typography>
              <Typography
                type={TypographyType.Subhead}
                color={TypographyColor.Tertiary}
                className="mt-1 leading-[1.45]"
              >
                {achievement.description}
              </Typography>

              {isUnlocked ? (
                <Typography
                  type={TypographyType.Subhead}
                  color={TypographyColor.Tertiary}
                  className="mt-2.5"
                >
                  Unlocked {formatUnlockedAt(unlockedAt)}
                </Typography>
              ) : (
                <>
                  <Typography
                    type={TypographyType.Subhead}
                    color={TypographyColor.Tertiary}
                    className="mt-2.5"
                  >
                    {progressLabel}
                  </Typography>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-max bg-border-subtlest-tertiary">
                    <div
                      className="h-full rounded-max bg-accent-cabbage-default"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
