import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import SettingsContext from '../../contexts/SettingsContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { useActions } from '../../hooks/useActions';
import { useViewSize, ViewSize } from '../../hooks/useViewSize';
import { useReadingStreak } from '../../hooks/streaks';
import { useFeedName } from '../../hooks/feed/useFeedName';
import { useQueryState } from '../../hooks/utils/useQueryState';
import { checkIsExtension, getCurrentBrowserName } from '../../lib/func';
import { ActionType } from '../../graphql/actions';
import { LogEvent, Origin, TargetId } from '../../lib/log';
import { SharedFeedPage } from '../utilities';
import { SearchControlHeader } from './common';

jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));

jest.mock('../../contexts/LogContext', () => ({
  useLogContext: jest.fn(),
}));

jest.mock('../../hooks/useActions', () => ({
  useActions: jest.fn(),
}));

jest.mock('../../hooks/useViewSize', () => ({
  ViewSize: {
    Laptop: 'laptop',
    MobileL: 'mobile',
  },
  useViewSize: jest.fn(),
}));

jest.mock('../../hooks/streaks', () => ({
  useReadingStreak: jest.fn(),
}));

jest.mock('../../hooks/feed/useFeedName', () => ({
  useFeedName: jest.fn(),
}));

jest.mock('../../hooks/utils/useQueryState', () => ({
  QueryStateKeys: {
    FeedPeriod: 'feed-period',
  },
  useQueryState: jest.fn(),
}));

jest.mock('../../lib/func', () => ({
  ...jest.requireActual('../../lib/func'),
  checkIsExtension: jest.fn(),
  getCurrentBrowserName: jest.fn(),
}));

jest.mock('../filters/MyFeedHeading', () => ({
  __esModule: true,
  default: function MockMyFeedHeading() {
    return null;
  },
}));

jest.mock('../buttons/ToggleClickbaitShield', () => ({
  ToggleClickbaitShield: function MockToggleClickbaitShield() {
    return null;
  },
}));

