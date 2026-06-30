import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReactModal from 'react-modal';
import { IntroQuestModal } from './IntroQuestModal';
import { QUEST_CLAIMED_STAMP_REVEAL_DELAY_MS } from '../quest/QuestCard';
import { useLogContext } from '../../contexts/LogContext';
import { ActionType } from '../../graphql/actions';
import { useActions } from '../../hooks/useActions';
import { useViewSize } from '../../hooks/useViewSize';
import { useQuestDashboard } from '../../hooks/useQuestDashboard';
import { useClaimQuestReward } from '../../hooks/useClaimQuestReward';
import { usePrompt } from '../../hooks/usePrompt';
import {
  QuestRewardType,
  QuestStatus,
  QuestType,
  type UserQuest,
} from '../../graphql/quests';
import { downloadBrowserExtension } from '../../lib/constants';
import { BrowserName, getCurrentBrowserName } from '../../lib/func';
import { LogEvent, TargetType } from '../../lib/log';

ReactModal.setAppElement('body');

const mockPush = jest.fn();

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('../../hooks/useQuestDashboard', () => ({
  useQuestDashboard: jest.fn(),
}));

jest.mock('../../hooks/useClaimQuestReward', () => ({
  useClaimQuestReward: jest.fn(),
}));

jest.mock('../../hooks/usePrompt', () => ({
  usePrompt: jest.fn(),
}));

jest.mock('../../contexts/LogContext', () => ({
  useLogContext: jest.fn(),
}));

jest.mock('../../lib/func', () => ({
  ...jest.requireActual('../../lib/func'),
  getCurrentBrowserName: jest.fn(),
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
const mockUsePrompt = usePrompt as jest.Mock;
const mockUseLogContext = useLogContext as jest.Mock;
const mockGetCurrentBrowserName = getCurrentBrowserName as jest.Mock;
const completeAction = jest.fn();
const logEvent = jest.fn();
const showPrompt = jest.fn();

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
    logEvent.mockReset();
    mockPush.mockReset();
    showPrompt.mockReset();
    mockUseActions.mockReturnValue({
      completeAction,
    });
    mockUsePrompt.mockReturnValue({
      showPrompt,
    });
    mockUseLogContext.mockReturnValue({
      logEvent,
    });
    mockGetCurrentBrowserName.mockReturnValue(BrowserName.Chrome);
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

    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.Impression,
      target_type: TargetType.IntroQuestModal,
    });
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
    expect(
      screen.getByRole('button', {
        name: 'Go to Chrome Web Store',
        hidden: true,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: "Don't show me this again",
        hidden: true,
      }),
    ).toBeInTheDocument();
  });

  it('confirms before hiding intro quests from the modal', async () => {
    const onRequestClose = jest.fn();
    showPrompt.mockResolvedValue(true);
    mockUseQuestDashboard.mockReturnValue({
      data: {
        intro: [buildIntroQuest()],
      },
      isPending: false,
      isError: false,
    });

    render(<IntroQuestModal isOpen onRequestClose={onRequestClose} />);

    await userEvent.click(
      screen.getByRole('button', {
        name: "Don't show me this again",
        hidden: true,
      }),
    );

    expect(showPrompt).toHaveBeenCalledWith({
      title: 'Hide intro quests?',
      description:
        'Are you sure you want to permanently hide the intro quests button?',
      okButton: {
        title: 'Yes, hide it',
      },
    });
    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.Click,
      target_type: TargetType.IntroQuestModal,
      target_id: 'hide',
    });
    expect(completeAction).toHaveBeenCalledWith(
      ActionType.IntroQuestsCompleted,
    );
    await waitFor(() => expect(onRequestClose).toHaveBeenCalled());
  });

  it('keeps the modal open when hiding intro quests is cancelled', async () => {
    const onRequestClose = jest.fn();
    showPrompt.mockResolvedValue(false);
    mockUseQuestDashboard.mockReturnValue({
      data: {
        intro: [buildIntroQuest()],
      },
      isPending: false,
      isError: false,
    });

    render(<IntroQuestModal isOpen onRequestClose={onRequestClose} />);

    await userEvent.click(
      screen.getByRole('button', {
        name: "Don't show me this again",
        hidden: true,
      }),
    );

    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.Click,
      target_type: TargetType.IntroQuestModal,
      target_id: 'hide',
    });
    expect(completeAction).toHaveBeenCalledTimes(1);
    expect(completeAction).toHaveBeenCalledWith(ActionType.ViewedIntroQuests);
    expect(onRequestClose).not.toHaveBeenCalled();
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

  it('opens the extension intro quest in the matching browser store', () => {
    const onRequestClose = jest.fn();
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);

    mockGetCurrentBrowserName.mockReturnValue(BrowserName.Edge);
    mockUseQuestDashboard.mockReturnValue({
      data: {
        intro: [
          buildIntroQuest({
            status: QuestStatus.Completed,
            progress: 1,
          }),
        ],
      },
      isPending: false,
      isError: false,
    });

    render(<IntroQuestModal isOpen onRequestClose={onRequestClose} />);

    screen
      .getByRole('button', {
        name: 'Go to Edge Add-ons',
        hidden: true,
      })
      .click();

    expect(openSpy).toHaveBeenCalledWith(
      downloadBrowserExtension,
      '_blank',
      'noopener,noreferrer',
    );
    expect(onRequestClose).toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();

    openSpy.mockRestore();
  });

  it('does not render the extension destination button for unsupported browsers', () => {
    mockGetCurrentBrowserName.mockReturnValue(BrowserName.Safari);
    mockUseQuestDashboard.mockReturnValue({
      data: {
        intro: [
          buildIntroQuest({
            status: QuestStatus.Completed,
            progress: 1,
          }),
        ],
      },
      isPending: false,
      isError: false,
    });

    render(<IntroQuestModal isOpen onRequestClose={jest.fn()} />);

    expect(
      screen.queryByRole('button', {
        name: /Go to /,
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
