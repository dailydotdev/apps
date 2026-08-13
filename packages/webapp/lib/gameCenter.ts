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

  const featuredAchievements = dedupeAchievements([
    trackedAchievement?.unlockedAt ? null : trackedAchievement ?? null,
    nextToUnlock,
    latestUnlocked,
    rarestUnlocked,
  ]);

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

export type TrophyShelfItem = AwardWithRarity & { size: number };

export type GameCenterAwardSummary = {
  awards: UserProductSummary[];
  shelves: TrophyShelfItem[][];
  totalAwards: number;
  uniqueAwards: number;
  favoriteAward: UserProductSummary | null;
};

// Trophies scale with rarity (an award's Cores value). Sizes are in px and are
// consumed as inline width so the shelf can render server-side without JS.
const TROPHY_SIZE_MIN = 64;
const TROPHY_SIZE_MAX = 148;
// Width a single shelf row tries to fill before wrapping to the next plank.
const SHELF_ROW_BUDGET = 540;
const TROPHY_GAP = 32;

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

const getTrophySize = (value: number, min: number, max: number): number => {
  if (max <= min) {
    return Math.round((TROPHY_SIZE_MIN + TROPHY_SIZE_MAX) / 2);
  }
  // sqrt easing keeps the cheapest awards from collapsing to nothing while the
  // rarest still tower over them.
  const ratio = Math.sqrt((value - min) / (max - min));
  return Math.round(
    TROPHY_SIZE_MIN + ratio * (TROPHY_SIZE_MAX - TROPHY_SIZE_MIN),
  );
};

// Rarest-first, packed into shelf rows by width so the big trophies get their
// own roomy plank up top and the commons cluster below.
export const getTrophyShelves = (
  awards: AwardWithRarity[],
): TrophyShelfItem[][] => {
  if (awards.length === 0) {
    return [];
  }

  const sorted = [...awards].sort((left, right) => {
    if (left.value !== right.value) {
      return right.value - left.value;
    }
    if (left.count !== right.count) {
      return right.count - left.count;
    }
    return left.name.localeCompare(right.name);
  });

  const values = sorted.map((award) => award.value);
  const min = Math.min(...values);
  const max = Math.max(...values);

  const items: TrophyShelfItem[] = sorted.map((award) => ({
    ...award,
    size: getTrophySize(award.value, min, max),
  }));

  const shelves: TrophyShelfItem[][] = [];
  let row: TrophyShelfItem[] = [];
  let rowWidth = 0;
  items.forEach((item) => {
    const itemWidth = item.size + TROPHY_GAP;
    if (row.length > 0 && rowWidth + itemWidth > SHELF_ROW_BUDGET) {
      shelves.push(row);
      row = [];
      rowWidth = 0;
    }
    row.push(item);
    rowWidth += itemWidth;
  });
  if (row.length > 0) {
    shelves.push(row);
  }

  return shelves;
};

export const getAwardSummary = (
  awards?: UserProductSummary[],
  products?: Product[],
): GameCenterAwardSummary => {
  const allAwards = sortAwardsByCount(awards ?? []);
  const shelves = getTrophyShelves(
    enrichAwardsWithRarity(allAwards, products ?? []),
  );

  return {
    awards: allAwards,
    shelves,
    totalAwards: allAwards.reduce((total, award) => total + award.count, 0),
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
