import React from 'react';
import type { ReactElement, ReactNode } from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAuthContext } from '../../contexts/AuthContext';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { useLazyModal } from '../../hooks/useLazyModal';
import { ActionType } from '../../graphql/actions';
import { useActions, useViewSize, ViewSize } from '../../hooks';
import { useNewD1ExperienceFeature } from '../../hooks/useNewD1ExperienceFeature';
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

jest.mock('../../hooks/useNewD1ExperienceFeature', () => ({
  useNewD1ExperienceFeature: jest.fn(),
}));

jest.mock('../../hooks/useQuestDashboard', () => ({
  useQuestDashboard: jest.fn(),
}));

jest.mock('../tooltip/Tooltip', () => ({
  Tooltip: function MockTooltip({ children }: { children: ReactElement }) {
    return children;
  },
}));

const mockPopoverOpen = { current: false };
const mockReactModule = () => React;

jest.mock('@radix-ui/react-popover', () => ({
  Popover: ({ children, open }: { children: ReactNode; open?: boolean }) => {
    mockPopoverOpen.current = !!open;
    return mockReactModule().createElement(
      'div',
      { 'data-popover-open': open ? 'true' : 'false' },
      children,
    );
  },
  PopoverAnchor: ({ children }: { children: ReactNode }) =>
    mockReactModule().createElement(mockReactModule().Fragment, null, children),
  PopoverArrow: () => null,
}));

jest.mock('../popover/Popover', () => ({
  PopoverContent: ({ children }: { children: ReactNode }) => {
    if (!mockPopoverOpen.current) {
      return null;
    }
    return mockReactModule().createElement(
      'div',
      { 'data-testid': 'intro-quest-coachmark-bubble' },
      children,
    );
  },
}));

jest.mock('../tooltips/Portal', () => ({
  RootPortal: ({ children }: { children: ReactNode }) =>
    mockReactModule().createElement(mockReactModule().Fragment, null, children),
}));

const mockUseAuthContext = useAuthContext as jest.Mock;
const mockUseSettingsContext = useSettingsContext as jest.Mock;
const mockUseLazyModal = useLazyModal as jest.Mock;
const mockUseActions = useActions as jest.Mock;
const mockUseViewSize = useViewSize as jest.Mock;
const mockUseNewD1ExperienceFeature = useNewD1ExperienceFeature as jest.Mock;
const mockUseQuestDashboard = useQuestDashboard as jest.Mock;
const openModal = jest.fn();
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
    description: 'Pin daily.dev.',
    type: QuestType.Intro,
    eventType: 'extension_install',
    targetCount: 1,
  },
  rewards: [{ type: QuestRewardType.Xp, amount: 10 }],
  ...overrides,
});

const mockActions = (
  completed: ActionType[] = [],
  { fetched = true }: { fetched?: boolean } = {},
) => {
  mockUseActions.mockReturnValue({
    checkHasCompleted: jest.fn((type: ActionType) => completed.includes(type)),
    completeAction,
    isActionsFetched: fetched,
  });
};

describe('IntroQuestButton', () => {
  beforeEach(() => {
    openModal.mockReset();
    completeAction.mockReset();
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
    mockActions([]);
    mockUseViewSize.mockImplementation((size) => size === ViewSize.Laptop);
    mockUseNewD1ExperienceFeature.mockReturnValue({ value: true });
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
    jest.clearAllMocks();
  });

  it('opens the intro quests modal with completed/total label', async () => {
    render(<IntroQuestButton />);

    const button = screen.getByRole('button', {
      name: 'Open introduction quests (1/4), attention needed',
    });
    expect(button).toHaveTextContent('1/4');
    expect(
      within(button).getByTestId('intro-quest-attention-badge'),
    ).toBeInTheDocument();

    await userEvent.click(button);

    expect(openModal).toHaveBeenCalledWith({
      type: LazyModal.IntroQuests,
    });
  });

  it('shows the coachmark overlay and bubble for first-time users', () => {
    render(<IntroQuestButton />);

    expect(
      screen.getByTestId('intro-quest-coachmark-overlay'),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('intro-quest-coachmark-bubble'),
    ).toHaveTextContent('Check out our introductory quests to get you set up!');
  });

  it('completes intro_acknowledged when the highlighted button is clicked', async () => {
    render(<IntroQuestButton />);

    await userEvent.click(
      screen.getByRole('button', { name: /Open introduction quests/ }),
    );

    expect(completeAction).toHaveBeenCalledWith(ActionType.IntroAcknowledged);
    expect(openModal).toHaveBeenCalledWith({ type: LazyModal.IntroQuests });
  });

  it('hides the coachmark once intro has been acknowledged', () => {
    mockActions([ActionType.IntroAcknowledged]);

    render(<IntroQuestButton />);

    expect(
      screen.queryByTestId('intro-quest-coachmark-overlay'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('intro-quest-coachmark-bubble'),
    ).not.toBeInTheDocument();
  });

  it('does not show the coachmark while actions are still loading', () => {
    mockActions([], { fetched: false });

    render(<IntroQuestButton />);

    expect(
      screen.queryByTestId('intro-quest-coachmark-overlay'),
    ).not.toBeInTheDocument();
  });

  it('auto-backfills intro_acknowledged for users who already viewed intro quests', async () => {
    mockActions([ActionType.ViewedIntroQuests]);

    render(<IntroQuestButton />);

    expect(
      screen.queryByTestId('intro-quest-coachmark-overlay'),
    ).not.toBeInTheDocument();
    await waitFor(() =>
      expect(completeAction).toHaveBeenCalledWith(ActionType.IntroAcknowledged),
    );
  });

  it('hides the badge after intro quests have been viewed and none are claimable', () => {
    mockActions([ActionType.ViewedIntroQuests, ActionType.IntroAcknowledged]);

    render(<IntroQuestButton />);

    expect(
      screen.queryByTestId('intro-quest-attention-badge'),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Open introduction quests (1/4)' }),
    ).toBeInTheDocument();
  });

  it('shows the badge when a viewed intro quest becomes claimable', () => {
    mockActions([ActionType.ViewedIntroQuests, ActionType.IntroAcknowledged]);
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

  it('does not render when new D1 experience flag is off', () => {
    mockUseNewD1ExperienceFeature.mockReturnValue({ value: false });

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
    mockActions([ActionType.IntroQuestsCompleted]);

    render(<IntroQuestButton />);

    expect(
      screen.queryByRole('button', { name: /Open introduction quests/ }),
    ).not.toBeInTheDocument();
  });
});
