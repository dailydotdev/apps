import React from 'react';
import { subDays } from 'date-fns';
import type { RenderResult } from '@testing-library/react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import nock from 'nock';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import type { PostItemCardProps } from '../post/PostItemCard';
import PostItemCard from '../post/PostItemCard';
import type { ReadHistoryListProps } from './ReadingHistoryList';
import ReadHistoryList from './ReadingHistoryList';
import type { ReadHistoryInfiniteData } from '../../hooks/useInfiniteReadingHistory';
import * as voteHooks from '../../hooks/vote/useVotePost';
import AuthContext from '../../contexts/AuthContext';
import user from '../../../__tests__/fixture/loggedUser';
import { getLabel } from '../../lib/dateFormat.spec';
import post from '../../../__tests__/fixture/post';
import { SourceType } from '../../graphql/sources';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import {
  featureShareHistory,
  featureSharingVisibility,
} from '../../lib/featureManagement';
import type { ToastNotification } from '../../hooks/useToastNotification';
import { TOAST_NOTIF_KEY } from '../../hooks/useToastNotification';
import { ShareProvider } from '../../lib/share';
import { LogEvent, Origin } from '../../lib/log';
import { shouldUseNativeShare } from '../../lib/func';

jest.mock('../../lib/func', () => {
  const actual = jest.requireActual('../../lib/func');
  return {
    __esModule: true,
    ...actual,
    shouldUseNativeShare: jest.fn(() => false),
  };
});

// The row share passes a referral cid, which routes the link through
// `useGetShortUrl`. Resolve it to the original URL here so these tests stay
// about the copy/share flow; short-link resolution is covered by that hook.
jest.mock('../../hooks/utils/useGetShortUrl', () => {
  const actual = jest.requireActual('../../hooks/utils/useGetShortUrl');
  return {
    __esModule: true,
    ...actual,
    useGetShortUrl: () => ({
      getShortUrl: async (url: string) => url,
      getTrackedUrl: (url: string) => url,
      shareLink: '',
      isLoading: false,
    }),
  };
});

const shouldUseNativeShareMock = shouldUseNativeShare as jest.Mock;
const writeText = jest.fn().mockResolvedValue(undefined);

beforeEach(() => {
  nock.cleanAll();
  jest.clearAllMocks();
  Object.assign(navigator, { clipboard: { writeText } });
});

