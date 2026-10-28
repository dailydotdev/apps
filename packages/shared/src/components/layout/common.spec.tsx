import React from 'react';
import { render, screen } from '@testing-library/react';
import SettingsContext from '../../contexts/SettingsContext';
import { useViewSize, ViewSize } from '../../hooks/useViewSize';
import { useReadingStreak } from '../../hooks/streaks';
import { useFeedName } from '../../hooks/feed/useFeedName';
import { useQueryState } from '../../hooks/utils/useQueryState';
import { useLaptopLayout } from '../../hooks/layout/useLaptopLayout';
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
  default: function MockMyFeedHeading({
    iconOnly,
    quiet,
  }: {
    iconOnly?: boolean;
    quiet?: boolean;
  }) {
    return (
      <div
        data-icon-only={iconOnly ? 'true' : 'false'}
        data-quiet={quiet ? 'true' : 'false'}
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
  AchievementTrackerButton: function MockAchievementTrackerButton({
    quiet,
  }: {
    quiet?: boolean;
  }) {
    return (
      <div
        data-quiet={quiet ? 'true' : 'false'}
        data-testid="achievement-tracker"
      />
    );
  },
}));

jest.mock('../filters/IntroQuestButton', () => ({
  IntroQuestButton: function MockIntroQuestButton({
    attentionDot,
  }: {
    attentionDot?: boolean;
  }) {
    return (
      <div
        data-attention-dot={attentionDot ? 'true' : 'false'}
        data-testid="intro-quest-button"
      />
    );
  },
}));

jest.mock('../filters/LuckyButton', () => ({
  LuckyButton: function MockLuckyButton({ quiet }: { quiet?: boolean }) {
    return (
      <div data-quiet={quiet ? 'true' : 'false'} data-testid="lucky-button" />
    );
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

jest.mock('../../hooks/layout/useLaptopLayout', () => ({
  useLaptopLayout: jest.fn(),
}));

const mockUseViewSize = useViewSize as jest.Mock;
const mockUseReadingStreak = useReadingStreak as jest.Mock;
const mockUseFeedName = useFeedName as jest.Mock;
const mockUseQueryState = useQueryState as jest.Mock;
const mockUseLaptopLayout = useLaptopLayout as jest.Mock;

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
    mockUseLaptopLayout.mockReturnValue(false);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the intro quest button in the tablet layout', () => {
    renderComponent();

    expect(screen.getByTestId('intro-quest-button')).toBeInTheDocument();
  });

  it('renders the intro quest button in the laptop layout', () => {
    mockUseLaptopLayout.mockReturnValue(true);

    renderComponent();

    expect(screen.getByTestId('intro-quest-button')).toBeInTheDocument();
  });

  it('renders laptop feed actions with labels without chips', () => {
    mockUseLaptopLayout.mockReturnValue(true);

    renderComponent();

    expect(screen.getByTestId('my-feed-heading')).toHaveAttribute(
      'data-icon-only',
      'false',
    );
  });

  it('keeps laptop feed actions icon-only when chips are present', () => {
    mockUseLaptopLayout.mockReturnValue(true);

    renderComponent({ chips: <div>Chips</div> });

    expect(screen.getByTestId('my-feed-heading')).toHaveAttribute(
      'data-icon-only',
      'true',
    );
  });

  it.each([
    ['tablet', false],
    ['laptop', true],
  ])(
    'keeps the controls in their own style without the widget rail on %s',
    (_, isLaptopLayout) => {
      mockUseLaptopLayout.mockReturnValue(isLaptopLayout);

      renderComponent();

      [
        screen.getByTestId('my-feed-heading'),
        screen.getByTestId('achievement-tracker'),
        ...screen.queryAllByTestId('lucky-button'),
      ].forEach((control) =>
        expect(control).toHaveAttribute('data-quiet', 'false'),
      );
      expect(screen.getByTestId('intro-quest-button')).toHaveAttribute(
        'data-attention-dot',
        'false',
      );
    },
  );
});
