import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CompactQuestRow } from './CompactQuestList';
import type { UserQuest } from '../../graphql/quests';
import { QuestRewardType, QuestStatus, QuestType } from '../../graphql/quests';
import { plusUrl, webappUrl } from '../../lib/constants';
import { QuestBonusHighlight } from './QuestBonusRewardBadge';

const makeQuest = (
  overrides: Omit<Partial<UserQuest>, 'quest'> & {
    quest?: Partial<UserQuest['quest']>;
  } = {},
): UserQuest => {
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
    rewards: [{ type: QuestRewardType.Xp, amount: 50 }],
    quest: {
      id: 'q-1',
      name: 'Read 3 posts',
      description: 'Read three posts today.',
      type: QuestType.Daily,
      eventType: 'read_post',
      targetCount: 3,
      ...questOverrides,
    },
    ...rest,
  };
};

// Returns the row's stretched link, which is what a click on the row hits.
const renderRowLink = (quest: UserQuest): HTMLElement => {
  render(
    <ul>
      <CompactQuestRow quest={quest} isClaiming={false} onClaim={jest.fn()} />
    </ul>,
  );

  return screen.getByRole('link');
};

describe('CompactQuestRow destination', () => {
  it('sends an in-progress quest to the surface that completes it', () => {
    expect(renderRowLink(makeQuest())).toHaveAttribute('href', webappUrl);
  });

  it('maps a quest to its own surface, not a shared default', () => {
    expect(
      renderRowLink(makeQuest({ quest: { eventType: 'brief_read' } })),
    ).toHaveAttribute('href', `${webappUrl}briefing`);
  });

  it('falls back to Game Center when the event type has no mapped surface', () => {
    expect(
      renderRowLink(makeQuest({ quest: { eventType: 'totally_unmapped' } })),
    ).toHaveAttribute('href', `${webappUrl}game-center`);
  });

  it('keeps a claimable quest on Game Center so the row does not pull you away from claiming', () => {
    expect(
      renderRowLink(
        makeQuest({
          progress: 3,
          status: QuestStatus.Completed,
          claimable: true,
        }),
      ),
    ).toHaveAttribute('href', `${webappUrl}game-center`);
  });

  it('labels the link with where it goes', () => {
    expect(renderRowLink(makeQuest())).toHaveAccessibleName(
      expect.stringContaining('Feed') as unknown as string,
    );
  });
});

describe('CompactQuestRow locked Plus quest', () => {
  const lockedComplete = makeQuest({
    progress: 3,
    status: QuestStatus.Completed,
    locked: true,
  });

  it('offers Plus instead of a silent 3/3 when a non-Plus user completes a Plus quest', () => {
    render(
      <ul>
        <CompactQuestRow
          quest={lockedComplete}
          isClaiming={false}
          onClaim={jest.fn()}
        />
      </ul>,
    );

    expect(
      screen.getByRole('link', { name: /Claim with Plus/ }),
    ).toHaveAttribute('href', plusUrl);
    expect(screen.queryByText('3/3')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Claim' }),
    ).not.toBeInTheDocument();
  });

  it('keeps the quest surface for an in-progress Plus quest, since progress still counts', () => {
    expect(
      renderRowLink(makeQuest({ progress: 1, locked: true })),
    ).toHaveAttribute('href', webappUrl);
    expect(screen.getByLabelText('Plus quest')).toBeInTheDocument();
  });
});

describe('CompactQuestRow swap', () => {
  const renderRow = (quest: UserQuest) =>
    render(
      <ul>
        <CompactQuestRow
          quest={quest}
          isClaiming={false}
          onClaim={jest.fn()}
          onRefresh={jest.fn()}
        />
      </ul>,
    );

  it('offers Swap when the quest has a swap price', () => {
    renderRow(makeQuest({ refreshCost: 10 }));

    expect(screen.getByRole('button', { name: 'Swap' })).toBeInTheDocument();
  });

  it.each([
    ['null', null],
    ['missing', undefined],
  ])('hides Swap when the swap price is %s', (_, refreshCost) => {
    renderRow(makeQuest({ refreshCost }));

    expect(
      screen.queryByRole('button', { name: 'Swap' }),
    ).not.toBeInTheDocument();
  });
});

describe('CompactQuestRow chain step', () => {
  it('shows the step of a quest chain', () => {
    render(
      <ul>
        <CompactQuestRow
          quest={makeQuest({ chainStep: 1, chainLength: 3 })}
          isClaiming={false}
          onClaim={jest.fn()}
        />
      </ul>,
    );

    expect(screen.getByText('Step 1/3')).toBeInTheDocument();
  });
});

describe('CompactQuestRow bonus highlight', () => {
  const onRefresh = jest.fn();
  const bonusQuest = makeQuest({
    refreshCost: 10,
    rewards: [
      { type: QuestRewardType.Xp, amount: 100 },
      { type: QuestRewardType.Cores, amount: 20 },
    ],
    rewardMultipliers: {
      [QuestRewardType.Xp]: 2,
      [QuestRewardType.Reputation]: 1,
      [QuestRewardType.Cores]: 2,
    },
  });
  const renderRow = (highlight: QuestBonusHighlight) =>
    render(
      // The v2 Swap tooltip reads the query client, as in the app.
      <QueryClientProvider client={new QueryClient()}>
        <ul>
          <CompactQuestRow
            quest={bonusQuest}
            isClaiming={false}
            onClaim={jest.fn()}
            onRefresh={onRefresh}
            highlight={highlight}
          />
        </ul>
      </QueryClientProvider>,
    );

  it('keeps the current 2x badge and Swap in control', () => {
    renderRow(QuestBonusHighlight.Control);

    expect(screen.getByText('2x')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Swap' })).toBeInTheDocument();
  });

  it.each([QuestBonusHighlight.V1, QuestBonusHighlight.V3])(
    'shows Swap with its price in %s',
    (highlight) => {
      renderRow(highlight);

      expect(
        screen.getByRole('button', { name: 'Swap quest for 10 Cores' }),
      ).toBeInTheDocument();
    },
  );

  it('shows the base and doubled reward in v2', () => {
    renderRow(QuestBonusHighlight.V2);

    expect(screen.getByText('50')).toHaveClass('line-through');
    expect(
      screen.getByRole('button', { name: 'Swap quest for 10 Cores' }),
    ).toBeInTheDocument();
  });

  it('drops the v3 spotlight once the bonus quest is claimed', () => {
    const { rerender } = renderRow(QuestBonusHighlight.V3);

    expect(screen.getByRole('listitem')).toHaveClass('quest-bonus-spotlight');

    rerender(
      <QueryClientProvider client={new QueryClient()}>
        <ul>
          <CompactQuestRow
            quest={{
              ...bonusQuest,
              status: QuestStatus.Claimed,
              claimedAt: new Date(),
            }}
            isClaiming={false}
            onClaim={jest.fn()}
            onRefresh={onRefresh}
            highlight={QuestBonusHighlight.V3}
          />
        </ul>
      </QueryClientProvider>,
    );

    expect(screen.getByRole('listitem')).not.toHaveClass(
      'quest-bonus-spotlight',
    );
    expect(screen.getByText(/2x bonus/i)).toBeInTheDocument();
  });
});
