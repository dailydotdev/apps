import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAuthContext } from '../../contexts/AuthContext';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { useLazyModal } from '../../hooks/useLazyModal';
import { useViewSize, ViewSize } from '../../hooks';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
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
  useViewSize: jest.fn(),
}));

jest.mock('../../hooks/useConditionalFeature', () => ({
  useConditionalFeature: jest.fn(),
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
const mockUseViewSize = useViewSize as jest.Mock;
const mockUseConditionalFeature = useConditionalFeature as jest.Mock;
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
    mockUseViewSize.mockImplementation((size) => size === ViewSize.Laptop);
    mockUseConditionalFeature.mockReturnValue({ value: true });
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

    expect(screen.getByText('1/4')).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: 'Open introduction quests (1/4)' }),
    );

    expect(openModal).toHaveBeenCalledWith({
      type: LazyModal.IntroQuests,
    });
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
    mockUseConditionalFeature.mockReturnValue({ value: false });

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
});
