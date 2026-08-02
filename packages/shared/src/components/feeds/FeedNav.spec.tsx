import React from 'react';
import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/router';
import { useActiveFeedNameContext } from '../../contexts';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { useFeeds, useViewSize, ViewSize } from '../../hooks';
import useActiveNav from '../../hooks/useActiveNav';
import usePersistentContext from '../../hooks/usePersistentContext';
import { useFeedName } from '../../hooks/feed/useFeedName';
import useCustomDefaultFeed from '../../hooks/feed/useCustomDefaultFeed';
import { useSortedFeeds } from '../../hooks/feed/useSortedFeeds';
import { useScrollTopClassName } from '../../hooks/useScrollTopClassName';
import { useFeatureTheme } from '../../hooks/utils/useFeatureTheme';
import usePlusEntry from '../../hooks/usePlusEntry';
import { FeedChipsVariant } from '../../lib/featureManagement';
import { SharedFeedPage } from '../utilities';
import FeedNav from './FeedNav';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../contexts', () => ({
  useActiveFeedNameContext: jest.fn(),
}));

jest.mock('../../contexts/SettingsContext', () => ({
  useSettingsContext: jest.fn(),
}));

jest.mock('../../hooks/useConditionalFeature', () => ({
  useConditionalFeature: jest.fn(),
}));

jest.mock('../../hooks', () => ({
  useFeeds: jest.fn(),
  useViewSize: jest.fn(),
  ViewSize: {
    MobileL: 'mobileL',
    Laptop: 'laptop',
  },
}));

jest.mock('../../hooks/useActiveNav', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../../hooks/usePersistentContext', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../../hooks/feed/useFeedName', () => ({
  useFeedName: jest.fn(),
}));

jest.mock('../../hooks/feed/useCustomDefaultFeed', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../../hooks/feed/useSortedFeeds', () => ({
  useSortedFeeds: jest.fn(),
}));

jest.mock('../../hooks/useScrollTopClassName', () => ({
  useScrollTopClassName: jest.fn(),
}));

jest.mock('../../hooks/utils/useFeatureTheme', () => ({
  useFeatureTheme: jest.fn(),
}));

