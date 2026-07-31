import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QuestCard } from '@dailydotdev/shared/src/components/quest/QuestCard';
import { CompactQuestRow } from '@dailydotdev/shared/src/components/quest/CompactQuestList';
import type {
  QuestReward,
  UserQuest,
} from '@dailydotdev/shared/src/graphql/quests';
import {
  QuestRewardType,
  QuestStatus,
  QuestType,
} from '@dailydotdev/shared/src/graphql/quests';

// Every quest state, on both surfaces that render one:
//
//   • QuestCard        — Game Center / quest dropdown
//   • CompactQuestRow  — the v2 sidebar's Streak panel list
//
// State is not a single field. It is derived from `status`, `claimable`,
// `locked` and `progress` (see getQuestStatusLabel in QuestCard), plus the
// transient claim flags. Each column below is one of those combinations.
//
// NOTE on the "active" colour: an in-progress quest and a completed one both
// draw the progress bar in `accent-cabbage-default`; only `locked` differs
// (`accent-cabbage-bolder`). So nothing in the CARD colour distinguishes
// "actively in progress" — only the status text and the bar's width. That is
// the gap to review here.

const reward = (type: QuestRewardType, amount: number): QuestReward => ({
  type,
  amount,
});

const XP = reward(QuestRewardType.Xp, 50);
const CORES = reward(QuestRewardType.Cores, 20);
const REP = reward(QuestRewardType.Reputation, 10);

// `quest` is omitted from the base so it can be overridden field-by-field —
// intersecting instead would still demand a whole QuestDefinition.
type QuestOverrides = Omit<Partial<UserQuest>, 'quest'> & {
  quest?: Partial<UserQuest['quest']>;
};

const makeQuest = (overrides: QuestOverrides = {}): UserQuest => {
  const { quest: questOverrides, ...rest } = overrides;

  return {
    userQuestId: 'uq-1',
    rotationId: 'rot-1',
    progress: 1,
    status: QuestStatus.InProgress,
    completedAt: null,
    claimedAt: null,
    locked: false,
    claimable: false,
    rewards: [XP, CORES],
    quest: {
      id: 'q-1',
      name: 'Read 3 posts',
      description: 'Read three posts from your feed today.',
      type: QuestType.Daily,
      eventType: 'read_post',
      targetCount: 3,
      ...questOverrides,
    },
    ...rest,
  };
};

// The full state matrix, in the order a quest moves through it.
const STATES: { label: string; note: string; quest: UserQuest }[] = [
  {
    label: 'Not started',
    note: 'in_progress, 0 of 3',
    quest: makeQuest({ progress: 0 }),
  },
  {
    label: 'In progress',
    note: 'in_progress, 1 of 3',
    quest: makeQuest({ progress: 1 }),
  },
  {
    label: 'Almost there',
    note: 'in_progress, 2 of 3',
    quest: makeQuest({ progress: 2 }),
  },
  {
    label: 'Completed',
    note: 'completed, not claimable',
    quest: makeQuest({
      progress: 3,
      status: QuestStatus.Completed,
      completedAt: null,
    }),
  },
  {
    label: 'Ready to claim',
    note: 'completed + claimable',
    quest: makeQuest({
      progress: 3,
      status: QuestStatus.Completed,
      claimable: true,
    }),
  },
  {
    label: 'Claimed',
    note: 'claimed',
    quest: makeQuest({
      progress: 3,
      status: QuestStatus.Claimed,
      claimable: false,
    }),
  },
  {
    label: 'Plus required',
    note: 'completed + locked',
    quest: makeQuest({
      progress: 3,
      status: QuestStatus.Completed,
      locked: true,
    }),
  },
];

const REWARD_VARIANTS: { label: string; rewards: QuestReward[] }[] = [
  { label: 'XP + Cores', rewards: [XP, CORES] },
  { label: 'XP only', rewards: [XP] },
  { label: 'Cores only', rewards: [CORES] },
  { label: 'Reputation', rewards: [REP] },
  { label: 'All three', rewards: [XP, CORES, REP] },
];

const noop = () => undefined;

const cardProps = {
  onClaim: noop,
  showLevelSystem: true,
  isClaiming: false,
  isClaimAnimating: false,
  showClaimedStamp: false,
  animateClaimedStamp: false,
  suppressPersistedClaimedStamp: false,
};

