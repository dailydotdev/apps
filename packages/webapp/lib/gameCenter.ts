import type { TopReader } from '@dailydotdev/shared/src/components/badges/TopReaderBadge';
import type {
  Product,
  UserProductSummary,
} from '@dailydotdev/shared/src/graphql/njord';
import type {
  QuestBucket,
  QuestDashboard,
  UserQuest,
} from '@dailydotdev/shared/src/graphql/quests';
import { QuestStatus } from '@dailydotdev/shared/src/graphql/quests';
import type { UserAchievement } from '@dailydotdev/shared/src/graphql/user/achievements';
import { getTargetCount } from '@dailydotdev/shared/src/graphql/user/achievements';

const getDateValue = (value?: string | Date | null): number => {
  if (!value) {
    return 0;
  }

  return new Date(value).getTime() || 0;
};

const isQuestComplete = (quest: UserQuest): boolean =>
  quest.claimable ||
  quest.status === QuestStatus.Completed ||
  quest.status === QuestStatus.Claimed;

const getQuestProgressRatio = (quest: UserQuest): number => {
  const target = Math.max(quest.quest.targetCount, 1);
  return Math.min(quest.progress / target, 1);
};

const getQuestRewardTotal = (quest: UserQuest): number =>
  quest.rewards.reduce((total, reward) => total + reward.amount, 0);

export type GameCenterQuestBucketSummary = {
  all: UserQuest[];
  regular: UserQuest[];
  plus: UserQuest[];
  totalCount: number;
  completedCount: number;
  claimableCount: number;
  inProgressCount: number;
  lockedCount: number;
  completionRate: number;
};

export type GameCenterQuestSummary = GameCenterQuestBucketSummary & {
  daily: GameCenterQuestBucketSummary;
  weekly: GameCenterQuestBucketSummary;
  highlightedQuest: UserQuest | null;
};

const getQuestBucketSummary = (
  bucket?: QuestBucket,
): GameCenterQuestBucketSummary => {
  const regular = bucket?.regular ?? [];
  const plus = bucket?.plus ?? [];
  const all = [...regular, ...plus];
  const completedCount = all.filter(isQuestComplete).length;
  const claimableCount = all.filter((quest) => quest.claimable).length;
  const lockedCount = all.filter((quest) => quest.locked).length;
  const totalCount = all.length;

  return {
    all,
    regular,
    plus,
    totalCount,
    completedCount,
    claimableCount,
    lockedCount,
    inProgressCount: Math.max(totalCount - completedCount, 0),
    completionRate:
      totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
  };
};

const getHighlightedQuest = (quests: UserQuest[]): UserQuest | null => {
  if (quests.length === 0) {
    return null;
  }

  return [...quests].sort((left, right) => {
    if (left.claimable !== right.claimable) {
      return left.claimable ? -1 : 1;
    }

    if (left.locked !== right.locked) {
      return left.locked ? 1 : -1;
    }

    const ratioDifference =
      getQuestProgressRatio(right) - getQuestProgressRatio(left);

    if (ratioDifference !== 0) {
      return ratioDifference;
    }

    return getQuestRewardTotal(right) - getQuestRewardTotal(left);
  })[0];
};

export const getMostProgressedQuest = (
  quests?: UserQuest[],
): UserQuest | null => {
  const activeQuests =
    quests?.filter(
      (quest) => !quest.claimable && quest.status !== QuestStatus.Claimed,
    ) ?? [];

  if (activeQuests.length === 0) {
    return null;
  }

  return [...activeQuests].sort((left, right) => {
    if (left.locked !== right.locked) {
      return left.locked ? 1 : -1;
    }

    const ratioDifference =
      getQuestProgressRatio(right) - getQuestProgressRatio(left);

    if (ratioDifference !== 0) {
      return ratioDifference;
    }

    if (left.progress !== right.progress) {
      return right.progress - left.progress;
    }

    return getQuestRewardTotal(right) - getQuestRewardTotal(left);
  })[0];
};

const MILESTONE_RANK_CLAIMABLE = 0;
const MILESTONE_RANK_IN_PROGRESS = 1;
const MILESTONE_RANK_CLAIMED = 2;

const getMilestoneRank = (quest: UserQuest): number => {
  if (quest.status === QuestStatus.Claimed) {
    return MILESTONE_RANK_CLAIMED;
  }

  if (quest.claimable) {
    return MILESTONE_RANK_CLAIMABLE;
  }

  return MILESTONE_RANK_IN_PROGRESS;
};

