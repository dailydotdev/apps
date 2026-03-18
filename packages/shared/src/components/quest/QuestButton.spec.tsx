import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import {
  QuestRewardType,
  QuestStatus,
  QuestType,
  QUEST_ROTATION_UPDATE_SUBSCRIPTION,
  QUEST_UPDATE_SUBSCRIPTION,
} from '../../graphql/quests';
import { QuestButton } from './QuestButton';
import { useClaimQuestReward } from '../../hooks/useClaimQuestReward';
import { useQuestDashboard } from '../../hooks/useQuestDashboard';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';
import useSubscription from '../../hooks/useSubscription';
import { LogEvent, TargetId, TargetType } from '../../lib/log';
import { generateQueryKey, RequestKey } from '../../lib/query';

function mockReactModule() {
  return React;
}

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

jest.mock('../../hooks/usePlusSubscription', () => ({
  usePlusSubscription: jest.fn(),
}));

jest.mock('@radix-ui/react-popover', () => {
  const { cloneElement, createContext, isValidElement, useContext } =
    mockReactModule();
  const PopoverContext = createContext<{
    open: boolean;
    setOpen: (value: boolean) => void;
    onOpenChange?: (value: boolean) => void;
  }>({
    open: false,
    setOpen: () => {},
  });

  return {
    Popover: ({
      children,
      open: controlledOpen,
      onOpenChange,
    }: {
      children: ReactNode;
      open?: boolean;
      onOpenChange?: (value: boolean) => void;
    }) => {
      const { useState } = mockReactModule();
      const [internalOpen, setInternalOpen] = useState(false);
      const open = controlledOpen ?? internalOpen;
      const setOpen = (value: boolean) => {
        onOpenChange?.(value);
        if (controlledOpen === undefined) {
          setInternalOpen(value);
        }
      };

      return (
        <PopoverContext.Provider value={{ open, setOpen, onOpenChange }}>
          <div>{children}</div>
        </PopoverContext.Provider>
      );
    },
    PopoverTrigger: ({
      children,
      asChild: _asChild,
      ...props
    }: {
      children: ReactNode;
      asChild?: boolean;
      [key: string]: unknown;
    }) => {
      const { open, setOpen } = useContext(PopoverContext);

      if (!isValidElement(children)) {
        return <>{children}</>;
      }

      const originalOnClick = children.props.onClick as
        | ((...args: unknown[]) => void)
        | undefined;

      return cloneElement(children, {
        ...props,
        onClick: (...args: unknown[]) => {
          originalOnClick?.(...args);
          setOpen(!open);
        },
      });
    },
    PopoverPortal: ({ children }: { children: ReactNode }) => <>{children}</>,
    PopoverContent: ({ children }: { children: ReactNode }) => {
      const { open } = useContext(PopoverContext);

      if (!open) {
        return null;
      }

      return <div>{children}</div>;
    },
  };
});

jest.mock('../tooltip/Tooltip', () => {
  const { cloneElement, isValidElement } = mockReactModule();

  return {
    Tooltip: ({
      children,
      content,
    }: {
      children: ReactNode;
      content?: string;
    }) => {
      if (!isValidElement<{ 'data-tooltip-content'?: string }>(children)) {
        return <>{children}</>;
      }

      return cloneElement(children, {
        'data-tooltip-content':
          typeof content === 'string' ? content : undefined,
      });
    },
  };
});

const mockUseQuestDashboard = useQuestDashboard as jest.Mock;
const mockUseClaimQuestReward = useClaimQuestReward as jest.Mock;
const mockUseSubscription = useSubscription as jest.Mock;
const mockUsePlusSubscription = usePlusSubscription as jest.Mock;
const mockLogSubscriptionEvent = jest.fn();

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

const renderComponent = (
  optOutLevelSystem = false,
  client: QueryClient = new QueryClient(),
  compact = false,
  log = {},
) =>
  render(
    <TestBootProvider
      client={client}
      settings={{ optOutLevelSystem }}
      log={log}
    >
      <QuestButton compact={compact} />
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
  mockUseSubscription.mockReset();
  mockLogSubscriptionEvent.mockReset();
  mockUsePlusSubscription.mockReturnValue({
    isPlus: false,
    logSubscriptionEvent: mockLogSubscriptionEvent,
  });
});

