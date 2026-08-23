import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LevelHud } from '@dailydotdev/shared/src/components/quest/LevelHud';
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
import { Divider } from '@dailydotdev/shared/src/components/utilities';
import { DataTile } from '@dailydotdev/shared/src/components/DataTile';
import { CoreIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { MilestoneQuestList } from '../../../webapp/components/game-center/MilestoneQuestList';
import { CommunityPulse } from '../../../webapp/components/game-center/CommunityPulse';
import { TrophyGrid } from '../../../webapp/components/game-center/TrophyGrid';
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

const badges = [
  {
    issuedAt: new Date('2026-06-01'),
    keyword: { value: 'clickhouse', flags: { title: 'ClickHouse' } },
  },
  {
    issuedAt: new Date('2026-05-01'),
    keyword: { value: 'rust', flags: { title: 'Rust' } },
  },
  {
    issuedAt: new Date('2026-04-01'),
    keyword: { value: 'github-actions', flags: { title: 'GitHub Actions' } },
  },
  {
    issuedAt: new Date('2026-03-01'),
    keyword: { value: 'react', flags: { title: 'React' } },
  },
];

const awards: AwardWithRarity[] = [
  { id: 'diamond', name: 'Diamond', image: '', count: 1, value: 5000 },
  { id: 'crown', name: 'Crown', image: '', count: 2, value: 2000 },
  { id: 'medal', name: 'Medal', image: '', count: 4, value: 800 },
  { id: 'rocket', name: 'Rocket', image: '', count: 9, value: 300 },
  { id: 'fire', name: 'Fire', image: '', count: 14, value: 120 },
  { id: 'clap', name: 'Clap', image: '', count: 41, value: 20 },
].map((award) => ({ ...award, imageGlow: null })) as AwardWithRarity[];

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

const dividerClass = 'bg-border-subtlest-tertiary';

const GameCenterRedesign = () => (
  <div className="mx-auto flex w-full max-w-[72rem] flex-col gap-6 p-4 pb-10">
    <section>
      <div className="flex flex-col gap-4">
        <Typography
          type={TypographyType.Subhead}
          color={TypographyColor.Tertiary}
          bold
        >
          Progress snapshot
        </Typography>
        <Typography tag={TypographyTag.H1} type={TypographyType.Title1} bold>
          Tomer, here&apos;s how you&apos;re doing.
        </Typography>
        <LevelHud
          level={14}
          levelProgress={70}
          totalXp={3420}
          xpToNextLevel={580}
          currentStreak={12}
          longestStreak={28}
          achievements={{ unlocked: 9, total: 24 }}
          isPending={false}
        />
      </div>
    </section>

    <Divider className={dividerClass} />

    <section className="flex flex-col gap-4">
      <SectionHeader title="Milestone quests" />
      <MilestoneQuestList
        quests={milestoneQuests}
        showLevelSystem
        onClaim={() => undefined}
      />
    </section>

    <Divider className={dividerClass} />

    <section className="flex flex-col gap-4">
      <SectionHeader title="Community pulse" />
      <CommunityPulse
        stats={communityStats}
        highestReputation={board(false)}
        mostQuestsCompleted={board(true)}
      />
    </section>

    <Divider className={dividerClass} />

    <section className="flex flex-col gap-4">
      <SectionHeader title="Achievement shelf" />
      <div className="flex gap-4 overflow-x-auto pb-2">
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
      </div>
    </section>

    <Divider className={dividerClass} />

    <section className="flex flex-col gap-4">
      <SectionHeader title="Badge case" />
      <div className="overflow-x-auto pb-2">
        <div className="flex w-max gap-4">
          {badges.map((badge) => (
            <div key={badge.keyword.value} className="shrink-0">
              <TopReaderBadgeCompact
                issuedAt={badge.issuedAt}
                keyword={badge.keyword}
              />
            </div>
          ))}
        </div>
      </div>
    </section>

    <Divider className={dividerClass} />

    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 laptop:flex-row laptop:items-end laptop:justify-between">
        <SectionHeader title="Trophy case" />
        <DataTile
          label="Total awards"
          value={87}
          info="Every award you have earned across all award types."
          icon={
            <CoreIcon size={IconSize.Small} className="text-text-tertiary" />
          }
          className={{
            container: '!flex-row items-center gap-2 !border-0 !p-0',
            label: '!typo-subhead',
          }}
        />
      </div>
      <TrophyGrid awards={awards} />
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
