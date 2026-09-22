import React from 'react';
import { render, screen } from '@testing-library/react';
import SettingsContext from '../../contexts/SettingsContext';
import { useViewSize, ViewSize } from '../../hooks/useViewSize';
import { useReadingStreak } from '../../hooks/streaks';
import { useFeedName } from '../../hooks/feed/useFeedName';
import { useQueryState } from '../../hooks/utils/useQueryState';
import { useLayoutVariant } from '../../hooks/layout/useLayoutVariant';
import { SharedFeedPage } from '../utilities';
import { SearchControlHeader } from './common';

jest.mock('../../hooks/useViewSize', () => ({
  ...jest.requireActual('../../hooks/useViewSize'),
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
  default: function MockMyFeedHeading({ iconOnly }: { iconOnly?: boolean }) {
    return (
      <div
        data-icon-only={iconOnly ? 'true' : 'false'}
        data-testid="my-feed-heading"
      />
    );
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

jest.mock('../filters/IntroQuestButton', () => ({
  IntroQuestButton: function MockIntroQuestButton() {
    return <div data-testid="intro-quest-button" />;
  },
}));

jest.mock('../filters/LuckyButton', () => ({
  LuckyButton: function MockLuckyButton() {
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

jest.mock('../../hooks/layout/useLayoutVariant', () => ({
  useLayoutVariant: jest.fn(),
}));

const mockUseViewSize = useViewSize as jest.Mock;
const mockUseReadingStreak = useReadingStreak as jest.Mock;
const mockUseFeedName = useFeedName as jest.Mock;
const mockUseQueryState = useQueryState as jest.Mock;
const mockUseLayoutVariant = useLayoutVariant as jest.Mock;

const renderComponent = ({
  chips,
}: {
  chips?: React.ReactNode;
} = {}) =>
  render(
    <SettingsContext.Provider value={{ sortingEnabled: false } as never}>
      <SearchControlHeader
        feedName={SharedFeedPage.MyFeed}
        algoState={[0, jest.fn()]}
        chips={chips}
      />
    </SettingsContext.Provider>,
  );

const mockViewSize = ({
  isMobile = false,
  isTablet = true,
  isLaptop = true,
}: {
  isMobile?: boolean;
  isTablet?: boolean;
  isLaptop?: boolean;
} = {}) => {
  mockUseViewSize.mockImplementation((size) => {
    if (size === ViewSize.MobileL) {
      return isMobile;
    }

    if (size === ViewSize.Tablet) {
      return isTablet;
    }

    if (size === ViewSize.Laptop) {
      return isLaptop;
    }

    return false;
  });
};

describe('SearchControlHeader', () => {
  beforeEach(() => {
    mockViewSize();
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
    mockUseLayoutVariant.mockReturnValue({ isV2: false, isLoading: false });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the intro quest button in both layout variants', () => {
    renderComponent();

    expect(screen.getByTestId('intro-quest-button')).toBeInTheDocument();

    mockUseLayoutVariant.mockReturnValue({ isV2: true, isLoading: false });
    renderComponent();

    expect(screen.getAllByTestId('intro-quest-button')).toHaveLength(2);
  });

  it('renders v2 feed actions icon-only below tablet without chips', () => {
    mockUseLayoutVariant.mockReturnValue({ isV2: true, isLoading: false });
    mockViewSize({ isTablet: false, isLaptop: false });

    renderComponent();

    expect(screen.getByTestId('my-feed-heading')).toHaveAttribute(
      'data-icon-only',
      'true',
    );
  });

  it('renders v2 feed actions with labels at tablet size without chips', () => {
    mockUseLayoutVariant.mockReturnValue({ isV2: true, isLoading: false });
    mockViewSize({ isTablet: true, isLaptop: false });

    renderComponent();

    expect(screen.getByTestId('my-feed-heading')).toHaveAttribute(
      'data-icon-only',
      'false',
    );
  });

  it('keeps v2 feed actions icon-only when chips are present', () => {
    mockUseLayoutVariant.mockReturnValue({ isV2: true, isLoading: false });
    mockViewSize({ isTablet: true, isLaptop: false });

    renderComponent({ chips: <div>Chips</div> });

    expect(screen.getByTestId('my-feed-heading')).toHaveAttribute(
      'data-icon-only',
      'true',
    );
  });
});
