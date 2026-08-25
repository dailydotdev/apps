import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LevelHud } from '@dailydotdev/shared/src/components/quest/LevelHud';
import { SeeAllAchievementsCard } from '../../../webapp/components/game-center/SeeAllAchievementsCard';
import { TopReaderBadgeCompact } from '@dailydotdev/shared/src/components/badges/TopReaderBadgeCompact';
import { AchievementShelfCard } from '@dailydotdev/shared/src/features/profile/components/achievements/AchievementShelfCard';
import type { UserAchievement } from '@dailydotdev/shared/src/graphql/user/achievements';
import { AchievementType } from '@dailydotdev/shared/src/graphql/user/achievements';
import type { UserQuest } from '@dailydotdev/shared/src/graphql/quests';
import {
  QuestRewardType,
  QuestStatus,
  QuestType,
} from '@dailydotdev/shared/src/graphql/quests';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { DataTile } from '@dailydotdev/shared/src/components/DataTile';
import {
  CoreIcon,
  MedalBadgeIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { MilestoneQuestList } from '../../../webapp/components/game-center/MilestoneQuestList';
import { CommunityPulse } from '../../../webapp/components/game-center/CommunityPulse';
import { TrophyGrid } from '../../../webapp/components/game-center/TrophyGrid';
import {
  BadgePager,
  BadgeTrophyCase,
} from '../../../webapp/components/game-center/BadgeTrophyCase';
import type { AwardWithRarity } from '../../../webapp/lib/gameCenter';

const SectionHeader = ({ title }: { title: string }) => (
  <Typography
    tag={TypographyTag.H2}
    type={TypographyType.Body}
    color={TypographyColor.Primary}
    bold
  >
    {title}
  </Typography>
);

const quest = (
  id: string,
  name: string,
  description: string,
  eventType: string,
  progress: number,
  targetCount: number,
  overrides: Partial<UserQuest> = {},
): UserQuest => ({
  userQuestId: `${id}-user`,
  rotationId: `${id}-rotation`,
  progress,
  status: QuestStatus.InProgress,
  completedAt: null,
  claimedAt: null,
  locked: false,
  claimable: false,
  rewards: [
    { type: QuestRewardType.Cores, amount: 500 },
    { type: QuestRewardType.Xp, amount: 120 },
  ],
  quest: {
    id,
    name,
    description,
    type: QuestType.Milestone,
    eventType,
    targetCount,
  },
  ...overrides,
});

const milestoneQuests: UserQuest[] = [
  quest(
    'bookmarks',
    'First 10 bookmarks',
    'Goal reached and reward collected.',
    'bookmark_post',
    10,
    10,
    {
      status: QuestStatus.Claimed,
      claimedAt: new Date('2026-08-01'),
      rewards: [{ type: QuestRewardType.Cores, amount: 250 }],
    },
  ),
  quest(
    'comments',
    'Comment on 25 posts',
    'Share your take across the feed.',
    'comment_create',
    18,
    25,
  ),
  quest(
    'streak',
    'Maintain a 7-day streak',
    'You did it. Claim before it resets.',
    'reading_streak',
    7,
    7,
    {
      claimable: true,
      status: QuestStatus.Completed,
      rewards: [
        { type: QuestRewardType.Cores, amount: 1000 },
        { type: QuestRewardType.Xp, amount: 250 },
      ],
    },
  ),
  quest(
    'reads',
    'Read 100 posts',
    'Keep reading to reach the milestone.',
    'read_post',
    65,
    100,
    {
      rewards: [
        { type: QuestRewardType.Cores, amount: 500 },
        { type: QuestRewardType.Reputation, amount: 50 },
      ],
    },
  ),
  quest(
    'level',
    'Reach level 10',
    'Unlock with daily.dev Plus.',
    'level_up',
    4,
    10,
    {
      locked: true,
      rewards: [{ type: QuestRewardType.Cores, amount: 5000 }],
    },
  ),
  quest(
    'upvotes',
    'Upvote 200 posts',
    'Milestone complete. Reward waiting.',
    'post_upvote',
    200,
    200,
    {
      claimable: true,
      status: QuestStatus.Completed,
      rewards: [
        { type: QuestRewardType.Cores, amount: 2000 },
        { type: QuestRewardType.Reputation, amount: 100 },
      ],
    },
  ),
];

// Real entries from the achievements catalogue, so the shelf shows the
// actual artwork and rarity spread rather than one repeated placeholder.
const achievement = (
  name: string,
  description: string,
  image: string,
  unit: string | null,
  progress: number,
  targetCount: number,
  rarity: number | null,
  unlockedAt: string | null,
): UserAchievement => ({
  achievement: {
    id: name,
    name,
    description,
    image,
    type: AchievementType.Milestone,
    criteria: { targetCount },
    points: 100,
    rarity,
    unit,
  },
  progress,
  unlockedAt,
  createdAt: null,
  updatedAt: null,
});

const achievements: UserAchievement[] = [
  achievement(
    'Committed',
    'Reach a 50-day reading streak',
    'https://media.daily.dev/image/upload/v1770222887/achievements/Comitted.png',
    null,
    50,
    50,
    1.99,
    '2026-08-02T00:00:00.000Z',
  ),
  achievement(
    'In the big league',
    'Gain 10000 reputation',
    'https://media.daily.dev/image/upload/v1770222928/achievements/In_the_big_league.png',
    'reputation',
    6420,
    10000,
    0.051,
    null,
  ),
  achievement(
    'Boosted',
    'Boost a post',
    'https://media.daily.dev/image/upload/v1770222884/achievements/Boosted.png',
    null,
    1,
    1,
    0.061,
    '2026-08-09T00:00:00.000Z',
  ),
  achievement(
    "You're the cool kid!",
    'Receive 100 upvotes',
    'https://media.daily.dev/image/upload/v1770222932/achievements/You_re_the_cool_kid.png',
    'upvotes received',
    63,
    100,
    0.541,
    null,
  ),
];

// Real logos, resolved from the sources library by keyword. GitHub Actions
// has no matching source, so it exercises the initial fallback.
const logo = (slug: string) =>
  `https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/${slug}`;

const badges = [
  {
    issuedAt: new Date('2026-06-01'),
    keyword: { value: 'clickhouse', flags: { title: 'ClickHouse' } },
    image: logo('clickhouse') as string | undefined,
  },
  {
    issuedAt: new Date('2026-05-01'),
    keyword: { value: 'rust', flags: { title: 'Rust' } },
    image: logo('8fb725c4025846578f65c8eada2fc5b8'),
  },
  {
    issuedAt: new Date('2026-04-01'),
    keyword: { value: 'github-actions', flags: { title: 'GitHub Actions' } },
  },
  {
    issuedAt: new Date('2026-03-01'),
    keyword: { value: 'react', flags: { title: 'React' } },
    image: logo('react_js'),
  },
  {
    issuedAt: new Date('2026-02-01'),
    keyword: { value: 'typescript', flags: { title: 'TypeScript' } },
  },
  {
    issuedAt: new Date('2026-01-01'),
    keyword: { value: 'postgresql', flags: { title: 'PostgreSQL' } },
  },
  {
    issuedAt: new Date('2025-12-01'),
    keyword: { value: 'kubernetes', flags: { title: 'Kubernetes' } },
  },
  {
    issuedAt: new Date('2025-11-01'),
    keyword: { value: 'go', flags: { title: 'Go' } },
  },
  {
    issuedAt: new Date('2025-10-01'),
    keyword: { value: 'webassembly', flags: { title: 'WebAssembly' } },
  },
];

// The real catalogue art, so the grid shows the spread of awards rather
// than the same default for every one.
const awardArt = (name: string) =>
  `https://media.daily.dev/image/upload/s--10Rf2kyK--/f_auto/v1743595864/public/${name}`;

const awards: AwardWithRarity[] = [
  { id: 'bug', name: 'Bug', image: awardArt('Bug'), count: 1, value: 750 },
  { id: 'duck', name: 'Duck', image: awardArt('Duck'), count: 2, value: 600 },
  {
    id: 'terminal',
    name: 'Terminal',
    image: awardArt('Terminal'),
    count: 4,
    value: 400,
  },
  { id: 'cash', name: 'Cash', image: awardArt('Cash'), count: 9, value: 250 },
  { id: 'pizza', name: 'Pizza', image: awardArt('Pizza'), count: 14, value: 150 },
  {
    id: 'hotdog',
    name: 'Hotdog',
    image: awardArt('Hotdog'),
    count: 21,
    value: 125,
  },
  { id: 'star', name: 'Star', image: awardArt('Star'), count: 33, value: 100 },
  {
    id: 'coffee',
    name: 'Coffee',
    image: awardArt('Coffee'),
    count: 41,
    value: 75,
  },
].map((award) => ({ ...award, imageGlow: null })) as AwardWithRarity[];

const awardsByCount = [...awards].sort((left, right) => right.count - left.count);

const leaders = [
  [
    'Bobby Iliev',
    'bobbyiliev',
    'https://avatars3.githubusercontent.com/u/21223421?v=4',
    76550,
    328,
  ],
  [
    'Joud Awad',
    'joudawad',
    'https://media.daily.dev/image/upload/s--dOB9RaXY--/f_auto/v1773320801/avatars/avatar_iaC4JsBU0lV8wBsc85fSh',
    74620,
    210,
  ],
  [
    'Randy',
    'randy',
    'https://media.daily.dev/image/upload/s--UjV4-KkB--/f_auto/v1708097210/avatars/avatar_HXYbbGcBO38Rfv7RrCBdA',
    69050,
    198,
  ],
  [
    'Ole-Martin',
    'ombratteng',
    'https://avatars.githubusercontent.com/u/1681525?v=4',
    65260,
    176,
  ],
  [
    'Denis Bolkovskis',
    'denisb0',
    'https://media.daily.dev/image/upload/s--PGCuYx85--/f_auto,q_auto/v1/avatars/avatar_yRuVFf6IbfTylBjx9Dzvt',
    56520,
    155,
  ],
  [
    'OrcDev',
    'orcdev',
    'https://avatars.githubusercontent.com/u/7549148?v=4',
    56390,
    149,
  ],
  [
    'Anja P',
    'anjapcodes',
    'https://media.daily.dev/image/upload/s--M_c0s8Ky--/f_auto/v1721658650/avatars/avatar_WVJSfJtDe63PxQFAsmXFO',
    51350,
    141,
  ],
  [
    'Chris Bongers',
    'dailydevtips',
    'https://media.daily.dev/image/upload/s--9gxFz1e7--/f_auto/v1705902590/avatars/avatar_JUNiIGCV-',
    51285,
    138,
  ],
] as const;

const board = (byQuests: boolean) =>
  leaders.map(([name, username, image, rep, quests], i) => ({
    score: byQuests ? quests : rep,
    user: { id: `${byQuests ? 'q' : 'r'}${i}`, name, username, image },
  })) as never;

const communityStats = {
  totalCount: 90000,
  allTimeLeader: {
    questId: '1',
    questName: 'To the back of the queue',
    questDescription: 'Bookmark 1 post',
    count: 15871,
  },
  weeklyLeader: {
    questId: '2',
    questName: "I'll Get to It Any Day Now",
    questDescription: 'Bookmark 3 posts',
    count: 534,
  },
};


const GameCenterRedesign = () => (
  <div className="pointer-default mx-auto flex w-full max-w-[72rem] flex-col gap-6 p-4 pb-10">
    <section className="-mx-4 -mt-4 flex flex-col">
        <LevelHud
          name="Tomer"
          level={14}
          levelProgress={70}
          totalXp={3420}
          xpInLevel={1400}
          xpToNextLevel={600}
          currentStreak={12}
          longestStreak={28}
          badges={4}
          achievements={{ unlocked: 9, total: 24 }}
          isPending={false}
        />
    </section>

    <section className="flex flex-col gap-4">
      <SectionHeader title="Milestone quests" />
      <MilestoneQuestList
        quests={milestoneQuests}
        showLevelSystem
        onClaim={() => undefined}
      
      />
    </section>




    <section className="flex flex-col gap-4">
      <SectionHeader title="Achievement shelf" />
      <div className="grid grid-cols-2 gap-3 tablet:grid-cols-3 laptop:grid-cols-5">
        {achievements.map((item) => (
          <AchievementShelfCard
            key={item.achievement.id}
            userAchievement={item}
            isOwner
            isTracked={item.achievement.name === "You're the cool kid!"}
            onTrack={async () => undefined}
            onUntrack={async () => undefined}
          />
        ))}
        <SeeAllAchievementsCard href="/tomer/achievements" />
      </div>
    </section>


    <section className="flex flex-col gap-4">
      <SectionHeader title="Badges & Trophies" />
      <BadgeTrophyCase
        badges={
          <BadgePager
            badges={badges.map((badge, index) => ({
              ...badge,
              id: badge.keyword.value,
              total: badges.length - index,
              user: { name: 'Tomer', username: 'tomer', image: '' },
            }))}
          />
        }
        badgeStats={[
          { label: 'Topics mastered', value: badges.length.toString() },
        ]}
        awards={<TrophyGrid awards={awardsByCount} />}
        awardStats={[
          { label: 'Total awards', value: '87' },
          {
            label: 'Total earned',
            icon: (
              <CoreIcon
                size={IconSize.Size16}
                className="text-accent-cheese-default"
              />
            ),
            value: awards
              .reduce((total, award) => total + award.value * award.count, 0)
              .toLocaleString(),
          },
        ]}
      />
    </section>

    <section className="flex flex-col gap-4">
      <SectionHeader title="Community pulse" />
      <CommunityPulse
        stats={communityStats}
        highestReputation={board(false)}
        mostQuestsCompleted={board(true)}
      />
    </section>
  </div>
);

const queryClient = new QueryClient();

const meta: Meta<typeof GameCenterRedesign> = {
  title: 'Pages/Game Center Redesign',
  component: GameCenterRedesign,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      // react-modal binds to #__next, which Next.js renders but Storybook
      // does not; without it the achievement detail modal throws on open.
      <QueryClientProvider client={queryClient}>
        <div id="__next">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof GameCenterRedesign>;

export const AllSections: Story = {};