describe('QuestButton', () => {
  it('should show level progress and xp rewards when levels are enabled', async () => {
    renderComponent(false);

    const button = screen.getByRole('button', {
      name: /Quests, level 7, 63% progress/i,
    });

    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('h-10');

    await userEvent.click(button);

    expect(await screen.findByText('Level 7')).toBeInTheDocument();
    expect(screen.getByText('250/400 XP')).toBeInTheDocument();
    expect(screen.getByText('+150 XP')).toBeInTheDocument();
    expect(screen.getByText('+20 Reputation')).toBeInTheDocument();
  });

  it('should render a smaller trigger when compact', () => {
    renderComponent(false, new QueryClient(), true);

    const button = screen.getByRole('button', {
      name: /Quests, level 7, 63% progress/i,
    });

    expect(button).toHaveClass('h-8');
    expect(button).not.toHaveClass('h-10');
  });

  it('should show total xp in the quest trigger tooltip', () => {
    mockUseQuestDashboard.mockReturnValue({
      data: {
        ...questDashboard,
        level: {
          ...questDashboard.level,
          totalXp: 123456,
        },
      },
      isPending: false,
      isError: false,
    });

    renderComponent(false);

    expect(
      screen.getByRole('button', {
        name: /Quests, level 7, 63% progress/i,
      }),
    ).toHaveAttribute('data-tooltip-content', 'Total XP: 123.456');
  });

  it('should hide level progress and xp rewards when levels are disabled', async () => {
    renderComponent(true);

    const button = screen.getByRole('button', { name: 'Quests' });

    expect(button).toBeInTheDocument();
    expect(screen.getByTestId('tour-icon')).toBeInTheDocument();

    await userEvent.click(button);

    expect(screen.queryByText('Level 7')).not.toBeInTheDocument();
    expect(screen.queryByText('250/400 XP')).not.toBeInTheDocument();
    expect(screen.queryByText('+150 XP')).not.toBeInTheDocument();
    expect(await screen.findByText('+20 Reputation')).toBeInTheDocument();
  });

  it('should log when opening the quest dropdown', async () => {
    const logEvent = jest.fn();

    renderComponent(false, new QueryClient(), false, { logEvent });

    await userEvent.click(
      screen.getByRole('button', {
        name: /Quests, level 7, 63% progress/i,
      }),
    );

    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.Impression,
      target_type: TargetType.Quest,
    });
  });

  it('should stay open when the page scrolls', async () => {
    renderComponent(false);

    await userEvent.click(
      screen.getByRole('button', {
        name: /Quests, level 7, 63% progress/i,
      }),
    );

    expect(await screen.findByText('Level 7')).toBeInTheDocument();

    act(() => {
      globalThis.dispatchEvent(new Event('scroll'));
    });

    expect(screen.getByText('Level 7')).toBeInTheDocument();
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
    await userEvent.click(
      screen.getByRole('button', {
        name: /Quests, level 7, 63% progress/i,
      }),
    );

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

  it('should explain plus quests are additional slots', async () => {
    mockUseQuestDashboard.mockReturnValue({
      data: {
        ...questDashboard,
        daily: {
          ...questDashboard.daily,
          plus: [
            {
              rotationId: 'daily-quest-plus',
              userQuestId: null,
              progress: 0,
              status: QuestStatus.InProgress,
              locked: true,
              claimable: false,
              quest: {
                id: 'quest-plus',
                name: 'Plus quest',
                description: 'Read 2 briefs',
                type: QuestType.Daily,
                eventType: 'brief_read',
                targetCount: 2,
              },
              rewards: [{ type: QuestRewardType.Xp, amount: 10 }],
            },
          ],
        },
      },
      isPending: false,
      isError: false,
    });

    renderComponent(false);

    await userEvent.click(
      screen.getByRole('button', {
        name: /Quests, level 7, 63% progress/i,
      }),
    );

    expect(
      await screen.findByText('Plus users have two additional quest slots'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Unlock' })).toBeInTheDocument();
    expect(screen.queryByText('Plus quests')).not.toBeInTheDocument();
  });

  it('should hide the plus explainer and unlock button for subscribed users', async () => {
    mockUsePlusSubscription.mockReturnValue({
      isPlus: true,
      logSubscriptionEvent: mockLogSubscriptionEvent,
    });
    mockUseQuestDashboard.mockReturnValue({
      data: {
        ...questDashboard,
        daily: {
          ...questDashboard.daily,
          plus: [
            {
              rotationId: 'daily-quest-plus',
              userQuestId: null,
              progress: 0,
              status: QuestStatus.InProgress,
              locked: false,
              claimable: false,
              quest: {
                id: 'quest-plus',
                name: 'Plus quest',
                description: 'Read 2 briefs',
                type: QuestType.Daily,
                eventType: 'brief_read',
                targetCount: 2,
              },
              rewards: [{ type: QuestRewardType.Xp, amount: 10 }],
            },
          ],
        },
      },
      isPending: false,
      isError: false,
    });

    renderComponent(false);

    await userEvent.click(
      screen.getByRole('button', {
        name: /Quests, level 7, 63% progress/i,
      }),
    );

    expect(
      screen.queryByText('Plus users have two additional quest slots'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Unlock' }),
    ).not.toBeInTheDocument();
  });

  it('should log the plus unlock click with the quest dropdown target', async () => {
    mockUseQuestDashboard.mockReturnValue({
      data: {
        ...questDashboard,
        daily: {
          ...questDashboard.daily,
          plus: [
            {
              rotationId: 'daily-quest-plus',
              userQuestId: null,
              progress: 0,
              status: QuestStatus.InProgress,
              locked: true,
              claimable: false,
              quest: {
                id: 'quest-plus',
                name: 'Plus quest',
                description: 'Read 2 briefs',
                type: QuestType.Daily,
                eventType: 'brief_read',
                targetCount: 2,
              },
              rewards: [{ type: QuestRewardType.Xp, amount: 10 }],
            },
          ],
        },
      },
      isPending: false,
      isError: false,
    });

    renderComponent(false);

    await userEvent.click(
      screen.getByRole('button', {
        name: /Quests, level 7, 63% progress/i,
      }),
    );

    await userEvent.click(screen.getByRole('link', { name: 'Unlock' }));

    expect(mockLogSubscriptionEvent).toHaveBeenCalledWith({
      event_name: LogEvent.UpgradeSubscription,
      target_id: TargetId.QuestDropdown,
    });
  });

  it('should invalidate the quest dashboard on quest progress and rollover updates', () => {
    const subscriptions: Array<{
      query: string;
      next?: () => unknown;
    }> = [];
    const client = new QueryClient();
    const invalidateQueries = jest
      .spyOn(client, 'invalidateQueries')
      .mockResolvedValue(undefined);

    mockUseSubscription.mockImplementation(
      (
        request: () => { query: string },
        callbacks: { next?: () => unknown },
      ) => {
        subscriptions.push({
          query: request().query,
          next: callbacks.next,
        });
      },
    );

    renderComponent(false, client);

    expect(subscriptions.map((subscription) => subscription.query)).toEqual([
      QUEST_UPDATE_SUBSCRIPTION,
      QUEST_ROTATION_UPDATE_SUBSCRIPTION,
    ]);

    subscriptions.forEach((subscription) => {
      subscription.next?.();
    });

    expect(invalidateQueries).toHaveBeenCalledTimes(2);
    expect(invalidateQueries).toHaveBeenNthCalledWith(1, {
      queryKey: generateQueryKey(RequestKey.QuestDashboard),
      exact: true,
    });
    expect(invalidateQueries).toHaveBeenNthCalledWith(2, {
      queryKey: generateQueryKey(RequestKey.QuestDashboard),
      exact: true,
    });
  });
});
