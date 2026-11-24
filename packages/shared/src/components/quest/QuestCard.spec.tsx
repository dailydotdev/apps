import React from 'react';
import { render, screen } from '@testing-library/react';
import { QuestCard } from './QuestCard';
import type { UserQuest } from '../../graphql/quests';
import { QuestRewardType, QuestStatus, QuestType } from '../../graphql/quests';

const makeQuest = (overrides: Partial<UserQuest> = {}): UserQuest => ({
  userQuestId: 'uq-1',
  rotationId: 'rot-1',
  progress: 1,
  status: QuestStatus.InProgress,
  completedAt: null,
  claimedAt: null,
  locked: false,
  claimable: false,
  rewards: [{ type: QuestRewardType.Xp, amount: 50 }],
  quest: {
    id: 'q-1',
    name: 'Read 3 posts',
    description: 'Read three posts today.',
    type: QuestType.Daily,
    eventType: 'read_post',
    targetCount: 3,
  },
  ...overrides,
});

const renderCard = (quest: UserQuest) =>
  render(
    <QuestCard
      quest={quest}
      onClaim={jest.fn()}
      showLevelSystem
      isClaiming={false}
      isClaimAnimating={false}
      showClaimedStamp={false}
      animateClaimedStamp={false}
      suppressPersistedClaimedStamp={false}
      onRefresh={jest.fn()}
    />,
  );

describe('QuestCard swap', () => {
  it('offers Swap when the quest has a swap price', () => {
    renderCard(makeQuest({ refreshCost: 10 }));

    expect(screen.getByRole('button', { name: 'Swap' })).toBeInTheDocument();
  });

  it.each([
    ['null', null],
    ['missing', undefined],
  ])('hides Swap when the swap price is %s', (_, refreshCost) => {
    renderCard(makeQuest({ refreshCost }));

    expect(
      screen.queryByRole('button', { name: 'Swap' }),
    ).not.toBeInTheDocument();
  });
});

describe('QuestCard chain step', () => {
  it('shows the step of a quest chain', () => {
    renderCard(makeQuest({ chainStep: 2, chainLength: 3 }));

    expect(screen.getByText('Step 2/3')).toBeInTheDocument();
  });

  it('hides the step when the quest is not in a chain', () => {
    renderCard(makeQuest({ chainStep: null, chainLength: null }));

    expect(screen.queryByText(/^Step /)).not.toBeInTheDocument();
  });
});
