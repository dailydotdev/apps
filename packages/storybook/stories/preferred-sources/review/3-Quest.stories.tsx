import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QuestCard } from '@dailydotdev/shared/src/components/quest/QuestCard';
import { CompactQuestRow } from '@dailydotdev/shared/src/components/quest/CompactQuestList';
import type { UserQuest } from '@dailydotdev/shared/src/graphql/quests';
import {
  QuestRewardType,
  QuestStatus,
  QuestType,
} from '@dailydotdev/shared/src/graphql/quests';
import { getPreferredSourceUrl } from '@dailydotdev/shared/src/lib/preferredSources';
import { ReviewProviders } from './_providers';
import { Note } from './_review';

type Args = { variant: 'current' | 'proposed' };

const readQuest: UserQuest = {
  userQuestId: 'uq-read',
  rotationId: 'rot-1',
  progress: 1,
  status: QuestStatus.InProgress,
  completedAt: null,
  claimedAt: null,
  locked: false,
  claimable: false,
  rewards: [{ type: QuestRewardType.Xp, amount: 50 }],
  quest: {
    id: 'q-read',
    name: 'Read 3 posts',
    description: 'Read three posts from your feed today.',
    type: QuestType.Daily,
    eventType: 'read_post',
    targetCount: 3,
  },
};

const googleQuest = (done: boolean): UserQuest => ({
  userQuestId: 'uq-google',
  rotationId: 'rot-1',
  progress: done ? 1 : 0,
  status: done ? QuestStatus.Completed : QuestStatus.InProgress,
  completedAt: null,
  claimedAt: null,
  locked: false,
  claimable: done,
  rewards: [
    { type: QuestRewardType.Cores, amount: 50 },
    { type: QuestRewardType.Xp, amount: 100 },
  ],
  quest: {
    id: 'q-google',
    name: 'Make daily.dev a preferred source on Google',
    description:
      'Tell Google to show daily.dev more often in Top Stories and AI Overviews. One tap.',
    type: QuestType.Milestone,
    eventType: 'google_preferred_source',
    targetCount: 1,
  },
});

/**
 * Intent: "I'm here to do small things for rewards." A one-time milestone
 * quest in the real QuestCard (Game Center / quest dropdown) and the real
 * CompactQuestRow (sidebar streak panel). The "Go" arrow is a normal href
 * destination — the deeplink — and completion is recorded on click, since
 * Google offers no way to read the state back.
 */
const Page = ({ variant }: Args) => {
  const [done, setDone] = useState(false);
  const quests = [
    readQuest,
    ...(variant === 'proposed' ? [googleQuest(done)] : []),
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Note>Game Center / quest dropdown — QuestCard</Note>
        <div className="grid max-w-[44rem] grid-cols-1 gap-3 tablet:grid-cols-2">
          {quests.map((quest) => (
            <QuestCard
              key={quest.quest.id}
              quest={quest}
              onClaim={() => {}}
              showLevelSystem
              isClaiming={false}
              isClaimAnimating={false}
              showClaimedStamp={false}
              animateClaimedStamp={false}
              suppressPersistedClaimedStamp
              destination={
                quest.quest.id === 'q-google'
                  ? {
                      label: 'Google',
                      href: getPreferredSourceUrl('daily.dev'),
                      openInNewTab: true,
                    }
                  : null
              }
              onDestinationClick={() => setDone(true)}
            />
          ))}
        </div>
      </div>
      <div>
        <Note>Sidebar streak panel — CompactQuestRow</Note>
        <div className="flex max-w-[20rem] flex-col gap-1 rounded-16 border border-border-subtlest-tertiary p-3">
          {quests.map((quest) => (
            <CompactQuestRow
              key={quest.quest.id}
              quest={quest}
              isClaiming={false}
              onClaim={() => {}}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const meta: Meta<Args> = {
  title: 'Preferred Sources/Review/3. Quest: a one-time milestone',
  args: { variant: 'proposed' },
  argTypes: {
    variant: { control: 'radio', options: ['current', 'proposed'] },
  },
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <ReviewProviders loggedIn>
      <div className="min-h-screen bg-background-default p-6 text-text-primary">
        <Page {...args} />
      </div>
    </ReviewProviders>
  ),
};

export default meta;

export const Current: StoryObj<Args> = { args: { variant: 'current' } };
export const Proposed: StoryObj<Args> = { args: { variant: 'proposed' } };
