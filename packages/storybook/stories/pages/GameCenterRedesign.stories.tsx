import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HeroCard } from '../../../webapp/components/game-center/HeroCard';
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
import { MilestoneQuestList } from '../../../webapp/components/game-center/MilestoneQuestList';
import { TrophyGrid } from '../../../webapp/components/game-center/TrophyGrid';
import type { AwardWithRarity } from '../../../webapp/lib/gameCenter';

const SectionHeader = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <div className="flex flex-col gap-1">
    <Typography
      tag={TypographyTag.H2}
      type={TypographyType.Body}
      color={TypographyColor.Primary}
      bold
    >
      {title}
    </Typography>
    <Typography type={TypographyType.Callout} color={TypographyColor.Tertiary}>
      {description}
    </Typography>
  </div>
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
    'You did it — claim before it resets.',
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
    'Milestone complete — reward waiting.',
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

const dividerClass = 'bg-border-subtlest-tertiary';

const GameCenterRedesign = () => (
  <div className="mx-auto flex w-full max-w-[72rem] flex-col gap-6 p-4 pb-10">
    <div className="grid gap-6 laptop:grid-cols-[19rem_1fr] laptop:items-start">
      <div className="laptop:sticky laptop:top-6">
        <HeroCard
          user={
            {
              id: 'u1',
              name: 'Tomer Redlich',
              username: 'tomer',
              image:
                'https://media.daily.dev/image/upload/s--qsFuKGv_--/t_logo,f_auto/public/noProfile',
            } as never
          }
          level={14}
          levelProgress={70}
          totalXp={3420}
          xpToNextLevel={580}
          currentStreak={12}
          longestStreak={28}
          achievements={{ unlocked: 9, total: 24 }}
          footnote={
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
            >
              <strong className="font-bold text-text-primary">
                Upvote 200 posts
              </strong>{' '}
              is ready to claim.
            </Typography>
          }
        />
      </div>

      <div className="flex min-w-0 flex-col gap-6">
    <Divider className={dividerClass} />

    <section className="flex flex-col gap-4">
      <SectionHeader
        title="Milestone quests"
        description="Longer-running quest goals that track your progress until they are ready to claim."
      />
      <MilestoneQuestList
        quests={milestoneQuests}
        showLevelSystem
        onClaim={() => undefined}
      />
    </section>

    <Divider className={dividerClass} />

    <section className="flex flex-col gap-4">
      <SectionHeader
        title="Achievement shelf"
        description="A mix of what you just unlocked, what is rare, and what is closest to completion."
      />
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
      <SectionHeader
        title="Badge case"
        description="Every top-reader badge you've earned and the subjects you have gone deepest on."
      />
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
      <SectionHeader
        title="Trophy case"
        description="Every award you've earned"
      />
      <TrophyGrid awards={awards} />
    </section>
      </div>
    </div>
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
