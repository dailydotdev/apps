import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { QuestRewardType, QuestStatus, QuestType } from '../../graphql/quests';
import { QuestButton } from './QuestButton';
import { useClaimQuestReward } from '../../hooks/useClaimQuestReward';
import { useQuestDashboard } from '../../hooks/useQuestDashboard';

jest.mock('../../hooks/useQuestDashboard', () => ({
  useQuestDashboard: jest.fn(),
}));

jest.mock('../../hooks/useClaimQuestReward', () => ({
  useClaimQuestReward: jest.fn(),
}));

jest.mock('../icons', () => {
  const actual = jest.requireActual('../icons');

  return {
    ...actual,
    TourIcon: (props: Record<string, unknown>): ReactNode => (
      <svg data-testid="tour-icon" {...props} />
    ),
  };
});

jest.mock('../../hooks/useSubscription', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../dropdown/DropdownMenu', () => ({
  DropdownMenu: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuTrigger: ({ children }: { children: ReactNode }) => (
    <>{children}</>
  ),
  DropdownMenuContent: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
}));

const mockUseQuestDashboard = useQuestDashboard as jest.Mock;
const mockUseClaimQuestReward = useClaimQuestReward as jest.Mock;

const questDashboard = {
  level: {
    level: 7,
    totalXp: 650,
    xpInLevel: 250,
    xpToNextLevel: 150,
  },
  daily: {
    regular: [
      {
        rotationId: 'daily-quest-1',
        userQuestId: null,
        progress: 1,
        status: QuestStatus.InProgress,
        locked: false,
        claimable: false,
        quest: {
          id: 'quest-1',
          name: 'Read posts',
          description: 'Read 3 posts today',
          type: QuestType.Daily,
          eventType: 'read_post',
          targetCount: 3,
        },
        rewards: [
          { type: QuestRewardType.Xp, amount: 150 },
          { type: QuestRewardType.Reputation, amount: 20 },
        ],
      },
    ],
    plus: [],
  },
  weekly: {
    regular: [],
    plus: [],
  },
};

const renderComponent = (optOutLevelSystem = false) =>
  render(
    <TestBootProvider
      client={new QueryClient()}
      settings={{ optOutLevelSystem }}
    >
      <QuestButton />
    </TestBootProvider>,
  );

beforeEach(() => {
  mockUseQuestDashboard.mockReturnValue({
    data: questDashboard,
    isPending: false,
    isError: false,
  });
  mockUseClaimQuestReward.mockReturnValue({
    mutate: jest.fn(),
    isPending: false,
    variables: undefined,
  });
});

describe('QuestButton', () => {
  it('should show level progress and xp rewards when levels are enabled', async () => {
    renderComponent(false);

    expect(
      screen.getByRole('button', { name: /Quests, level 7, 63% progress/i }),
    ).toBeInTheDocument();

    expect(await screen.findByText('Level 7')).toBeInTheDocument();
    expect(screen.getByText('250/400 XP')).toBeInTheDocument();
    expect(screen.getByText('+150 XP')).toBeInTheDocument();
    expect(screen.getByText('+20 Reputation')).toBeInTheDocument();
  });

  it('should hide level progress and xp rewards when levels are disabled', async () => {
    renderComponent(true);

    expect(screen.getByRole('button', { name: 'Quests' })).toBeInTheDocument();
    expect(screen.getByTestId('tour-icon')).toBeInTheDocument();

    expect(screen.queryByText('Level 7')).not.toBeInTheDocument();
    expect(screen.queryByText('250/400 XP')).not.toBeInTheDocument();
    expect(screen.queryByText('+150 XP')).not.toBeInTheDocument();
    expect(await screen.findByText('+20 Reputation')).toBeInTheDocument();
  });

  it('should keep accent progress fill on locked quests', async () => {
    mockUseQuestDashboard.mockReturnValue({
      data: {
        ...questDashboard,
        daily: {
          ...questDashboard.daily,
          plus: [
            {
              rotationId: 'daily-quest-plus-locked',
              userQuestId: null,
              progress: 2,
              status: QuestStatus.InProgress,
              locked: true,
              claimable: false,
              quest: {
                id: 'quest-plus-locked',
                name: 'Locked plus quest',
                description: 'Vote on 8 hot takes',
                type: QuestType.Daily,
                eventType: 'hot_take_vote',
                targetCount: 8,
              },
              rewards: [{ type: QuestRewardType.Xp, amount: 15 }],
            },
          ],
        },
      },
      isPending: false,
      isError: false,
    });

    renderComponent(false);

    const lockedQuestTitle = await screen.findByText('Locked plus quest');
    /* eslint-disable testing-library/no-node-access */
    const questCard = lockedQuestTitle.closest('article');
    const headerBlock = questCard?.querySelector('header')
      ?.parentElement as HTMLElement | null;
    const progressBar = questCard?.querySelector('meter');
    const progressWrapper = progressBar?.parentElement
      ?.parentElement as HTMLElement | null;
    /* eslint-enable testing-library/no-node-access */

    expect(questCard).toBeInTheDocument();
    expect(headerBlock).toHaveClass('opacity-50');
    expect(headerBlock).toHaveClass('grayscale');
    expect(progressWrapper).toHaveClass('opacity-50');
    expect(progressWrapper).not.toHaveClass('grayscale');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveClass('bg-accent-cabbage-bolder');
    expect(progressBar).not.toHaveClass('bg-border-subtler');
  });
});
