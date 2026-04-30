import React from 'react';
import { act, render, screen } from '@testing-library/react';
import ReactModal from 'react-modal';
import { IntroQuestModal } from './IntroQuestModal';
import { QUEST_CLAIMED_STAMP_REVEAL_DELAY_MS } from '../quest/QuestCard';
import { ActionType } from '../../graphql/actions';
import { useActions, useViewSize } from '../../hooks';
import { useQuestDashboard } from '../../hooks/useQuestDashboard';
import { useClaimQuestReward } from '../../hooks/useClaimQuestReward';
import {
  QuestRewardType,
  QuestStatus,
  QuestType,
  type UserQuest,
} from '../../graphql/quests';

ReactModal.setAppElement('body');

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('../../hooks/useQuestDashboard', () => ({
  useQuestDashboard: jest.fn(),
}));

jest.mock('../../hooks/useClaimQuestReward', () => ({
  useClaimQuestReward: jest.fn(),
}));

jest.mock('../tooltip/Tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('../../hooks', () => ({
  ViewSize: {
    MobileL: 'mobileL',
  },
  useActions: jest.fn(),
  useViewSize: jest.fn(),
}));

const mockUseActions = useActions as jest.Mock;
const mockUseViewSize = useViewSize as jest.Mock;
const mockUseQuestDashboard = useQuestDashboard as jest.Mock;
const mockUseClaimQuestReward = useClaimQuestReward as jest.Mock;
const completeAction = jest.fn();

const buildIntroQuest = (overrides: Partial<UserQuest> = {}): UserQuest => ({
  userQuestId: 'uq-1',
  rotationId: 'rot-1',
  progress: 0,
  status: QuestStatus.InProgress,
  completedAt: null,
  claimedAt: null,
  locked: false,
  claimable: false,
  quest: {
    id: 'quest-1',
    name: 'Install the browser extension',
    description: 'Pin daily.dev to your browser.',
    type: QuestType.Intro,
    eventType: 'extension_install',
    targetCount: 1,
  },
  rewards: [
    { type: QuestRewardType.Xp, amount: 10 },
    { type: QuestRewardType.Cores, amount: 5 },
  ],
  ...overrides,
});

describe('IntroQuestModal', () => {
  beforeEach(() => {
    completeAction.mockReset();
    mockUseActions.mockReturnValue({
      completeAction,
    });
    mockUseViewSize.mockReturnValue(false);
    mockUseClaimQuestReward.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      variables: undefined,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders intro quests returned from the dashboard', () => {
    mockUseQuestDashboard.mockReturnValue({
      data: {
        intro: [
          buildIntroQuest({
            rotationId: 'rot-1',
            status: QuestStatus.Completed,
            progress: 1,
          }),
          buildIntroQuest({
            rotationId: 'rot-2',
            quest: {
              id: 'quest-2',
              name: 'Turn on notifications',
              description: 'Enable alerts.',
              type: QuestType.Intro,
              eventType: 'notifications_enable',
              targetCount: 1,
            },
          }),
        ],
      },
      isPending: false,
      isError: false,
    });

    render(<IntroQuestModal isOpen onRequestClose={jest.fn()} />);

    expect(completeAction).toHaveBeenCalledWith(ActionType.ViewedIntroQuests);
    expect(
      screen.getByRole('heading', { name: 'Intro quests', hidden: true }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Install the browser extension'),
    ).toBeInTheDocument();
    expect(screen.getByText('Turn on notifications')).toBeInTheDocument();
    expect(screen.getByText('Step 01')).toBeInTheDocument();
    expect(screen.getByText('Step 02')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('In progress')).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: 'Go to Notifications',
        hidden: true,
      }),
    ).toBeInTheDocument();
  });

  it('does not render destination button for completed quests', () => {
    mockUseQuestDashboard.mockReturnValue({
      data: {
        intro: [
          buildIntroQuest({
            status: QuestStatus.Claimed,
            progress: 1,
            quest: {
              id: 'quest-2',
              name: 'Turn on notifications',
              description: 'Enable alerts.',
              type: QuestType.Intro,
              eventType: 'notifications_enable',
              targetCount: 1,
            },
          }),
        ],
      },
      isPending: false,
      isError: false,
    });

    render(<IntroQuestModal isOpen onRequestClose={jest.fn()} />);

    expect(
      screen.queryByRole('button', {
        name: 'Go to Notifications',
        hidden: true,
      }),
    ).not.toBeInTheDocument();
  });

  it('shows the claim button and claimed stamp for claimable intro quests', async () => {
    jest.useFakeTimers();
    const mutate = jest.fn((_variables, callbacks) => callbacks?.onSuccess?.());
    mockUseClaimQuestReward.mockReturnValue({
      mutate,
      isPending: false,
      variables: undefined,
    });
    mockUseQuestDashboard.mockReturnValue({
      data: {
        intro: [
          buildIntroQuest({
            status: QuestStatus.Completed,
            progress: 1,
            claimable: true,
          }),
        ],
      },
      isPending: false,
      isError: false,
    });

    render(<IntroQuestModal isOpen onRequestClose={jest.fn()} />);

    act(() => {
      screen.getByRole('button', { name: 'Claim', hidden: true }).click();
    });

    expect(mutate).toHaveBeenCalled();
    expect(screen.queryByText('CLAIMED')).not.toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(QUEST_CLAIMED_STAMP_REVEAL_DELAY_MS);
    });

    expect(screen.getByText('CLAIMED')).toBeInTheDocument();

    jest.useRealTimers();
  });

  it('shows a loading message while pending', () => {
    mockUseQuestDashboard.mockReturnValue({
      data: undefined,
      isPending: true,
      isError: false,
    });

    render(<IntroQuestModal isOpen onRequestClose={jest.fn()} />);

    expect(screen.getByText('Loading quests...')).toBeInTheDocument();
  });

  it('shows an empty state when the dashboard has no intro quests', () => {
    mockUseQuestDashboard.mockReturnValue({
      data: { intro: [] },
      isPending: false,
      isError: false,
    });

    render(<IntroQuestModal isOpen onRequestClose={jest.fn()} />);

    expect(
      screen.getByText("You're all caught up — no intro quests to show."),
    ).toBeInTheDocument();
  });
});
