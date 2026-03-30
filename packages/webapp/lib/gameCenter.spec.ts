import type {
  QuestDashboard,
  UserQuest,
} from '@dailydotdev/shared/src/graphql/quests';
import type { UserProductSummary } from '@dailydotdev/shared/src/graphql/njord';
import {
  QuestRewardType,
  QuestStatus,
  QuestType,
} from '@dailydotdev/shared/src/graphql/quests';
import type { TopReader } from '@dailydotdev/shared/src/components/badges/TopReaderBadge';
import type { UserAchievement } from '@dailydotdev/shared/src/graphql/user/achievements';
import { AchievementType } from '@dailydotdev/shared/src/graphql/user/achievements';
import {
  getAchievementSummary,
  getAwardSummary,
  getBadgeSummary,
  getMostProgressedQuest,
  getQuestSummary,
  getTopReaderTopicLabel,
} from './gameCenter';

const createQuest = (
  overrides: Partial<UserQuest> & { questId: string; name: string },
): UserQuest => ({
  userQuestId: `${overrides.questId}-user`,
  rotationId: `${overrides.questId}-rotation`,
  progress: 0,
  status: QuestStatus.InProgress,
  completedAt: null,
  claimedAt: null,
  locked: false,
  claimable: false,
  rewards: [{ type: QuestRewardType.Xp, amount: 50 }],
  quest: {
    id: overrides.questId,
    name: overrides.name,
    description: `${overrides.name} description`,
    type: QuestType.Daily,
    eventType: 'read_post',
    targetCount: 5,
  },
  ...overrides,
});

const createAchievement = (
  overrides: Partial<UserAchievement> & {
    id: string;
    name: string;
    points?: number;
  },
): UserAchievement => ({
  achievement: {
    id: overrides.id,
    name: overrides.name,
    description: `${overrides.name} description`,
    image: 'https://daily.dev/achievement.png',
    type: AchievementType.Milestone,
    criteria: { targetCount: 10 },
    points: overrides.points ?? 100,
    rarity: 10,
    unit: 'posts',
  },
  progress: 0,
  unlockedAt: null,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  ...overrides,
});

