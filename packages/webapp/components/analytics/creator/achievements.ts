import type {
  CreatorAchievement,
  SharedCreatorAchievement,
} from '@dailydotdev/shared/src/graphql/creatorAchievements';
import { CreatorAchievementType } from '@dailydotdev/shared/src/graphql/creatorAchievements';
import {
  getPlusMemberDateFormat,
  getTopReaderBadgeDateFormat,
} from '@dailydotdev/shared/src/lib/dateFormat';
import { formatDataTileValue } from '@dailydotdev/shared/src/lib/numberFormat';
import type {
  AchievementCardData,
  AchievementCardKind,
} from '../../image-generator/ShareCard';

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
): string | null =>
  achievement.periodStart
    ? getTopReaderBadgeDateFormat(achievement.periodStart, { utc: true })
    : null;

export const achievementDateLabel = (
  achievement: Pick<CreatorAchievement, 'achievedAt'>,
): string => getPlusMemberDateFormat(achievement.achievedAt);

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

/**
 * Who a line is written for: the creator on their own dashboard, or anyone
 * following a link they shared.
 */
export type AchievementAudience = 'owner' | 'public';

/** The line under the headline, or null when there is nothing to add. */
export const achievementSubtitle = (
  achievement: Pick<
    CreatorAchievement,
    'type' | 'periodStart' | 'threshold' | 'post'
  >,
  audience: AchievementAudience = 'owner',
): string | null => {
  switch (achievement.type) {
    case CreatorAchievementType.CategoryRanking:
      return achievementPeriodLabel(achievement);
    case CreatorAchievementType.PostUpvoteMilestone:
      return achievement.post?.title ?? null;
    case CreatorAchievementType.CreatorImpressionMilestone:
      return audience === 'owner'
        ? 'Across everything you have published'
        : 'Across everything they have published on daily.dev';
    default:
      return null;
  }
};

const achievementCardKinds: Record<
  CreatorAchievementType,
  AchievementCardKind
> = {
  [CreatorAchievementType.CategoryRanking]: 'ranking',
  [CreatorAchievementType.PostUpvoteMilestone]: 'upvotes',
  [CreatorAchievementType.CreatorImpressionMilestone]: 'impressions',
};

/**
 * What a ranking or milestone is measured against, as the card's eyebrow.
 */
export const achievementContextLabel = (
  achievement: Pick<CreatorAchievement, 'type' | 'periodStart'>,
): string | null => {
  switch (achievement.type) {
    case CreatorAchievementType.CategoryRanking: {
      const period = achievementPeriodLabel(achievement);

      return period ? `Best of ${period}` : 'Best of daily.dev';
    }
    case CreatorAchievementType.PostUpvoteMilestone:
      return 'Upvote milestone';
    case CreatorAchievementType.CreatorImpressionMilestone:
      return 'Impression milestone';
    default:
      return null;
  }
};

/**
 * The share card's content, built from the public record alone. Null for an
 * award this build cannot describe, so no card is rendered for it rather than
 * one with a blank claim.
 */
export const achievementCardData = (
  achievement: SharedCreatorAchievement,
): AchievementCardData | null => {
  const headline = achievementTitle(achievement);
  const kind = achievementCardKinds[achievement.type];

  if (!headline || !kind) {
    return null;
  }

  return {
    creator: {
      name: achievement.user.name,
      image: achievement.user.image,
    },
    kind,
    headline,
    context: achievementContextLabel(achievement) ?? undefined,
    // The period is already in the eyebrow for a ranking, so the line under
    // the headline is the article it is about.
    detail:
      achievement.type === CreatorAchievementType.CategoryRanking
        ? achievement.post?.title ?? undefined
        : achievementSubtitle(achievement, 'public') ?? undefined,
    date: `Earned ${achievementDateLabel(achievement)}`,
  };
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
