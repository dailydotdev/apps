import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/router';
import FeedNav from './FeedNav';

const mockTabContainer = jest.fn(
  ({
    children,
    controlledActive,
  }: {
    children: ReactNode;
    controlledActive?: string;
  }): ReactElement => (
    <div data-active-tab={controlledActive}>
      <div>{children}</div>
    </div>
  ),
);

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../contexts', () => ({
  useActiveFeedNameContext: jest.fn(() => ({ feedName: 'custom' })),
}));

jest.mock('../../contexts/SettingsContext', () => ({
  useSettingsContext: jest.fn(() => ({ sortingEnabled: false })),
}));

jest.mock('../../hooks', () => ({
  useFeeds: jest.fn(() => ({
    feeds: {
      edges: [
        {
          node: {
            id: 'feed-123',
            slug: 'frontend-picks',
            flags: undefined,
          },
        },
      ],
    },
  })),
  useViewSize: jest.fn(() => true),
  ViewSize: { MobileL: 'MobileL' },
}));

jest.mock('../../hooks/feed/useFeedName', () => ({
  useFeedName: jest.fn(() => ({ isSortableFeed: false })),
}));

jest.mock('../../hooks/feed/useSortedFeeds', () => ({
  useSortedFeeds: jest.fn(({ edges }) => edges ?? []),
}));

jest.mock('../../hooks/feed/useCustomDefaultFeed', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    isCustomDefaultFeed: false,
    defaultFeedId: undefined,
  })),
}));

jest.mock('../../hooks/useActiveNav', () => ({
  __esModule: true,
  default: jest.fn(() => ({ home: true, bookmarks: false })),
}));

jest.mock('../../hooks/usePersistentContext', () => ({
  __esModule: true,
  default: jest.fn(() => [0, jest.fn()]),
}));

jest.mock('../../hooks/useScrollTopClassName', () => ({
  useScrollTopClassName: jest.fn(() => ''),
}));

jest.mock('../../hooks/utils/useFeatureTheme', () => ({
  useFeatureTheme: jest.fn(() => null),
}));

jest.mock('../../hooks/usePlusEntry', () => ({
  __esModule: true,
  default: jest.fn(() => ({ plusEntryForYou: null })),
}));

jest.mock('../tabs/TabContainer', () => ({
  TabContainer: (props: {
    children: ReactNode;
    controlledActive?: string;
  }): ReactElement => mockTabContainer(props),
  Tab: ({ label }: { label: string }): ReactElement => <div>{label}</div>,
}));

jest.mock('./MobileFeedActions', () => ({
  MobileFeedActions: (): ReactElement => (
    <div data-testid="mobile-feed-actions" />
  ),
}));

jest.mock('../filters/MyFeedHeading', () => ({
  __esModule: true,
  default: (): ReactElement => <div data-testid="my-feed-heading" />,
}));

jest.mock('../notifications/NotificationsBell', () => ({
  __esModule: true,
  default: (): ReactElement => <div data-testid="notifications-bell" />,
}));

jest.mock('../banners/PlusMobileEntryBanner', () => ({
  __esModule: true,
  default: (): ReactElement => <div data-testid="plus-entry-banner" />,
}));

const mockUseRouter = jest.mocked(useRouter);

describe('FeedNav', () => {
  beforeEach(() => {
    mockTabContainer.mockClear();
    mockUseRouter.mockReturnValue({
      pathname: '/feeds/[slugOrId]',
      asPath: '/feeds/frontend-picks',
      query: { slugOrId: 'frontend-picks' },
    } as unknown as ReturnType<typeof useRouter>);
  });

  it('should use a readable custom feed label when the feed name is missing', () => {
    render(<FeedNav />);

    expect(screen.getByText('Frontend Picks')).toBeInTheDocument();
    expect(screen.queryByText('Feed feed-123')).not.toBeInTheDocument();
    expect(mockTabContainer).toHaveBeenCalledWith(
      expect.objectContaining({ controlledActive: 'Frontend Picks' }),
    );
  });
});