describe('game center helpers', () => {
  it('builds quest summaries and prioritizes claimable quests', () => {
    const dashboard: QuestDashboard = {
      level: {
        level: 7,
        totalXp: 1450,
        xpInLevel: 150,
        xpToNextLevel: 250,
      },
      currentStreak: 4,
      longestStreak: 9,
      daily: {
        regular: [
          createQuest({
            questId: 'daily-claimable',
            name: 'Claimable quest',
            progress: 5,
            claimable: true,
            status: QuestStatus.Completed,
          }),
          createQuest({
            questId: 'daily-progress',
            name: 'Almost there',
            progress: 4,
          }),
        ],
        plus: [
          createQuest({
            questId: 'daily-plus',
            name: 'Locked plus quest',
            locked: true,
            progress: 5,
            status: QuestStatus.Completed,
          }),
        ],
      },
      weekly: {
        regular: [
          createQuest({
            questId: 'weekly-claimed',
            name: 'Already claimed',
            claimable: false,
            status: QuestStatus.Claimed,
            claimedAt: new Date('2025-02-01T00:00:00.000Z'),
          }),
        ],
        plus: [],
      },
      milestone: [
        createQuest({
          questId: 'milestone-progress',
          name: 'Milestone quest',
          progress: 7,
          quest: {
            id: 'milestone-progress',
            name: 'Milestone quest',
            description: 'Milestone quest description',
            type: QuestType.Milestone,
            eventType: 'read_post',
            targetCount: 10,
          },
        }),
      ],
    };

    const summary = getQuestSummary(dashboard);

    expect(summary.totalCount).toBe(4);
    expect(summary.completedCount).toBe(3);
    expect(summary.claimableCount).toBe(1);
    expect(summary.lockedCount).toBe(1);
    expect(summary.daily.completionRate).toBe(67);
    expect(summary.weekly.completionRate).toBe(100);
    expect(summary.highlightedQuest?.quest.id).toBe('daily-claimable');
  });

  it('picks the most progressed active quest while skipping claimed ones', () => {
    const mostProgressedQuest = getMostProgressedQuest([
      createQuest({
        questId: 'claimed-milestone',
        name: 'Claimed milestone',
        progress: 10,
        status: QuestStatus.Claimed,
        claimedAt: new Date('2025-02-01T00:00:00.000Z'),
        quest: {
          id: 'claimed-milestone',
          name: 'Claimed milestone',
          description: 'Claimed milestone description',
          type: QuestType.Milestone,
          eventType: 'read_post',
          targetCount: 10,
        },
      }),
      createQuest({
        questId: 'ratio-winner',
        name: 'Ratio winner',
        progress: 7,
        quest: {
          id: 'ratio-winner',
          name: 'Ratio winner',
          description: 'Ratio winner description',
          type: QuestType.Milestone,
          eventType: 'read_post',
          targetCount: 8,
        },
      }),
      createQuest({
        questId: 'progress-loser',
        name: 'Progress loser',
        progress: 9,
        quest: {
          id: 'progress-loser',
          name: 'Progress loser',
          description: 'Progress loser description',
          type: QuestType.Milestone,
          eventType: 'read_post',
          targetCount: 12,
        },
      }),
    ]);

    expect(mostProgressedQuest?.quest.id).toBe('ratio-winner');
  });

  it('builds achievement summaries with deduped featured cards', () => {
    const tracked = createAchievement({
      id: 'tracked',
      name: 'Tracked',
      progress: 9,
      points: 50,
    });
    const rareUnlocked = createAchievement({
      id: 'rare',
      name: 'Rare unlocked',
      unlockedAt: '2025-03-01T00:00:00.000Z',
      points: 200,
      achievement: {
        id: 'rare',
        name: 'Rare unlocked',
        description: 'Rare unlocked description',
        image: 'https://daily.dev/rare.png',
        type: AchievementType.Milestone,
        criteria: { targetCount: 10 },
        points: 200,
        rarity: 1,
        unit: 'posts',
      },
    });
    const latestUnlocked = createAchievement({
      id: 'latest',
      name: 'Latest unlocked',
      unlockedAt: '2025-03-10T00:00:00.000Z',
      points: 120,
    });

    const summary = getAchievementSummary(
      [tracked, rareUnlocked, latestUnlocked],
      tracked,
    );

    expect(summary.unlockedCount).toBe(2);
    expect(summary.totalCount).toBe(3);
    expect(summary.totalPoints).toBe(320);
    expect(summary.nextToUnlock?.achievement.id).toBe('tracked');
    expect(summary.latestUnlocked?.achievement.id).toBe('latest');
    expect(summary.rarestUnlocked?.achievement.id).toBe('rare');
    expect(
      summary.featuredAchievements.map((item) => item.achievement.id),
    ).toEqual(['tracked', 'latest', 'rare']);
  });

  it('builds badge summaries from recent top-reader badges', () => {
    const badges: TopReader[] = [
      {
        id: 'badge-1',
        total: 6,
        issuedAt: '2025-01-02T00:00:00.000Z',
        image: 'https://daily.dev/badge-1.png',
        user: {
          name: 'Taylor',
          image: 'https://daily.dev/taylor.png',
          username: 'taylor',
        },
        keyword: {
          value: 'react',
          flags: { title: 'React' },
        },
      },
      {
        id: 'badge-2',
        total: 6,
        issuedAt: '2025-03-02T00:00:00.000Z',
        image: 'https://daily.dev/badge-2.png',
        user: {
          name: 'Taylor',
          image: 'https://daily.dev/taylor.png',
          username: 'taylor',
        },
        keyword: {
          value: 'typescript',
          flags: { title: 'TypeScript' },
        },
      },
      {
        id: 'badge-3',
        total: 6,
        issuedAt: '2025-02-02T00:00:00.000Z',
        image: 'https://daily.dev/badge-3.png',
        user: {
          name: 'Taylor',
          image: 'https://daily.dev/taylor.png',
          username: 'taylor',
        },
        keyword: {
          value: 'react',
          flags: { title: 'React' },
        },
      },
    ];

    const summary = getBadgeSummary(badges);

    expect(summary.totalBadges).toBe(6);
    expect(summary.uniqueTopics).toBe(2);
    expect(summary.latestBadge?.id).toBe('badge-2');
    expect(summary.mostEarnedBadge?.id).toBe('badge-3');
    expect(summary.mostEarnedBadgeCount).toBe(2);
    expect(getTopReaderTopicLabel(badges[0])).toBe('React');
  });

  it('builds award summaries and orders trophies by count', () => {
    const awards: UserProductSummary[] = [
      {
        id: 'award-1',
        name: 'Supportive',
        image: 'https://daily.dev/award-1.png',
        count: 2,
      },
      {
        id: 'award-2',
        name: 'Insightful',
        image: 'https://daily.dev/award-2.png',
        count: 5,
      },
      {
        id: 'award-3',
        name: 'Creative',
        image: 'https://daily.dev/award-3.png',
        count: 1,
      },
    ];

    const summary = getAwardSummary(awards);

    expect(summary.totalAwards).toBe(8);
    expect(summary.uniqueAwards).toBe(3);
    expect(summary.favoriteAward?.id).toBe('award-2');
    expect(summary.awards.map((award) => award.id)).toEqual([
      'award-2',
      'award-1',
      'award-3',
    ]);
  });
});
