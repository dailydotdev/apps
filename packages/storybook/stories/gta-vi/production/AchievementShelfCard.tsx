import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import type { UserAchievement } from '@dailydotdev/shared/src/graphql/user/achievements';
import { getTargetCount } from '@dailydotdev/shared/src/graphql/user/achievements';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { LazyImage } from '@dailydotdev/shared/src/components/LazyImage';
import { ProgressBar } from '@dailydotdev/shared/src/components/fields/ProgressBar';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import { Modal } from '@dailydotdev/shared/src/components/modals/common/Modal';
import {
  ModalKind,
  ModalSize,
} from '@dailydotdev/shared/src/components/modals/common/types';
import { MedalBadgeIcon } from '@dailydotdev/shared/src/components/icons/MedalBadge';
import { CalendarIcon } from '@dailydotdev/shared/src/components/icons/Calendar';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  AchievementRarityTier,
  getAchievementRarityTier,
} from '@dailydotdev/shared/src/features/profile/components/achievements/achievementRarity';
import type { GtaViAchievementKind } from '../data';

/*
 * Production's AchievementShelfCard (features/profile/components/achievements)
 * with the GTA VI branch: an event achievement swaps the "<1% rare" chip for
 * its own (Free for everyone's, Rare for the read), says "Unlocked" with the
 * year, and its detail view keeps the date beside a calendar. Everything else
 * is production's, line for line, so the diff is the production change.
 */

const fallbackImage = 'https://daily.dev/default-achievement.png';

const formatUnlockedAt = (value: string): string => {
  const date = new Date(value);
  const now = new Date();
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(date.getFullYear() === now.getFullYear() ? {} : { year: 'numeric' }),
  });
};

// An event happened on one day, so its date reads in full.
const formatEventDate = (value: string): string =>
  new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const rarityPillClasses = 'bg-[#efab27] text-[#08110c]';

const eventPillClasses: Record<GtaViAchievementKind, string> = {
  free: 'bg-accent-cabbage-default text-white',
  rare: rarityPillClasses,
};

const eventPillLabel: Record<GtaViAchievementKind, string> = {
  free: 'Free',
  rare: 'Rare',
};

const EventPill = ({
  event,
  isLarge,
}: {
  event: GtaViAchievementKind;
  isLarge?: boolean;
}): ReactElement => (
  <span
    className={classNames(
      'absolute z-3 flex items-center gap-1 rounded-max font-semibold leading-none',
      isLarge
        ? 'left-3 top-3 px-2.5 py-1 text-[15px]'
        : 'left-2.5 top-2.5 px-2 py-1 text-[14px]',
      eventPillClasses[event],
    )}
  >
    <MedalBadgeIcon secondary size={IconSize.Size16} />
    {eventPillLabel[event]}
  </span>
);

const getEvent = (
  userAchievement: UserAchievement,
): GtaViAchievementKind | undefined =>
  (userAchievement.achievement as { event?: GtaViAchievementKind }).event;

