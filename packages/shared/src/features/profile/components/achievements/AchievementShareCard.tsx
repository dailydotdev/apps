import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { UserAchievement } from '../../../../graphql/user/achievements';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../../components/typography/Typography';
import LogoIcon from '../../../../svg/LogoIcon';
import LogoText from '../../../../svg/LogoText';
import { formatDate, TimeFormatType } from '../../../../lib/dateFormat';
import {
  AchievementRarityTier,
  getAchievementRarityTier,
  rarityGlowClasses,
} from './achievementRarity';

export interface AchievementShareCardUser {
  name?: string | null;
  username?: string | null;
  image?: string | null;
}

export interface AchievementShareCardProps {
  userAchievement: UserAchievement;
  user: AchievementShareCardUser;
}

// Static, self-contained render of a single unlocked achievement. Used by the
// `/image-generator/achievement/...` page that the backend screenshot service
// turns into a PNG, so it must not depend on viewport, hover or client-only
// data — everything it needs arrives as props.
export function AchievementShareCard({
  userAchievement,
  user,
}: AchievementShareCardProps): ReactElement {
  const { achievement, unlockedAt } = userAchievement;
  const rarityTier = getAchievementRarityTier(achievement.rarity);
  const rarityLabel =
    rarityTier === AchievementRarityTier.Emerald
      ? '<1%'
      : `${Math.round(achievement.rarity ?? 0)}%`;

  return (
    <div
      className={classNames(
        'flex w-[32rem] flex-col items-center gap-4 rounded-24 border bg-background-default px-10 py-9 text-center',
        rarityTier
          ? rarityGlowClasses[rarityTier]
          : 'border-border-subtlest-tertiary',
      )}
    >
      <img
        src={achievement.image}
        alt={achievement.name}
        className="size-32 rounded-16 object-cover"
      />
      <div className="flex flex-col items-center gap-1">
        <Typography
          tag={TypographyTag.H1}
          type={TypographyType.Title1}
          color={TypographyColor.Primary}
          bold
        >
          {achievement.name}
        </Typography>
        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Tertiary}
          className="max-w-96"
        >
          {achievement.description}
        </Typography>
      </div>

      <div className="flex items-center gap-2">
        <span className="rounded-14 bg-surface-float px-3 py-1 font-bold text-text-primary typo-subhead">
          {achievement.points} points
        </span>
        {achievement.rarity != null && (
          <span className="rounded-14 bg-surface-float px-3 py-1 font-bold text-text-primary typo-subhead">
            Earned by {rarityLabel}
          </span>
        )}
      </div>

      <div className="flex w-full flex-col items-center gap-1 border-t border-border-subtlest-tertiary pt-4">
        <div className="flex items-center gap-2">
          {!!user.image && (
            <img
              src={user.image}
              alt={user.name ?? user.username ?? ''}
              className="size-8 rounded-full object-cover"
            />
          )}
          <Typography type={TypographyType.Callout} bold>
            {user.name ?? `@${user.username}`}
          </Typography>
        </div>
        {!!unlockedAt && (
          <Typography
            tag={TypographyTag.Time}
            type={TypographyType.Footnote}
            color={TypographyColor.Quaternary}
            dateTime={new Date(unlockedAt).toISOString()}
          >
            Unlocked{' '}
            {formatDate({ value: unlockedAt, type: TimeFormatType.Post })}
          </Typography>
        )}
        <div className="mt-2 flex">
          <LogoIcon className={{ container: 'h-logo' }} />
          <LogoText className={{ container: 'ml-1 h-logo' }} />
        </div>
      </div>
    </div>
  );
}
