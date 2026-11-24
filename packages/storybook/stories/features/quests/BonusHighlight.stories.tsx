import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CompactQuestRow } from '@dailydotdev/shared/src/components/quest/CompactQuestList';
import { QuestCard } from '@dailydotdev/shared/src/components/quest/QuestCard';
import { QuestBonusHighlight } from '@dailydotdev/shared/src/components/quest/QuestBonusRewardBadge';
import type { UserQuest } from '@dailydotdev/shared/src/graphql/quests';
import {
  QuestRewardType,
  QuestStatus,
  QuestType,
} from '@dailydotdev/shared/src/graphql/quests';

/*
 * The `quest_bonus_highlight` flag: how a 2x bonus-reward quest and its Swap
 * button look in the sidebar quest list and the quest dropdown (the mobile
 * drawer shows the same cards). Control is production today.
 */
const queryClient = new QueryClient();

const meta: Meta = {
  title: 'Experiments/Quest bonus highlight',
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj;

const makeQuest = (
  id: string,
  name: string,
  description: string,
  overrides: Partial<UserQuest> = {},
  bonus = false,
): UserQuest => ({
  userQuestId: `uq-${id}`,
  rotationId: `rot-${id}`,
  progress: 1,
  status: QuestStatus.InProgress,
  locked: false,
  claimable: false,
  quest: {
    id,
    name,
    description,
    type: QuestType.Daily,
    eventType: 'upvote_post',
    targetCount: 3,
  },
  rewards: [
    { type: QuestRewardType.Xp, amount: bonus ? 40 : 20 },
    { type: QuestRewardType.Cores, amount: bonus ? 10 : 5 },
  ],
  rewardMultipliers: {
    [QuestRewardType.Xp]: bonus ? 2 : 1,
    [QuestRewardType.Reputation]: 1,
    [QuestRewardType.Cores]: bonus ? 2 : 1,
  },
  refreshCost: 5,
  ...overrides,
});

const quests: UserQuest[] = [
  makeQuest(
    'read',
    'Read 3 posts',
    'Open any 3 posts from your feed.',
    { chainStep: 2, chainLength: 3 },
    true,
  ),
  makeQuest('upvote', 'Upvote 3 posts', 'Upvote posts you find useful.'),
  makeQuest(
    'comment',
    'Leave a comment',
    'Share your take on a post.',
    {
      progress: 3,
      status: QuestStatus.Completed,
      claimable: true,
      refreshCost: null,
      chainStep: 1,
      chainLength: 2,
    },
    true,
  ),
];

const variants: { value: QuestBonusHighlight; label: string; lead: string }[] =
  [
    {
      value: QuestBonusHighlight.Control,
      label: 'Control',
      lead: 'Production today. Swap shows on hover in the sidebar.',
    },
    {
      value: QuestBonusHighlight.V1,
      label: 'v1 · Gold tier',
      lead: 'Gold-tinted quest, "2x rewards" pill, gold rewards. Swap always visible with its price.',
    },
    {
      value: QuestBonusHighlight.V2,
      label: 'v2 · Show the math',
      lead: 'Shimmering 2x, each reward as base → doubled. Swap as an icon by the title.',
    },
    {
      value: QuestBonusHighlight.V3,
      label: 'v3 · Spotlight',
      lead: 'A gold light circles the quest, "2x bonus" label. Swap as a gold outlined button with price.',
    },
  ];

const noop = (): void => undefined;

const Column = ({
  label,
  lead,
  children,
}: {
  label: string;
  lead: string;
  children: ReactNode;
}): ReactElement => (
  <section className="flex w-[22rem] shrink-0 flex-col gap-3">
    <div className="flex flex-col gap-1">
      <h2 className="font-bold text-text-primary typo-title3">{label}</h2>
      <p className="min-h-10 text-text-tertiary typo-footnote">{lead}</p>
    </div>
    {children}
  </section>
);

const Sidebar = ({
  highlight,
}: {
  highlight: QuestBonusHighlight;
}): ReactElement => (
  <div className="w-60 rounded-16 border border-border-subtlest-tertiary bg-background-default py-2">
    <p className="px-3 pb-1 text-text-quaternary typo-callout">Daily quests</p>
    <ul className="flex flex-col gap-0.5 px-3">
      {quests.map((quest) => (
        <CompactQuestRow
          key={quest.rotationId}
          quest={quest}
          isClaiming={false}
          onClaim={noop}
          onRefresh={noop}
          highlight={highlight}
        />
      ))}
    </ul>
  </div>
);

const PhoneDrawer = ({
  highlight,
}: {
  highlight: QuestBonusHighlight;
}): ReactElement => (
  <div className="w-[22rem] rounded-t-24 border border-border-subtlest-tertiary bg-background-default p-4">
    <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-surface-float" />
    <h4 className="mb-2 font-bold text-text-primary typo-callout">
      Daily quests
    </h4>
    <div className="flex flex-col gap-2">
      {quests.map((quest) => (
        <QuestCard
          key={quest.rotationId}
          quest={quest}
          onClaim={noop}
          showLevelSystem
          isClaiming={false}
          isClaimAnimating={false}
          showClaimedStamp={false}
          animateClaimedStamp={false}
          suppressPersistedClaimedStamp={false}
          onRefresh={noop}
          highlight={highlight}
        />
      ))}
    </div>
  </div>
);

const Board = ({ surface }: { surface: 'sidebar' | 'phone' }): ReactElement => (
  <div className="flex min-h-screen gap-8 bg-background-subtle p-8">
    {variants.map(({ value, label, lead }) => (
      <Column key={value} label={label} lead={lead}>
        {surface === 'sidebar' ? (
          <Sidebar highlight={value} />
        ) : (
          <PhoneDrawer highlight={value} />
        )}
      </Column>
    ))}
  </div>
);

export const SidebarQuests: Story = {
  name: 'Sidebar quest list',
  render: () => <Board surface="sidebar" />,
};

export const MobileQuestDrawer: Story = {
  name: 'Mobile quest drawer (header)',
  render: () => <Board surface="phone" />,
};