/** The detail view the card opens, also drawn on its own for review. */
export const AchievementDetail = ({
  userAchievement,
  onClose,
}: {
  userAchievement: UserAchievement;
  onClose?: () => void;
}): ReactElement => {
  const { achievement, progress, unlockedAt } = userAchievement;
  const event = getEvent(userAchievement);
  const targetCount = getTargetCount(achievement);
  const isUnlocked = unlockedAt !== null;
  const progressPercentage = Math.min((progress / targetCount) * 100, 100);
  const isRarest =
    isUnlocked &&
    getAchievementRarityTier(achievement.rarity) ===
      AchievementRarityTier.Emerald;
  const progressLabel = `${progress.toLocaleString()} / ${targetCount.toLocaleString()}`;

  return (
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
        {event && <EventPill event={event} isLarge />}
        {!event && isRarest && (
          <span
            className={classNames(
              'absolute left-3 top-3 rounded-max px-2.5 py-1 text-xs font-semibold leading-none',
              rarityPillClasses,
            )}
          >
            &lt;1% rare
          </span>
        )}
        <CloseButton
          size={ButtonSize.Small}
          variant={ButtonVariant.Primary}
          className="absolute right-2.5 top-2.5"
          onClick={onClose}
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

        {isUnlocked && event && (
          <Typography
            type={TypographyType.Subhead}
            color={TypographyColor.Tertiary}
            className="mt-2.5 flex items-center gap-1.5"
          >
            Unlocked {formatEventDate(unlockedAt)}
            <CalendarIcon size={IconSize.Size16} />
          </Typography>
        )}
        {isUnlocked && !event && (
          <Typography
            type={TypographyType.Subhead}
            color={TypographyColor.Tertiary}
            className="mt-2.5"
          >
            Completed {formatUnlockedAt(unlockedAt)}
          </Typography>
        )}
        {!isUnlocked && event && (
          <Typography
            type={TypographyType.Subhead}
            color={TypographyColor.Tertiary}
            className="mt-2.5"
          >
            Read a post before midnight to unlock
          </Typography>
        )}
        {!isUnlocked && !event && (
          <>
            <Typography
              type={TypographyType.Subhead}
              color={TypographyColor.Tertiary}
              className="mt-2.5"
            >
              {progressLabel}
            </Typography>
            <ProgressBar
              percentage={progressPercentage}
              shouldShowBg
              className={{
                wrapper: 'mt-2 h-1 rounded-max',
                bar: 'h-full rounded-max',
                barColor: 'bg-accent-cabbage-default',
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};

export function AchievementShelfCard({
  userAchievement,
}: {
  userAchievement: UserAchievement;
}): ReactElement {
  const [isExpanded, setIsExpanded] = useState(false);
  const { achievement, progress, unlockedAt } = userAchievement;
  const event = getEvent(userAchievement);
  const targetCount = getTargetCount(achievement);
  const isUnlocked = unlockedAt !== null;
  const progressPercentage = Math.min((progress / targetCount) * 100, 100);
  const isRarest =
    isUnlocked &&
    getAchievementRarityTier(achievement.rarity) ===
      AchievementRarityTier.Emerald;
  const progressLabel = `${progress.toLocaleString()} / ${targetCount.toLocaleString()}`;

  return (
    <>
      <article className="group relative flex h-[10.5rem] w-full flex-col justify-end overflow-hidden rounded-16 bg-background-subtle text-left transition-transform hover:-translate-y-1 tablet:h-[17rem]">
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

        <button
          type="button"
          aria-label={`View ${achievement.name}`}
          className="absolute inset-0 z-2"
          onClick={() => setIsExpanded(true)}
        />

        {event && <EventPill event={event} />}
        {!event && isRarest && (
          <span
            className={classNames(
              'absolute left-2.5 top-2.5 z-3 rounded-max px-2 py-1 text-[14px] font-semibold leading-none',
              rarityPillClasses,
            )}
          >
            &lt;1% rare
          </span>
        )}

        {!isUnlocked && !event && (
          <Typography className="pointer-events-none absolute left-[13px] top-3 z-3 hidden text-[14px] text-[rgba(255,255,255,0.7)] tablet:block">
            {progressLabel}
          </Typography>
        )}

        <div className="pointer-events-none relative z-2 px-[13px] pb-[13px] pt-3">
          <Typography
            tag={TypographyTag.H3}
            className="text-[14.5px] font-semibold leading-[1.2] tracking-[-0.01em] text-white"
          >
            {achievement.name}
          </Typography>
          <Typography className="mt-[3px] line-clamp-1 hidden text-[14px] leading-[1.32] text-[rgba(255,255,255,0.78)] tablet:block">
            {achievement.description}
          </Typography>

          {isUnlocked && (
            <Typography className="mt-[7px] text-[14px] text-[rgba(255,255,255,0.7)]">
              {event
                ? `Unlocked ${formatEventDate(unlockedAt)}`
                : `Completed ${formatUnlockedAt(unlockedAt)}`}
            </Typography>
          )}
          {!isUnlocked && event && (
            // One day to earn it, so it says what to do instead of a count.
            <Typography className="mt-[7px] text-[14px] text-[rgba(255,255,255,0.7)]">
              Read a post today to unlock
            </Typography>
          )}
          {!isUnlocked && !event && (
            <>
              <Typography className="mt-[5px] text-[14px] leading-none text-[rgba(255,255,255,0.7)] tablet:hidden">
                {progressLabel}
              </Typography>
              <ProgressBar
                percentage={progressPercentage}
                shouldShowBg
                className={{
                  wrapper: 'mt-[7px] h-1 rounded-max tablet:mt-[13px]',
                  bar: 'h-full rounded-max',
                  barColor: 'bg-accent-cabbage-default',
                }}
              />
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
          <AchievementDetail
            userAchievement={userAchievement}
            onClose={() => setIsExpanded(false)}
          />
        </Modal>
      )}
    </>
  );
}
