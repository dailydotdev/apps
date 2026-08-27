import React from 'react';
import { render, screen } from '@testing-library/react';
import { CompactQuestRow } from './CompactQuestList';
import type { UserQuest } from '../../graphql/quests';
import { QuestRewardType, QuestStatus, QuestType } from '../../graphql/quests';
import { webappUrl } from '../../lib/constants';

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
