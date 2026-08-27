import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/router';
import { useAuthContext } from '../../contexts/AuthContext';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { useLogContext } from '../../contexts/LogContext';
import { useFeeds } from '../../hooks';
import useCustomDefaultFeed from '../../hooks/feed/useCustomDefaultFeed';
import { useSortedFeeds } from '../../hooks/feed/useSortedFeeds';
import UnifiedMobileFeedNav from './UnifiedMobileFeedNav';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../utilities/Link', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));

jest.mock('../../contexts/SettingsContext', () => ({
  useSettingsContext: jest.fn(),
}));

jest.mock('../../contexts/LogContext', () => ({
  useLogContext: jest.fn(),
}));

jest.mock('../../hooks', () => ({
  useFeeds: jest.fn(),
}));

jest.mock('../../hooks/feed/useCustomDefaultFeed', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../../hooks/feed/useSortedFeeds', () => ({
  useSortedFeeds: jest.fn(),
}));

jest.mock('./NewStripCta', () => ({
  NewStripCta: ({ className }: { className?: string }) => (
    <a href="/new" className={className}>
      New
    </a>
  ),
}));

jest.mock('../../lib/constants', () => ({
  webappUrl: '/',
}));

const mockUseRouter = useRouter as jest.Mock;
const mockUseAuthContext = useAuthContext as jest.Mock;
const mockUseSettingsContext = useSettingsContext as jest.Mock;
const mockUseLogContext = useLogContext as jest.Mock;
const mockUseFeeds = useFeeds as jest.Mock;
const mockUseCustomDefaultFeed = useCustomDefaultFeed as jest.Mock;
const mockUseSortedFeeds = useSortedFeeds as jest.Mock;

const scrollIntoView = jest.fn();

const createFeedEdges = () => [
  {
    node: {
      id: 'feed-1',
      slug: 'frontend',
      flags: { name: 'Frontend' },
    },
  },
  {
    node: {
      id: 'feed-2',
      slug: 'backend',
      flags: { name: 'Backend' },
    },
  },
];

const mockRouterPath = (asPath: string) => {
  mockUseRouter.mockReturnValue({
    asPath,
    pathname: asPath,
    query: {},
  });
};

describe('UnifiedMobileFeedNav', () => {
  beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    scrollIntoView.mockClear();
    mockRouterPath('/game-center');
    mockUseAuthContext.mockReturnValue({ isLoggedIn: true });
    mockUseSettingsContext.mockReturnValue({
      optOutAchievements: false,
      optOutLevelSystem: false,
      optOutQuestSystem: false,
    });
    mockUseLogContext.mockReturnValue({ logEvent: jest.fn() });
    mockUseCustomDefaultFeed.mockReturnValue({
      isCustomDefaultFeed: false,
      defaultFeedId: 'user-1',
    });
    mockUseSortedFeeds.mockImplementation(
      ({ edges }: { edges?: unknown[] }) => edges ?? [],
    );
    mockUseFeeds.mockReturnValue({ feeds: { edges: createFeedEdges() } });
  });

  it('renders the final Game Center chip', () => {
    render(<UnifiedMobileFeedNav />);

    expect(screen.getByRole('link', { name: 'Game Center' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('renders the For you chip for logged-in users', () => {
    mockRouterPath('/');

    render(<UnifiedMobileFeedNav />);

    expect(screen.getByRole('link', { name: 'For you' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('renders logged-out navigation without logged-in chips', () => {
    mockRouterPath('/');
    mockUseAuthContext.mockReturnValue({ isLoggedIn: false });

    render(<UnifiedMobileFeedNav />);

    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(
      screen.queryByRole('link', { name: 'Game Center' }),
    ).not.toBeInTheDocument();
  });

  it('centers only when the active chip identity changes', async () => {
    const { rerender } = render(<UnifiedMobileFeedNav />);

    await waitFor(() => {
      expect(scrollIntoView).toHaveBeenCalledTimes(1);
    });

    mockUseFeeds.mockReturnValue({ feeds: { edges: createFeedEdges() } });
    rerender(<UnifiedMobileFeedNav />);

    expect(scrollIntoView).toHaveBeenCalledTimes(1);

    mockRouterPath('/posts');
    rerender(<UnifiedMobileFeedNav />);

    await waitFor(() => {
      expect(scrollIntoView).toHaveBeenCalledTimes(2);
    });
  });
});
