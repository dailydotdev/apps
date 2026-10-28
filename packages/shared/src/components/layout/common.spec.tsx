import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import SettingsContext from '../../contexts/SettingsContext';
import { useViewSize, ViewSize } from '../../hooks/useViewSize';
import { useReadingStreak } from '../../hooks/streaks';
import { useFeedName } from '../../hooks/feed/useFeedName';
import { useQueryState } from '../../hooks/utils/useQueryState';
import { useLaptopLayout } from '../../hooks/layout/useLaptopLayout';
import { useLayoutV2Fixes } from '../../hooks/layout/useLayoutV2Fixes';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
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

jest.mock('../../hooks/layout/useLaptopLayout', () => ({
  useLaptopLayout: jest.fn(),
}));

jest.mock('../../hooks/layout/useLayoutV2Fixes', () => ({
  useLayoutV2Fixes: jest.fn(),
}));

jest.mock('../../hooks/useLazyModal', () => ({
  useLazyModal: jest.fn(),
}));

const mockUseViewSize = useViewSize as jest.Mock;
const mockUseReadingStreak = useReadingStreak as jest.Mock;
const mockUseFeedName = useFeedName as jest.Mock;
const mockUseQueryState = useQueryState as jest.Mock;
const mockUseLaptopLayout = useLaptopLayout as jest.Mock;
const mockUseLayoutV2Fixes = useLayoutV2Fixes as jest.Mock;
const mockUseLazyModal = useLazyModal as jest.Mock;
const openModal = jest.fn();

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
    mockUseLayoutV2Fixes.mockReturnValue(false);
    mockUseLazyModal.mockReturnValue({ openModal });
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

  it('has no header New post outside the layout v2 fixes experiment', () => {
    mockUseLaptopLayout.mockReturnValue(true);

    renderComponent({ chips: <div>Chips</div> });

    expect(
      screen.queryByRole('button', { name: 'New post' }),
    ).not.toBeInTheDocument();
  });

  it('opens the composer from the header New post in the layout v2 fixes experiment', () => {
    mockUseLaptopLayout.mockReturnValue(true);
    mockUseLayoutV2Fixes.mockReturnValue(true);

    renderComponent({ chips: <div>Chips</div> });
    fireEvent.click(screen.getByRole('button', { name: 'New post' }));

    expect(openModal).toHaveBeenCalledWith({ type: LazyModal.SmartComposer });
  });

  it('keeps laptop feed actions icon-only when chips are present', () => {
    mockUseLaptopLayout.mockReturnValue(true);

    renderComponent({ chips: <div>Chips</div> });

    expect(screen.getByTestId('my-feed-heading')).toHaveAttribute(
      'data-icon-only',
      'true',
    );
  });
});
