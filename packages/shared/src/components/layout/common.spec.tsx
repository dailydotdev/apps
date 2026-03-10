import React from 'react';
import { render, screen } from '@testing-library/react';
import SettingsContext from '../../contexts/SettingsContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import {
  useActions,
  useConditionalFeature,
  useViewSize,
  ViewSize,
} from '../../hooks';
import { useReadingStreak } from '../../hooks/streaks';
import { useFeedName } from '../../hooks/feed/useFeedName';
import { useQueryState } from '../../hooks/utils/useQueryState';
import { SharedFeedPage } from '../utilities';
import { SearchControlHeader } from './common';

jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));

jest.mock('../../contexts/LogContext', () => ({
  useLogContext: jest.fn(),
}));

jest.mock('../../hooks', () => ({
  ViewSize: {
    Laptop: 'laptop',
    MobileL: 'mobile',
  },
  useActions: jest.fn(),
  useConditionalFeature: jest.fn(),
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

jest.mock('../filters/MyFeedHeading', () => ({
  __esModule: true,
  default: function MockMyFeedHeading() {
    return <div>My Feed</div>;
  },
}));
jest.mock('../buttons/ToggleClickbaitShield', () => ({
  ToggleClickbaitShield: function MockToggleClickbaitShield() {
    return <div>Toggle Clickbait Shield</div>;
  },
}));
jest.mock('../filters/AchievementTrackerButton', () => ({
  AchievementTrackerButton: function MockAchievementTrackerButton() {
    return <div>Achievement Tracker</div>;
  },
}));
jest.mock('../filters/AgentsLeaderboardEntrypointButton', () => ({
  AgentsLeaderboardEntrypointButton:
    function MockAgentsLeaderboardEntrypointButton() {
      return <div>Agents Leaderboard</div>;
    },
}));
jest.mock('../streak/ReadingStreakButton', () => ({
  ReadingStreakButton: function MockReadingStreakButton() {
    return <div>Reading Streak</div>;
  },
}));

const mockUseAuthContext = useAuthContext as jest.Mock;
const mockUseLogContext = useLogContext as jest.Mock;
const mockUseActions = useActions as jest.Mock;
const mockUseConditionalFeature = useConditionalFeature as jest.Mock;
const mockUseViewSize = useViewSize as jest.Mock;
const mockUseReadingStreak = useReadingStreak as jest.Mock;
const mockUseFeedName = useFeedName as jest.Mock;
const mockUseQueryState = useQueryState as jest.Mock;

const renderComponent = () =>
  render(
    <SettingsContext.Provider value={{ sortingEnabled: false } as never}>
      <SearchControlHeader
        feedName={SharedFeedPage.MyFeed}
        algoState={[0, jest.fn()]}
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
    mockUseConditionalFeature
      .mockReturnValueOnce({ value: true })
      .mockReturnValueOnce({ value: null });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('does not render the install extension prompt before actions are fetched', () => {
    mockUseActions.mockReturnValue({
      checkHasCompleted: jest.fn().mockReturnValue(false),
      completeAction: jest.fn(),
      isActionsFetched: false,
    });

    renderComponent();

    expect(
      screen.queryByRole('link', { name: 'Get it for Chrome' }),
    ).not.toBeInTheDocument();
  });

  it('does not render the install extension prompt after dismissal', () => {
    mockUseActions.mockReturnValue({
      checkHasCompleted: jest.fn().mockReturnValue(true),
      completeAction: jest.fn(),
      isActionsFetched: true,
    });

    renderComponent();

    expect(
      screen.queryByRole('link', { name: 'Get it for Chrome' }),
    ).not.toBeInTheDocument();
  });

  it('renders the install extension prompt when actions are fetched and not dismissed', () => {
    mockUseActions.mockReturnValue({
      checkHasCompleted: jest.fn().mockReturnValue(false),
      completeAction: jest.fn(),
      isActionsFetched: true,
    });

    renderComponent();

    expect(
      screen.getByRole('link', { name: 'Get it for Chrome' }),
    ).toBeInTheDocument();
  });
});