describe('ReadingHistoryList component', () => {
  const createdAtToday = new Date();
  const createdAtYesterday = subDays(createdAtToday, 1);
  const currentYear = createdAtToday.getFullYear();
  const createdThisYear = new Date(`${currentYear}-03-31 07:15:51.247`);
  const createdAtDifferentYear = new Date('2018-03-31 07:15:51.247');
  const timestamps = [
    createdAtToday,
    createdAtYesterday,
    createdThisYear,
    createdAtDifferentYear,
  ];
  const sorted = timestamps.sort((a, b) => a.getTime() - b.getTime());
  const defaultReadingHistory: ReadHistoryInfiniteData = {
    pages: [
      {
        readHistory: {
          pageInfo: { hasNextPage: true, endCursor: '' },
          edges: sorted.map((timestamp, index) => ({
            node: { timestamp, post: { ...post, id: `p${index}` } },
          })),
        },
      },
    ],
    pageParams: [],
  };
  const onHide = jest.fn();
  const infiniteScrollRef = jest.fn();
  const props: ReadHistoryListProps = {
    data: defaultReadingHistory,
    infiniteScrollRef,
    onHide,
  };

  const renderComponent = (): RenderResult => {
    const client = new QueryClient();

    return render(
      <QueryClientProvider client={client}>
        <AuthContext.Provider
          value={{
            user,
            shouldShowLogin: false,
            showLogin: jest.fn(),
            isLoggedIn: true,
            closeLogin: jest.fn(),
            logout: jest.fn(),
            updateUser: jest.fn(),
            tokenRefreshed: true,
            getRedirectUri: jest.fn(),
            isAuthReady: true,
          }}
        >
          <ReadHistoryList {...props} />
        </AuthContext.Provider>
      </QueryClientProvider>,
    );
  };

  it('should show date section for reads today', async () => {
    renderComponent();
    await screen.findByText('Today');
  });

  it('should show date section for reads yesterday', async () => {
    renderComponent();
    await screen.findByText('Yesterday');
  });

  it('should show date section for reads of the same year', async () => {
    const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][
      createdThisYear.getDay()
    ];
    renderComponent();
    const label = getLabel(createdThisYear) || `${weekday}, 31 Mar`;
    await screen.findByText(label);
  });

  it('should show date section for reads of the different year', async () => {
    renderComponent();
    await screen.findByText('Sat, 31 Mar 2018');
  });

  it('should show Share article when menu is open', async () => {
    renderComponent();
    const button = await screen.findByTestId('post-item-p1');
    fireEvent.keyDown(button, {
      key: ' ',
    });
    await screen.findByText('Share post via...');
  });

  it('should show Save to bookmarks when menu is open', async () => {
    renderComponent();
    const button = await screen.findByTestId('post-item-p1');
    fireEvent.keyDown(button, {
      key: ' ',
    });
    await screen.findByText('Save to bookmarks');
  });

  describe('copy link action (share_history)', () => {
    const logEvent = jest.fn();

    const setupWithFlags = ({
      sharingVisibility = true,
      shareHistory = true,
    } = {}) => {
      const client = new QueryClient();
      const gb = new GrowthBook();
      gb.setFeatures({
        [featureSharingVisibility.id]: { defaultValue: sharingVisibility },
        [featureShareHistory.id]: { defaultValue: shareHistory },
      });

      render(
        <TestBootProvider
          client={client}
          gb={gb}
          auth={{ user }}
          log={{ logEvent }}
        >
          <ReadHistoryList {...props} />
        </TestBootProvider>,
      );

      return client;
    };

    it('should not render the copy action when the flags are off', async () => {
      renderComponent();
      await screen.findByTestId('post-item-p1');
      expect(screen.queryByLabelText('Copy link')).not.toBeInTheDocument();
    });

    it('should not render the copy action when only share_history is on (master kill-switch off)', async () => {
      setupWithFlags({ sharingVisibility: false, shareHistory: true });
      await screen.findByTestId('post-item-p1');
      expect(screen.queryByLabelText('Copy link')).not.toBeInTheDocument();
    });

    it('should render one copy action per row when both flags are on', async () => {
      setupWithFlags();
      const buttons = await screen.findAllByLabelText('Copy link');
      expect(buttons).toHaveLength(
        defaultReadingHistory.pages[0].readHistory.edges.length,
      );
    });

    it('should copy the post link, show a toast and log SharePost on click', async () => {
      const client = setupWithFlags();
      const [button] = await screen.findAllByLabelText('Copy link');

      await act(async () => {
        fireEvent.click(button);
      });

      await waitFor(() =>
        expect(writeText).toHaveBeenCalledWith(post.commentsPermalink),
      );
      await waitFor(() => {
        const toast = client.getQueryData<ToastNotification>(TOAST_NOTIF_KEY);
        expect(toast?.message).toEqual('✅ Copied link to clipboard');
      });
      expect(logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event_name: LogEvent.SharePost,
          target_id: 'p0',
          extra: JSON.stringify({
            provider: ShareProvider.CopyLink,
            origin: Origin.History,
          }),
        }),
      );
    });
  });
});

