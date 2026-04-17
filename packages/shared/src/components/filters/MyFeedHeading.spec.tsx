import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { useAuthContext } from '../../contexts/AuthContext';
import { useActiveFeedNameContext } from '../../contexts';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { useActions, useFeedLayout, useViewSize, ViewSize } from '../../hooks';
import { useShortcutsUser } from '../../features/shortcuts/hooks/useShortcutsUser';
import { ActionType } from '../../graphql/actions';
import useCustomDefaultFeed from '../../hooks/feed/useCustomDefaultFeed';
import { getHasSeenTags, setHasSeenTags } from '../../lib/feedSettings';
import { SharedFeedPage } from '../utilities';
import MyFeedHeading from './MyFeedHeading';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));

jest.mock('../../contexts', () => ({
  useActiveFeedNameContext: jest.fn(),
}));

jest.mock('../../contexts/SettingsContext', () => ({
  useSettingsContext: jest.fn(),
}));

jest.mock('../../hooks', () => ({
  useActions: jest.fn(),
  useFeedLayout: jest.fn(),
  useViewSize: jest.fn(),
  ViewSize: {
    MobileL: 'mobile',
    Laptop: 'laptop',
  },
}));

jest.mock('../../features/shortcuts/hooks/useShortcutsUser', () => ({
  useShortcutsUser: jest.fn(),
}));

jest.mock('../../hooks/feed/useCustomDefaultFeed', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../AlertDot', () => ({
  AlertDot: ({ className }: { className?: string }) => (
    <div data-testid="alert-dot" className={className} />
  ),
  AlertColor: { Bun: 'bg-accent-bun-default' },
}));

jest.mock('../feeds/FeedSettingsButton', () => ({
  FeedSettingsButton: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick: () => void;
  }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}));

jest.mock('../../lib/constants', () => ({
  ...jest.requireActual('../../lib/constants'),
  webappUrl: 'https://app.daily.dev/',
  settingsUrl: 'https://app.daily.dev/settings',
}));

jest.mock('../../lib/feedSettings', () => ({
  getHasSeenTags: jest.fn(),
  setHasSeenTags: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;
const mockUseAuthContext = useAuthContext as jest.Mock;
const mockUseActiveFeedNameContext = useActiveFeedNameContext as jest.Mock;
const mockUseSettingsContext = useSettingsContext as jest.Mock;
const mockUseActions = useActions as jest.Mock;
const mockUseFeedLayout = useFeedLayout as jest.Mock;
const mockUseViewSize = useViewSize as jest.Mock;
const mockUseShortcutsUser = useShortcutsUser as jest.Mock;
const mockUseCustomDefaultFeed = useCustomDefaultFeed as jest.Mock;
const mockGetHasSeenTags = getHasSeenTags as jest.Mock;
const mockSetHasSeenTags = setHasSeenTags as jest.Mock;

const push = jest.fn();
const completeAction = jest.fn();

const renderComponent = () => render(<MyFeedHeading />);

describe('MyFeedHeading', () => {
  beforeEach(() => {
    push.mockReset();
    push.mockResolvedValue(true);
    completeAction.mockReset();
    completeAction.mockResolvedValue(undefined);
    mockGetHasSeenTags.mockReset();
    mockGetHasSeenTags.mockReturnValue(null);
    mockSetHasSeenTags.mockReset();

    mockUseRouter.mockReturnValue({
      push,
      pathname: '/',
      query: {},
    });
    mockUseAuthContext.mockReturnValue({
      user: { id: 'user-1' },
    });
    mockUseActiveFeedNameContext.mockReturnValue({
      feedName: SharedFeedPage.MyFeed,
    });
    mockUseSettingsContext.mockReturnValue({
      toggleShowTopSites: jest.fn(),
    });
    mockUseActions.mockReturnValue({
      completeAction,
      checkHasCompleted: jest.fn().mockReturnValue(false),
      isActionsFetched: true,
    });
    mockUseFeedLayout.mockReturnValue({
      shouldUseListFeedLayout: false,
    });
    mockUseViewSize.mockImplementation((size) => size === ViewSize.Laptop);
    mockUseShortcutsUser.mockReturnValue({
      isOldUserWithNoShortcuts: false,
      showToggleShortcuts: false,
    });
    mockUseCustomDefaultFeed.mockReturnValue({
      isCustomDefaultFeed: false,
      defaultFeedId: 'user-1',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('routes the home custom default feed to its edit page', async () => {
    mockUseCustomDefaultFeed.mockReturnValue({
      isCustomDefaultFeed: true,
      defaultFeedId: 'feed-1',
    });

    renderComponent();

    await userEvent.click(
      screen.getByRole('button', { name: 'Feed settings' }),
    );

    expect(push).toHaveBeenCalledWith(
      'https://app.daily.dev/feeds/feed-1/edit',
    );
  });

  it('routes the home For you feed to the user edit page with the tags tab open', async () => {
    renderComponent();

    await userEvent.click(
      screen.getByRole('button', { name: 'Feed settings' }),
    );

    expect(push).toHaveBeenCalledWith(
      'https://app.daily.dev/feeds/user-1/edit?dview=tags',
    );
  });

  it('routes the For you feed to the user edit page with the tags tab open', async () => {
    mockUseRouter.mockReturnValue({
      push,
      pathname: '/my-feed',
      query: {},
    });

    renderComponent();

    await userEvent.click(
      screen.getByRole('button', { name: 'Feed settings' }),
    );

    expect(push).toHaveBeenCalledWith(
      'https://app.daily.dev/feeds/user-1/edit?dview=tags',
    );
  });

  it('routes custom feeds to their slug or id edit page', async () => {
    mockUseRouter.mockReturnValue({
      push,
      pathname: '/feeds/[slugOrId]',
      query: { slugOrId: 'feed-2' },
    });
    mockUseActiveFeedNameContext.mockReturnValue({
      feedName: SharedFeedPage.Custom,
    });

    renderComponent();

    await userEvent.click(
      screen.getByRole('button', { name: 'Feed settings' }),
    );

    expect(push).toHaveBeenCalledWith(
      'https://app.daily.dev/feeds/feed-2/edit',
    );
  });

  it('shows the tags reminder dot for the For you feed when tags were not seen yet', () => {
    mockGetHasSeenTags.mockReturnValue(false);

    renderComponent();

    expect(screen.getByTestId('alert-dot')).toBeInTheDocument();
  });

  it('does not show the tags reminder dot for custom feeds', () => {
    mockGetHasSeenTags.mockReturnValue(false);
    mockUseRouter.mockReturnValue({
      push,
      pathname: '/feeds/[slugOrId]',
      query: { slugOrId: 'feed-2' },
    });
    mockUseActiveFeedNameContext.mockReturnValue({
      feedName: SharedFeedPage.Custom,
    });

    renderComponent();

    expect(screen.queryByTestId('alert-dot')).not.toBeInTheDocument();
  });

  it('marks tags as seen before navigating from the For you feed settings button', async () => {
    mockGetHasSeenTags.mockReturnValue(false);

    renderComponent();

    await userEvent.click(
      screen.getByRole('button', { name: 'Feed settings' }),
    );

    expect(mockSetHasSeenTags).toHaveBeenCalledWith('user-1', true);
    expect(completeAction).toHaveBeenCalledWith(ActionType.HasSeenTags);
    expect(push).toHaveBeenCalledWith(
      'https://app.daily.dev/feeds/user-1/edit?dview=tags',
    );
  });
});
