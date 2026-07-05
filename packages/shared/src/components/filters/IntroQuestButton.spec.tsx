import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAuthContext } from '../../contexts/AuthContext';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { useLazyModal } from '../../hooks/useLazyModal';
import { ActionType } from '../../graphql/actions';
import { useActions, useViewSize, ViewSize } from '../../hooks';
import { useQuestDashboard } from '../../hooks/useQuestDashboard';
import { IntroQuestButton } from './IntroQuestButton';
import { LazyModal } from '../modals/common/types';
import {
  QuestRewardType,
  QuestStatus,
  QuestType,
  type UserQuest,
} from '../../graphql/quests';

jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));

jest.mock('../../contexts/SettingsContext', () => ({
  useSettingsContext: jest.fn(),
}));

jest.mock('../../hooks/useLazyModal', () => ({
  useLazyModal: jest.fn(),
}));

jest.mock('../../hooks', () => ({
  ViewSize: {
    Laptop: 'laptop',
  },
  useActions: jest.fn(),
  useViewSize: jest.fn(),
}));

jest.mock('../../hooks/useQuestDashboard', () => ({
  useQuestDashboard: jest.fn(),
}));

jest.mock('../tooltip/Tooltip', () => ({
  Tooltip: function MockTooltip({
    children,
  }: {
    children: React.ReactElement;
  }) {
    return children;
  },
}));

const mockUseAuthContext = useAuthContext as jest.Mock;
const mockUseSettingsContext = useSettingsContext as jest.Mock;
const mockUseLazyModal = useLazyModal as jest.Mock;
const mockUseActions = useActions as jest.Mock;
const mockUseViewSize = useViewSize as jest.Mock;
const mockUseQuestDashboard = useQuestDashboard as jest.Mock;
const openModal = jest.fn();

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
    description: 'Pin daily.dev.',
    type: QuestType.Intro,
    eventType: 'extension_install',
    targetCount: 1,
  },
  rewards: [{ type: QuestRewardType.Xp, amount: 10 }],
  ...overrides,
});