describe('PostItemCard component', () => {
  const onHide = jest.fn();

  const createdAt = new Date('202-10-22T07:15:51.247Z');
  const postTitle = post.title ?? '';
  const defaultHistory = {
    timestamp: createdAt,
    timestampDb: createdAt,
    post,
  };

  const renderCard = (props: Partial<PostItemCardProps> = {}) =>
    render(
      <AuthContext.Provider
        value={{
          user,
          shouldShowLogin: false,
          showLogin: jest.fn(),
          logout: jest.fn(),
          updateUser: jest.fn(),
          tokenRefreshed: true,
          getRedirectUri: jest.fn(),
          isLoggedIn: true,
          closeLogin: jest.fn(),
          isAuthReady: true,
        }}
      >
        <QueryClientProvider client={new QueryClient()}>
          <PostItemCard postItem={defaultHistory} {...props} />
        </QueryClientProvider>
      </AuthContext.Provider>,
    );

  it('should show view history post title', async () => {
    renderCard();
    await screen.findByText(postTitle);
  });

  it('should show view history post image', async () => {
    renderCard();
    await screen.findByAltText(postTitle);
  });

  it('should show view history post source image', async () => {
    renderCard();
    await screen.findByAltText(
      `source of ${defaultHistory.post.title}'s profile`,
    );
  });

  it('should fall back to the source image when a user-source author is missing', async () => {
    renderCard({
      postItem: {
        ...defaultHistory,
        post: {
          ...defaultHistory.post,
          author: undefined,
          source: {
            ...(defaultHistory.post.source as NonNullable<
              typeof defaultHistory.post.source
            >),
            type: SourceType.User,
          },
        },
      },
    });

    const sourceImage = await screen.findByAltText(
      `source of ${postTitle}'s profile`,
    );
    expect(sourceImage).toHaveAttribute(
      'src',
      defaultHistory.post.source?.image,
    );
  });

  it('should call onHide on close button clicked', async () => {
    renderCard({ onHide });
    const button = (await screen.findAllByRole('button'))[0];
    fireEvent.click(button);
    expect(onHide).toHaveBeenCalledWith({
      postId: defaultHistory.post.id,
      timestamp: defaultHistory.timestamp,
    });
  });

  it('should not render the copy link action unless opted in', async () => {
    renderCard({ showVoteActions: true });
    await screen.findByText(postTitle);
    expect(screen.queryByLabelText('Copy link')).not.toBeInTheDocument();
  });

  it('should copy the post link when the copy action is clicked', async () => {
    renderCard({ showVoteActions: true, showCopyLink: true });
    const button = await screen.findByLabelText('Copy link');

    await act(async () => {
      fireEvent.click(button);
    });

    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith(
        defaultHistory.post.commentsPermalink,
      ),
    );
  });

  it('should open the native share sheet on mobile instead of copying', async () => {
    shouldUseNativeShareMock.mockReturnValueOnce(true);
    const share = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { share });

    renderCard({ showVoteActions: true, showCopyLink: true });
    const button = await screen.findByLabelText('Copy link');

    await act(async () => {
      fireEvent.click(button);
    });

    await waitFor(() =>
      expect(share).toHaveBeenCalledWith({
        text: expect.stringContaining(defaultHistory.post.commentsPermalink),
      }),
    );
    expect(writeText).not.toHaveBeenCalled();
  });

  it('should not bubble vote clicks to parent handlers', async () => {
    const onClick = jest.fn();
    const onKeyDown = jest.fn();
    const toggleUpvote = jest.fn().mockResolvedValue(undefined);
    const useVotePostSpy = jest
      .spyOn(voteHooks, 'useVotePost')
      .mockImplementation(() => ({
        upvotePost: jest.fn().mockResolvedValue(undefined),
        downvotePost: jest.fn().mockResolvedValue(undefined),
        cancelPostVote: jest.fn().mockResolvedValue(undefined),
        toggleUpvote,
        toggleDownvote: jest.fn().mockResolvedValue(undefined),
      }));

    try {
      render(
        <div role="button" tabIndex={0} onClick={onClick} onKeyDown={onKeyDown}>
          <AuthContext.Provider
            value={{
              user,
              shouldShowLogin: false,
              showLogin: jest.fn(),
              logout: jest.fn(),
              updateUser: jest.fn(),
              tokenRefreshed: true,
              getRedirectUri: jest.fn(),
              isLoggedIn: true,
              closeLogin: jest.fn(),
              isAuthReady: true,
            }}
          >
            <QueryClientProvider client={new QueryClient()}>
              <PostItemCard postItem={defaultHistory} showVoteActions />
            </QueryClientProvider>
          </AuthContext.Provider>
        </div>,
      );

      const [upvoteButton] = screen.getAllByRole('button', { pressed: false });
      fireEvent.click(upvoteButton);

      expect(toggleUpvote).toHaveBeenCalledWith({
        payload: defaultHistory.post,
        origin: 'feed',
      });
      expect(onClick).not.toHaveBeenCalled();
      expect(onKeyDown).not.toHaveBeenCalled();
    } finally {
      useVotePostSpy.mockRestore();
    }
  });
});