// A claimable milestone is a reward the user can collect right now, so it wins
// the top of the list over anything still running, and spent ones sink.
export const sortMilestoneQuests = (quests: UserQuest[]): UserQuest[] =>
  [...quests].sort((left, right) => {
    const rankDifference = getMilestoneRank(left) - getMilestoneRank(right);

    if (rankDifference !== 0) {
      return rankDifference;
    }

    const ratioDifference =
      getQuestProgressRatio(right) - getQuestProgressRatio(left);

    if (ratioDifference !== 0) {
      return ratioDifference;
    }

    return getQuestRewardTotal(right) - getQuestRewardTotal(left);
  });

export const getQuestSummary = (
  dashboard?: QuestDashboard,
): GameCenterQuestSummary => {
  const daily = getQuestBucketSummary(dashboard?.daily);
  const weekly = getQuestBucketSummary(dashboard?.weekly);
  const all = [...daily.all, ...weekly.all];
  const completedCount = all.filter(isQuestComplete).length;
  const claimableCount = all.filter((quest) => quest.claimable).length;
  const lockedCount = all.filter((quest) => quest.locked).length;
  const totalCount = all.length;

  return {
    all,
    totalCount,
    completedCount,
    claimableCount,
    lockedCount,
    inProgressCount: Math.max(totalCount - completedCount, 0),
    completionRate:
      totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
    highlightedQuest: getHighlightedQuest(all),
    daily,
    weekly,
    regular: [...daily.regular, ...weekly.regular],
    plus: [...daily.plus, ...weekly.plus],
  };
};

const getAchievementProgressRatio = (achievement: UserAchievement): number => {
  const target = Math.max(getTargetCount(achievement.achievement), 1);
  return Math.min(achievement.progress / target, 1);
};

const dedupeAchievements = (
  achievements: Array<UserAchievement | null>,
): UserAchievement[] => {
  const seen = new Set<string>();

  return achievements.filter((achievement): achievement is UserAchievement => {
    if (!achievement) {
      return false;
    }

    if (seen.has(achievement.achievement.id)) {
      return false;
    }

    seen.add(achievement.achievement.id);
    return true;
  });
};

export type GameCenterAchievementSummary = {
  unlockedCount: number;
  totalCount: number;
  totalPoints: number;
  latestUnlocked: UserAchievement | null;
  rarestUnlocked: UserAchievement | null;
  nextToUnlock: UserAchievement | null;
  featuredAchievements: UserAchievement[];
  // Everything unlocked or under way, for the shelf. Untouched achievements
  // stay out: an empty progress bar says nothing about your history.
  shelfAchievements: UserAchievement[];
};

export const getAchievementSummary = (
  achievements?: UserAchievement[],
  trackedAchievement?: UserAchievement | null,
): GameCenterAchievementSummary => {
  const allAchievements = achievements ?? [];
  const unlocked = allAchievements.filter(
    (achievement) => achievement.unlockedAt !== null,
  );
  const locked = allAchievements.filter(
    (achievement) => achievement.unlockedAt === null,
  );

  const latestUnlocked =
    [...unlocked].sort(
      (left, right) =>
        getDateValue(right.unlockedAt) - getDateValue(left.unlockedAt),
    )[0] ?? null;

  const rarestUnlocked =
    [...unlocked].sort((left, right) => {
      const leftRarity = left.achievement.rarity ?? Number.POSITIVE_INFINITY;
      const rightRarity = right.achievement.rarity ?? Number.POSITIVE_INFINITY;

      if (leftRarity !== rightRarity) {
        return leftRarity - rightRarity;
      }

      return getDateValue(right.unlockedAt) - getDateValue(left.unlockedAt);
    })[0] ?? null;

  const nextToUnlock =
    [...locked].sort((left, right) => {
      const progressDifference =
        getAchievementProgressRatio(right) - getAchievementProgressRatio(left);

      if (progressDifference !== 0) {
        return progressDifference;
      }

      if (left.progress !== right.progress) {
        return right.progress - left.progress;
      }

      return right.achievement.points - left.achievement.points;
    })[0] ?? null;

  // The four are picked by role, then ordered by how far along they are, so
  // the shelf reads left to right from unlocked to furthest away.
  const featuredAchievements = dedupeAchievements([
    trackedAchievement?.unlockedAt ? null : trackedAchievement ?? null,
    nextToUnlock,
    latestUnlocked,
    rarestUnlocked,
  ]).sort(
    (left, right) =>
      getAchievementProgressRatio(right) - getAchievementProgressRatio(left),
  );

  const shelfAchievements = [...allAchievements]
    .filter(
      (achievement) =>
        achievement.unlockedAt !== null || achievement.progress > 0,
    )
    .sort(
      (left, right) =>
        getAchievementProgressRatio(right) - getAchievementProgressRatio(left),
    );

  return {
    unlockedCount: unlocked.length,
    totalCount: allAchievements.length,
    totalPoints: unlocked.reduce(
      (total, achievement) => total + (achievement.achievement.points ?? 0),
      0,
    ),
    latestUnlocked,
    rarestUnlocked,
    nextToUnlock,
    featuredAchievements,
    shelfAchievements,
  };
};