describe('IntroQuestButton', () => {
  beforeEach(() => {
    openModal.mockReset();
    mockUseAuthContext.mockReturnValue({
      isAuthReady: true,
      isLoggedIn: true,
    });
    mockUseSettingsContext.mockReturnValue({
      loadedSettings: true,
    });
    mockUseLazyModal.mockReturnValue({
      openModal,
    });
    mockUseActions.mockReturnValue({
      checkHasCompleted: jest.fn(() => false),
    });
    mockUseViewSize.mockImplementation((size) => size === ViewSize.Laptop);
    mockUseQuestDashboard.mockReturnValue({
      data: {
        intro: [
          buildIntroQuest({
            rotationId: 'rot-1',
            status: QuestStatus.Completed,
            progress: 1,
          }),
          buildIntroQuest({ rotationId: 'rot-2' }),
          buildIntroQuest({ rotationId: 'rot-3' }),
          buildIntroQuest({ rotationId: 'rot-4' }),
        ],
      },
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('opens the intro quests modal with completed/total label', async () => {
    render(<IntroQuestButton />);

    expect(screen.getByText('1/4')).toBeInTheDocument();
    expect(
      screen.getByTestId('intro-quest-attention-badge'),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Open introduction quests (1/4), attention needed',
      }),
    );

    expect(openModal).toHaveBeenCalledWith({
      type: LazyModal.IntroQuests,
    });
  });

  it('shows a CTA on load and retracts it after 2 seconds', () => {
    jest.useFakeTimers();

    render(<IntroQuestButton />);

    const cta = screen.getByTestId('intro-quest-cta');

    expect(cta).toHaveTextContent('Get the most out of daily.dev');
    expect(cta).toHaveAttribute('data-expanded', 'true');

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(cta).toHaveAttribute('data-expanded', 'false');
  });

  it('shakes once the intro CTA collapses and then every 5 seconds', () => {
    jest.useFakeTimers();

    render(<IntroQuestButton />);

    const button = screen.getByRole('button', {
      name: /Open introduction quests/,
    });

    expect(button).not.toHaveClass('animate-nudge-shake');

    act(() => {
      jest.advanceTimersByTime(2_500);
    });

    expect(button).toHaveClass('animate-nudge-shake');

    act(() => {
      jest.advanceTimersByTime(600);
    });

    expect(button).not.toHaveClass('animate-nudge-shake');

    act(() => {
      jest.advanceTimersByTime(4_400);
    });

    expect(button).toHaveClass('animate-nudge-shake');
  });

  it('stops shaking once the button is clicked', () => {
    jest.useFakeTimers();

    render(<IntroQuestButton />);

    const button = screen.getByRole('button', {
      name: /Open introduction quests/,
    });

    act(() => {
      jest.advanceTimersByTime(2_500);
    });

    expect(button).toHaveClass('animate-nudge-shake');

    act(() => {
      fireEvent.click(button);
    });

    expect(openModal).toHaveBeenCalledWith({ type: LazyModal.IntroQuests });
    expect(button).not.toHaveClass('animate-nudge-shake');

    act(() => {
      jest.advanceTimersByTime(30_000);
    });

    expect(button).not.toHaveClass('animate-nudge-shake');
  });

  it('hides the badge after intro quests have been viewed and none are claimable', () => {
    mockUseActions.mockReturnValue({
      checkHasCompleted: jest.fn(
        (type: ActionType) => type === ActionType.ViewedIntroQuests,
      ),
    });

    render(<IntroQuestButton />);

    expect(
      screen.queryByTestId('intro-quest-attention-badge'),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Open introduction quests (1/4)' }),
    ).toBeInTheDocument();
  });

  it('shows the badge when a viewed intro quest becomes claimable', () => {
    mockUseActions.mockReturnValue({
      checkHasCompleted: jest.fn(
        (type: ActionType) => type === ActionType.ViewedIntroQuests,
      ),
    });
    mockUseQuestDashboard.mockReturnValue({
      data: {
        intro: [
          buildIntroQuest({
            rotationId: 'rot-1',
            status: QuestStatus.Completed,
            progress: 1,
            claimable: true,
          }),
          buildIntroQuest({ rotationId: 'rot-2' }),
        ],
      },
    });

    render(<IntroQuestButton />);

    expect(
      screen.getByTestId('intro-quest-attention-badge'),
    ).toBeInTheDocument();
  });

  it('does not render when auth is not ready', () => {
    mockUseAuthContext.mockReturnValue({
      isAuthReady: false,
      isLoggedIn: true,
    });

    render(<IntroQuestButton />);

    expect(
      screen.queryByRole('button', { name: /Open introduction quests/ }),
    ).not.toBeInTheDocument();
  });

  it('does not render when there are no intro quests', () => {
    mockUseQuestDashboard.mockReturnValue({
      data: { intro: [] },
    });

    render(<IntroQuestButton />);

    expect(
      screen.queryByRole('button', { name: /Open introduction quests/ }),
    ).not.toBeInTheDocument();
  });

  it('does not render when all intro quests are claimed', () => {
    mockUseQuestDashboard.mockReturnValue({
      data: {
        intro: [
          buildIntroQuest({
            rotationId: 'rot-1',
            status: QuestStatus.Claimed,
            completedAt: new Date('2026-05-03T10:00:00.000Z'),
            claimedAt: new Date('2026-05-03T10:05:00.000Z'),
          }),
          buildIntroQuest({
            rotationId: 'rot-2',
            status: QuestStatus.Claimed,
            completedAt: new Date('2026-05-03T10:10:00.000Z'),
            claimedAt: new Date('2026-05-03T10:15:00.000Z'),
          }),
        ],
      },
    });

    render(<IntroQuestButton />);

    expect(
      screen.queryByRole('button', { name: /Open introduction quests/ }),
    ).not.toBeInTheDocument();
  });

  it('does not render when intro quests have been permanently hidden', () => {
    mockUseActions.mockReturnValue({
      checkHasCompleted: jest.fn(
        (type: ActionType) => type === ActionType.IntroQuestsCompleted,
      ),
    });

    render(<IntroQuestButton />);

    expect(
      screen.queryByRole('button', { name: /Open introduction quests/ }),
    ).not.toBeInTheDocument();
  });
});
