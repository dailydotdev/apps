import React from 'react';
import { render, screen } from '@testing-library/react';
import ReactModal from 'react-modal';
import { IntroQuestModal } from './IntroQuestModal';
import { ActionType } from '../../graphql/actions';
import { useActions, useViewSize } from '../../hooks';
import { useQuestDashboard } from '../../hooks/useQuestDashboard';
import {
  QuestRewardType,
  QuestStatus,
  QuestType,
  type UserQuest,
} from '../../graphql/quests';

ReactModal.setAppElement('body');

jest.mock('../../hooks/useQuestDashboard', () => ({
  useQuestDashboard: jest.fn(),
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
      screen.getByRole('link', {
        name: 'Go to Notifications',
        hidden: true,
      }),
    ).toHaveAttribute('href', '/settings/notifications');
  });

  it('does not render destination link for completed quests', () => {
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
      screen.queryByRole('link', {
        name: 'Go to Notifications',
        hidden: true,
      }),
    ).not.toBeInTheDocument();
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