jest.mock('../../hooks/usePlusEntry', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('./UnifiedMobileFeedNav', () => ({
  __esModule: true,
  default: () => (
    <div
      data-testid="chips-scroll-container"
      className="no-scrollbar flex min-w-0 flex-1 overflow-x-auto"
    >
      <a href="/game-center">Game Center</a>
    </div>
  ),
}));

jest.mock('./MobileFeedActions', () => ({
  MobileFeedActions: () => <div data-testid="mobile-feed-actions" />,
}));

jest.mock('../fields/Dropdown', () => ({
  Dropdown: () => (
    <button type="button" aria-label="Sort feed">
      Sort
    </button>
  ),
}));

jest.mock('../filters/MyFeedHeading', () => ({
  __esModule: true,
  default: ({ iconOnly }: { iconOnly?: boolean }) => (
    <button
      type="button"
      aria-label="Feed settings"
      data-icon-only={iconOnly ? 'true' : 'false'}
    >
      Feed settings
    </button>
  ),
}));

jest.mock('../notifications/NotificationsBell', () => ({
  __esModule: true,
  default: () => <div data-testid="notifications-bell" />,
}));

jest.mock('../../features/giveback/components/GivebackGiftEntry', () => ({
  GivebackGiftEntry: () => <div data-testid="giveback-entry" />,
}));

jest.mock('../marketing/banners/PlusMobileEntryBanner', () => ({
  __esModule: true,
  default: () => <div data-testid="plus-mobile-entry-banner" />,
}));

jest.mock('../../lib/constants', () => ({
  webappUrl: '/',
}));

const mockUseRouter = useRouter as jest.Mock;
const mockUseActiveFeedNameContext = useActiveFeedNameContext as jest.Mock;
const mockUseSettingsContext = useSettingsContext as jest.Mock;
const mockUseConditionalFeature = useConditionalFeature as jest.Mock;
const mockUseFeeds = useFeeds as jest.Mock;
const mockUseViewSize = useViewSize as jest.Mock;
const mockUseActiveNav = useActiveNav as jest.Mock;
const mockUsePersistentContext = usePersistentContext as jest.Mock;
const mockUseFeedName = useFeedName as jest.Mock;
const mockUseCustomDefaultFeed = useCustomDefaultFeed as jest.Mock;
const mockUseSortedFeeds = useSortedFeeds as jest.Mock;
const mockUseScrollTopClassName = useScrollTopClassName as jest.Mock;
const mockUseFeatureTheme = useFeatureTheme as jest.Mock;
const mockUsePlusEntry = usePlusEntry as jest.Mock;

const createFeedEdges = () => [
  {
    node: {
      id: 'feed-1',
      slug: 'frontend',
      flags: { name: 'Frontend' },
    },
  },
];

const mockViewport = ({
  isMobile,
  isBelowLaptop,
}: {
  isMobile: boolean;
  isBelowLaptop: boolean;
}) => {
  mockUseViewSize.mockImplementation((size: ViewSize) => {
    if (size === ViewSize.MobileL) {
      return isMobile;
    }
    if (size === ViewSize.Laptop) {
      return !isBelowLaptop;
    }
    return false;
  });
};

describe('FeedNav', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      asPath: '/',
      pathname: '/',
      query: {},
      push: jest.fn(),
    });
    mockUseActiveFeedNameContext.mockReturnValue({
      feedName: SharedFeedPage.MyFeed,
    });
    mockUseSettingsContext.mockReturnValue({
      sortingEnabled: true,
    });
    mockUseConditionalFeature.mockReturnValue({ value: FeedChipsVariant.V2 });
    mockUseFeeds.mockReturnValue({ feeds: { edges: createFeedEdges() } });
    mockUseSortedFeeds.mockImplementation(
      ({ edges }: { edges?: unknown[] }) => edges ?? [],
    );
    mockUseActiveNav.mockReturnValue({
      home: true,
      bookmarks: false,
    });
    mockUsePersistentContext.mockReturnValue([0, jest.fn()]);
    mockUseFeedName.mockReturnValue({ isSortableFeed: true });
    mockUseCustomDefaultFeed.mockReturnValue({
      isCustomDefaultFeed: false,
      defaultFeedId: 'user-1',
    });
    mockUseScrollTopClassName.mockReturnValue('');
    mockUseFeatureTheme.mockReturnValue(null);
    mockUsePlusEntry.mockReturnValue({ plusEntryForYou: null });
    mockViewport({ isMobile: true, isBelowLaptop: true });
  });

  it('keeps the chips scroll container and action controls as in-flow siblings', () => {
    render(<FeedNav />);

    const chipsScrollContainer = screen.getByTestId('chips-scroll-container');
    const sortButton = screen.getByRole('button', { name: 'Sort feed' });
    const feedSettingsButton = screen.getByRole('button', {
      name: 'Feed settings',
    });
    const actionsCluster = feedSettingsButton.parentElement as HTMLElement;

    expect(screen.getByRole('link', { name: 'Game Center' })).toBeVisible();
    expect(chipsScrollContainer).toHaveClass(
      'min-w-0',
      'flex-1',
      'overflow-x-auto',
    );
    expect(actionsCluster).toContainElement(sortButton);
    expect(chipsScrollContainer).not.toContainElement(feedSettingsButton);
    expect(chipsScrollContainer.parentElement).toBe(
      actionsCluster.parentElement,
    );
    expect(actionsCluster).not.toHaveClass('sticky');
    expect(actionsCluster).not.toHaveClass('-translate-y-16');
    expect(feedSettingsButton).toHaveAttribute('data-icon-only', 'true');
  });

  it('keeps custom-feed actions in flow when sorting is disabled', () => {
    mockUseRouter.mockReturnValue({
      asPath: '/feeds/feed-1',
      pathname: '/feeds/[slugOrId]',
      query: { slugOrId: 'feed-1' },
      push: jest.fn(),
    });
    mockUseActiveFeedNameContext.mockReturnValue({
      feedName: SharedFeedPage.Custom,
    });
    mockUseFeedName.mockReturnValue({ isSortableFeed: false });
    mockUseSettingsContext.mockReturnValue({
      sortingEnabled: false,
    });

    render(<FeedNav />);

    const chipsScrollContainer = screen.getByTestId('chips-scroll-container');
    const feedSettingsButton = screen.getByRole('button', {
      name: 'Feed settings',
    });

    expect(
      screen.queryByRole('button', { name: 'Sort feed' }),
    ).not.toBeInTheDocument();
    expect(chipsScrollContainer.parentElement).toBe(
      feedSettingsButton.parentElement?.parentElement,
    );
  });

  it('renders tablet-only actions once in the chips row', () => {
    mockViewport({ isMobile: false, isBelowLaptop: true });

    render(<FeedNav />);

    const chipsScrollContainer = screen.getByTestId('chips-scroll-container');
    const givebackEntry = screen.getByTestId('giveback-entry');
    const notificationsBell = screen.getByTestId('notifications-bell');

    expect(
      screen.queryByRole('button', { name: 'Feed settings' }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByTestId('giveback-entry')).toHaveLength(1);
    expect(screen.getAllByTestId('notifications-bell')).toHaveLength(1);
    expect(chipsScrollContainer.parentElement).toContainElement(givebackEntry);
    expect(chipsScrollContainer.parentElement).toContainElement(
      notificationsBell,
    );
  });

  it('keeps the legacy TabContainer classes and sticky actions when chips are disabled', () => {
    mockUseConditionalFeature.mockReturnValue({ value: FeedChipsVariant.None });

    render(<FeedNav />);

    const tabList = screen.getByRole('list');
    const legacyHeader = tabList.parentElement;
    const feedSettingsButton = screen.getByRole('button', {
      name: 'Feed settings',
    });
    const stickyActions = feedSettingsButton.parentElement as HTMLElement;

    expect(
      screen.queryByTestId('chips-scroll-container'),
    ).not.toBeInTheDocument();
    expect(legacyHeader).toHaveClass(
      'no-scrollbar',
      'overflow-x-auto',
      'px-2',
      'pr-28',
    );
    expect(screen.getByRole('menuitem', { name: 'Leaderboard' })).toHaveClass(
      'tablet:last-of-type:mr-24',
    );
    expect(stickyActions).toHaveClass(
      'sticky',
      '-translate-y-16',
      'translate-x-[calc(100vw-100%)]',
      'w-32',
    );
  });
});