export const getTopReaderTopicLabel = (
  badge: Pick<TopReader, 'keyword'>,
): string => badge.keyword.flags?.title || badge.keyword.value;

const sortAwardsByCount = (
  awards: UserProductSummary[],
): UserProductSummary[] => {
  return [...awards].sort((left, right) => {
    if (left.count !== right.count) {
      return right.count - left.count;
    }

    return left.name.localeCompare(right.name);
  });
};

export type AwardWithRarity = UserProductSummary & {
  value: number;
  imageGlow?: string | null;
};

export type GameCenterAwardSummary = {
  awards: UserProductSummary[];
  // Awards ordered rarest-first.
  awardsByRarity: AwardWithRarity[];
  // Awards ordered by how many you hold, for the trophy grid.
  awardsByCount: AwardWithRarity[];
  totalAwards: number;
  // What the collection is worth in Cores, counting duplicates.
  totalAwardValue: number;
  uniqueAwards: number;
  favoriteAward: UserProductSummary | null;
};

const enrichAwardsWithRarity = (
  awards: UserProductSummary[],
  products: Product[],
): AwardWithRarity[] => {
  const byId = new Map(products.map((product) => [product.id, product]));
  return awards.map((award) => {
    const product = byId.get(award.id);
    return {
      ...award,
      value: product?.value ?? 0,
      imageGlow: product?.flags?.imageGlow ?? null,
    };
  });
};

// Rarest-first: an award's Cores value is the rarity signal, with the earned
// count and name as tie-breakers.
export const sortAwardsByRarity = (
  awards: AwardWithRarity[],
): AwardWithRarity[] => {
  return [...awards].sort((left, right) => {
    if (left.value !== right.value) {
      return right.value - left.value;
    }
    if (left.count !== right.count) {
      return right.count - left.count;
    }
    return left.name.localeCompare(right.name);
  });
};

export const getAwardSummary = (
  awards?: UserProductSummary[],
  products?: Product[],
): GameCenterAwardSummary => {
  const allAwards = sortAwardsByCount(awards ?? []);
  const awardsByRarity = sortAwardsByRarity(
    enrichAwardsWithRarity(allAwards, products ?? []),
  );

  return {
    awards: allAwards,
    awardsByRarity,
    awardsByCount: [...awardsByRarity].sort(
      (left, right) => right.count - left.count,
    ),
    totalAwards: allAwards.reduce((total, award) => total + award.count, 0),
    totalAwardValue: awardsByRarity.reduce(
      (total, award) => total + award.value * award.count,
      0,
    ),
    uniqueAwards: allAwards.length,
    favoriteAward: allAwards[0] ?? null,
  };
};

export type GameCenterBadgeSummary = {
  totalBadges: number;
  uniqueTopics: number;
  latestBadge: TopReader | null;
  mostEarnedBadge: TopReader | null;
  mostEarnedBadgeCount: number;
};

export const getBadgeSummary = (
  badges?: TopReader[],
): GameCenterBadgeSummary => {
  const allBadges = badges ?? [];
  const latestBadge =
    [...allBadges].sort(
      (left, right) =>
        getDateValue(right.issuedAt) - getDateValue(left.issuedAt),
    )[0] ?? null;
  const topicCounts = allBadges.reduce<Map<string, number>>((counts, badge) => {
    const topic = getTopReaderTopicLabel(badge);
    counts.set(topic, (counts.get(topic) ?? 0) + 1);
    return counts;
  }, new Map());
  const mostEarnedBadge =
    [...allBadges].sort((left, right) => {
      const countDifference =
        (topicCounts.get(getTopReaderTopicLabel(right)) ?? 0) -
        (topicCounts.get(getTopReaderTopicLabel(left)) ?? 0);

      if (countDifference !== 0) {
        return countDifference;
      }

      const issuedAtDifference =
        getDateValue(right.issuedAt) - getDateValue(left.issuedAt);

      if (issuedAtDifference !== 0) {
        return issuedAtDifference;
      }

      return getTopReaderTopicLabel(left).localeCompare(
        getTopReaderTopicLabel(right),
      );
    })[0] ?? null;
  const mostEarnedBadgeCount = mostEarnedBadge
    ? topicCounts.get(getTopReaderTopicLabel(mostEarnedBadge)) ?? 0
    : 0;

  return {
    totalBadges: allBadges[0]?.total ?? allBadges.length,
    uniqueTopics: new Set(allBadges.map(getTopReaderTopicLabel)).size,
    latestBadge,
    mostEarnedBadge,
    mostEarnedBadgeCount,
  };
};