const Cell = ({
  label,
  note,
  children,
}: {
  label: string;
  note?: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-2">
    <div className="flex flex-col">
      <span className="font-bold text-text-primary typo-caption1">{label}</span>
      {note && (
        <span className="text-text-quaternary typo-caption2">{note}</span>
      )}
    </div>
    {children}
  </div>
);

const meta: Meta = {
  title: 'Components/Quest/States',
  decorators: [
    (Story) => (
      <div className="min-h-[300px] bg-background-default p-8">
        <Story />
      </div>
    ),
  ],
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

// The card as Game Center renders it, in every state.
export const Card: Story = {
  render: () => (
    <div className="grid gap-6 tablet:grid-cols-2 laptop:grid-cols-3">
      {STATES.map(({ label, note, quest }) => (
        <Cell key={label} label={label} note={note}>
          <QuestCard {...cardProps} quest={quest} />
        </Cell>
      ))}
    </div>
  ),
};

// Transient claim states — the flags QuestSection drives during a claim.
export const CardClaimFlow: Story = {
  render: () => {
    const claimable = makeQuest({
      progress: 3,
      status: QuestStatus.Completed,
      claimable: true,
    });

    return (
      <div className="grid gap-6 tablet:grid-cols-2 laptop:grid-cols-3">
        <Cell label="Ready to claim" note="idle">
          <QuestCard {...cardProps} quest={claimable} />
        </Cell>
        <Cell label="Claiming" note="isClaiming">
          <QuestCard {...cardProps} quest={claimable} isClaiming />
        </Cell>
        <Cell label="Claim animating" note="isClaimAnimating">
          <QuestCard {...cardProps} quest={claimable} isClaimAnimating />
        </Cell>
        <Cell label="Claimed stamp" note="showClaimedStamp">
          <QuestCard
            {...cardProps}
            quest={makeQuest({ progress: 3, status: QuestStatus.Claimed })}
            showClaimedStamp
          />
        </Cell>
        <Cell label="Stamp animating" note="animateClaimedStamp">
          <QuestCard
            {...cardProps}
            quest={makeQuest({ progress: 3, status: QuestStatus.Claimed })}
            showClaimedStamp
            animateClaimedStamp
          />
        </Cell>
      </div>
    );
  },
};

// Reward chips, plus the level-system toggle that hides XP.
export const CardRewards: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <div className="grid gap-6 tablet:grid-cols-2 laptop:grid-cols-3">
        {REWARD_VARIANTS.map(({ label, rewards }) => (
          <Cell key={label} label={label} note="showLevelSystem: true">
            <QuestCard {...cardProps} quest={makeQuest({ rewards })} />
          </Cell>
        ))}
      </div>
      <div className="grid gap-6 tablet:grid-cols-2 laptop:grid-cols-3">
        {REWARD_VARIANTS.map(({ label, rewards }) => (
          <Cell key={label} label={label} note="showLevelSystem: false — XP hidden">
            <QuestCard
              {...cardProps}
              showLevelSystem={false}
              quest={makeQuest({ rewards })}
            />
          </Cell>
        ))}
      </div>
    </div>
  ),
};

// A card with a destination shows the arrow that jumps to where the quest is
// completed; without one it doesn't. Claimable/claimed cards hide it either way.
export const CardDestination: Story = {
  render: () => (
    <div className="grid gap-6 tablet:grid-cols-2 laptop:grid-cols-3">
      <Cell label="With destination" note="arrow visible">
        <QuestCard
          {...cardProps}
          quest={makeQuest()}
          destination={{ label: 'Feed', path: '/' }}
          onDestinationClick={noop}
        />
      </Cell>
      <Cell label="No destination" note="no arrow">
        <QuestCard {...cardProps} quest={makeQuest()} />
      </Cell>
      <Cell label="Claimable + destination" note="claim takes priority">
        <QuestCard
          {...cardProps}
          quest={makeQuest({
            progress: 3,
            status: QuestStatus.Completed,
            claimable: true,
          })}
          destination={{ label: 'Feed', path: '/' }}
          onDestinationClick={noop}
        />
      </Cell>
      <Cell label="Eyebrow + status override" note="eyebrow / statusLabel props">
        <QuestCard
          {...cardProps}
          quest={makeQuest()}
          eyebrow={
            <span className="text-text-quaternary typo-caption2">WEEKLY</span>
          }
          statusLabel="Resets in 3 days"
        />
      </Cell>
    </div>
  ),
};

// The compact row used by the v2 sidebar's Streak panel. Rendered on the panel's
// own width so truncation and the hover pill read true to the app.
export const SidebarRow: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      {[
        { label: 'Not started', quest: makeQuest({ progress: 0 }) },
        { label: 'In progress', quest: makeQuest({ progress: 1 }) },
        {
          label: 'Ready to claim',
          quest: makeQuest({
            progress: 3,
            status: QuestStatus.Completed,
            claimable: true,
          }),
        },
        {
          label: 'Claiming',
          quest: makeQuest({
            progress: 3,
            status: QuestStatus.Completed,
            claimable: true,
          }),
          isClaiming: true,
        },
        {
          label: 'Claimed',
          quest: makeQuest({ progress: 3, status: QuestStatus.Claimed }),
        },
        {
          label: 'Long title + description',
          quest: makeQuest({
            progress: 2,
            quest: {
              name: 'Upvote five posts and leave a comment on one of them',
              description:
                'A deliberately long description to check wrapping inside the narrow sidebar panel.',
              targetCount: 5,
            },
          }),
        },
      ].map(({ label, quest, isClaiming }) => (
        <Cell key={label} label={label}>
          {/* 320px ≈ the v2 context panel's inner width. */}
          <ul className="w-[320px] rounded-10 bg-background-subtle px-3 py-2">
            <CompactQuestRow
              quest={quest}
              isClaiming={Boolean(isClaiming)}
              onClaim={noop}
            />
          </ul>
        </Cell>
      ))}
    </div>
  ),
};
