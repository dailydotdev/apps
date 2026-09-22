import type { CreatorAchievement } from '@dailydotdev/shared/src/graphql/creatorAchievements';
import { CreatorAchievementType } from '@dailydotdev/shared/src/graphql/creatorAchievements';
import { formatDataTileValue } from '@dailydotdev/shared/src/lib/numberFormat';

/**
 * The category as a reader would name it: its display title when it has one,
 * otherwise the raw keyword.
 */
export const achievementCategoryLabel = (
  achievement: Pick<CreatorAchievement, 'keyword'>,
): string | null =>
  achievement.keyword?.flags?.title ?? achievement.keyword?.value ?? null;

/**
 * The month a period-scoped award covers.
 *
 * `periodEnd` is exclusive — a monthly award runs to midnight on the 1st of
 * the next month — so the label is taken from `periodStart`, and in UTC,
 * because that is the calendar the period was cut on.
 */
export const achievementPeriodLabel = (
  achievement: Pick<CreatorAchievement, 'periodStart'>,
): string | null => {
  if (!achievement.periodStart) {
    return null;
  }

  return new Date(achievement.periodStart).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
};

export const achievementDateLabel = (
  achievement: Pick<CreatorAchievement, 'achievedAt'>,
): string =>
  new Date(achievement.achievedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

/**
 * What the award says, built only from what the record holds.
 *
 * A type with nothing to say returns null rather than a guess: an unfamiliar
 * type means the server knows about recognition this build does not, and
 * inventing a headline for it would put words on an award nobody wrote.
 */
export const achievementTitle = (
  achievement: Pick<
    CreatorAchievement,
    'type' | 'rank' | 'threshold' | 'keyword'
  >,
): string | null => {
  switch (achievement.type) {
    case CreatorAchievementType.CategoryRanking: {
      const category = achievementCategoryLabel(achievement);

      if (!achievement.rank || !category) {
        return null;
      }

      return `#${achievement.rank} in ${category}`;
    }
    case CreatorAchievementType.PostUpvoteMilestone:
      return achievement.threshold
        ? `${formatDataTileValue(achievement.threshold)} upvotes`
        : null;
    case CreatorAchievementType.CreatorImpressionMilestone:
      return achievement.threshold
        ? `${formatDataTileValue(achievement.threshold)} impressions`
        : null;
    default:
      return null;
  }
};

/** The line under the headline, or null when there is nothing to add. */
export const achievementSubtitle = (
  achievement: Pick<
    CreatorAchievement,
    'type' | 'periodStart' | 'threshold' | 'post'
  >,
): string | null => {
  switch (achievement.type) {
    case CreatorAchievementType.CategoryRanking:
      return achievementPeriodLabel(achievement);
    case CreatorAchievementType.PostUpvoteMilestone:
      return achievement.post?.title ?? null;
    case CreatorAchievementType.CreatorImpressionMilestone:
      return 'Across everything you have published';
    default:
      return null;
  }
};

/**
 * Awards this build can actually describe.
 *
 * Filtering here rather than in the card keeps an unrenderable award from
 * occupying a slot in the grid, and keeps the empty state honest when none of
 * them can be described.
 */
export const describableAchievements = (
  achievements: CreatorAchievement[],
): CreatorAchievement[] =>
  achievements.filter((achievement) => !!achievementTitle(achievement));