jest.mock('../filters/AchievementTrackerButton', () => ({
  AchievementTrackerButton: function MockAchievementTrackerButton() {
    return null;
  },
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
const mockUseLogContext = useLogContext as jest.Mock;
const mockUseActions = useActions as jest.Mock;
const mockUseViewSize = useViewSize as jest.Mock;
const mockUseReadingStreak = useReadingStreak as jest.Mock;
const mockUseFeedName = useFeedName as jest.Mock;
const mockUseQueryState = useQueryState as jest.Mock;
const mockCheckIsExtension = checkIsExtension as jest.Mock;
const mockGetCurrentBrowserName = getCurrentBrowserName as jest.Mock;

const createActionsState = ({
  dismissedInstallExtension = false,
  dismissedNoAiToggle = false,
  isActionsFetched = true,
  completeAction = jest.fn(),
}: {
  dismissedInstallExtension?: boolean;
  dismissedNoAiToggle?: boolean;
  isActionsFetched?: boolean;
  completeAction?: jest.Mock;
} = {}) => ({
  checkHasCompleted: jest.fn((type: ActionType) => {
    if (type === ActionType.DismissInstallExtension) {
      return dismissedInstallExtension;
    }

    if (type === ActionType.DismissNoAiFeedToggle) {
      return dismissedNoAiToggle;
    }

    return false;
  }),
  completeAction,
  isActionsFetched,
});

const renderComponent = ({
  noAiState,
}: {
  noAiState?: {
    isAvailable: boolean;
    isEnabled: boolean;
    onToggle: () => Promise<void>;
  };
} = {}) =>
  render(
    <SettingsContext.Provider value={{ sortingEnabled: false } as never}>
      <SearchControlHeader
        feedName={SharedFeedPage.MyFeed}
        algoState={[0, jest.fn()]}
        noAiState={noAiState}
      />
    </SettingsContext.Provider>,
  );

describe('SearchControlHeader', () => {
  beforeEach(() => {
    mockUseAuthContext.mockReturnValue({ user: { flags: {} } });
    mockUseLogContext.mockReturnValue({ logEvent: jest.fn() });
    mockUseViewSize.mockImplementation((size) => size === ViewSize.Laptop);
    mockUseReadingStreak.mockReturnValue({
      streak: null,
      isLoading: false,
      isStreaksEnabled: false,
    });
    mockUseFeedName.mockReturnValue({
      isUpvoted: false,
      isSortableFeed: false,
    });
    mockUseQueryState.mockReturnValue([0, jest.fn()]);
    mockCheckIsExtension.mockReturnValue(false);
    mockGetCurrentBrowserName.mockReturnValue('Chrome');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('does not render the install extension prompt before actions are fetched', () => {
    mockUseActions.mockReturnValue(
      createActionsState({ isActionsFetched: false }),
    );

    renderComponent();

    expect(
      screen.queryByRole('link', { name: 'Get it for Chrome' }),
    ).not.toBeInTheDocument();
  });

  it('does not render the install extension prompt after dismissal', () => {
    mockUseActions.mockReturnValue(
      createActionsState({ dismissedInstallExtension: true }),
    );

    renderComponent();

    expect(
      screen.queryByRole('link', { name: 'Get it for Chrome' }),
    ).not.toBeInTheDocument();
  });

  it('does not render the install extension prompt for extension users', () => {
    mockUseActions.mockReturnValue(createActionsState());
    mockCheckIsExtension.mockReturnValue(true);

    renderComponent();

    expect(
      screen.queryByRole('link', { name: 'Get it for Chrome' }),
    ).not.toBeInTheDocument();
  });

  it('does not render the install extension prompt after extension usage is recorded', () => {
    mockUseActions.mockReturnValue(createActionsState());
    mockUseAuthContext.mockReturnValue({
      user: { flags: { lastExtensionUse: '2025-01-01T00:00:00.000Z' } },
    });

    renderComponent();

    expect(
      screen.queryByRole('link', { name: 'Get it for Chrome' }),
    ).not.toBeInTheDocument();
  });

  it('renders the install extension prompt when actions are fetched and not dismissed', () => {
    mockUseActions.mockReturnValue(createActionsState());

    renderComponent();

    expect(
      screen.getByRole('link', { name: 'Get it for Chrome' }),
    ).toBeInTheDocument();
  });

  it('does not render the No AI switch when unavailable', () => {
    mockUseActions.mockReturnValue(
      createActionsState({ dismissedInstallExtension: true }),
    );

    renderComponent({
      noAiState: {
        isAvailable: false,
        isEnabled: false,
        onToggle: jest.fn().mockResolvedValue(undefined),
      },
    });

    expect(screen.queryByText('No AI mode')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('checkbox', { name: 'Toggle No AI mode' }),
    ).not.toBeInTheDocument();
  });

  it('renders a No AI switch and logs when toggled', async () => {
    const onToggle = jest.fn().mockResolvedValue(undefined);
    const logEvent = jest.fn();
    mockUseLogContext.mockReturnValue({ logEvent });
    mockUseActions.mockReturnValue(
      createActionsState({ dismissedInstallExtension: true }),
    );

    renderComponent({
      noAiState: {
        isAvailable: true,
        isEnabled: false,
        onToggle,
      },
    });

    expect(screen.getByText('No AI mode')).toBeInTheDocument();
    const switchInput = screen.getByRole('checkbox', {
      name: 'Toggle No AI mode',
    });
    fireEvent.click(switchInput);

    expect(onToggle).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(logEvent).toHaveBeenCalledWith({
        event_name: LogEvent.ToggleNoAiFeed,
        target_id: TargetId.On,
        extra: JSON.stringify({
          origin: Origin.Feed,
        }),
      });
    });
  });

  it('does not render the No AI switch after dismissal', () => {
    mockUseActions.mockReturnValue(
      createActionsState({
        dismissedInstallExtension: true,
        dismissedNoAiToggle: true,
      }),
    );

    renderComponent({
      noAiState: {
        isAvailable: true,
        isEnabled: false,
        onToggle: jest.fn().mockResolvedValue(undefined),
      },
    });

    expect(screen.queryByText('No AI mode')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('checkbox', { name: 'Toggle No AI mode' }),
    ).not.toBeInTheDocument();
  });

  it('dismisses the No AI header card', () => {
    const completeAction = jest.fn();
    mockUseActions.mockReturnValue(
      createActionsState({
        dismissedInstallExtension: true,
        completeAction,
      }),
    );

    renderComponent({
      noAiState: {
        isAvailable: true,
        isEnabled: false,
        onToggle: jest.fn().mockResolvedValue(undefined),
      },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss No AI mode' }));

    expect(completeAction).toHaveBeenCalledWith(
      ActionType.DismissNoAiFeedToggle,
    );
  });
});
