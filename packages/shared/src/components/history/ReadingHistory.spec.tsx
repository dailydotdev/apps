import React from 'react';
import { subDays } from 'date-fns';
import type { RenderResult } from '@testing-library/react';
import { fireEvent, render, screen } from '@testing-library/react';
import nock from 'nock';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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

beforeEach(() => {
  nock.cleanAll();
  jest.clearAllMocks();
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
            updateUser: jest.fn(),
            tokenRefreshed: true,
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
});

describe('PostItemCard component', () => {
  const onHide = jest.fn();

  const createdAt = new Date('202-10-22T07:15:51.247Z');
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
    await screen.findByText(defaultHistory.post.title);
  });

  it('should show view history post image', async () => {
    renderCard();
    await screen.findByAltText(defaultHistory.post.title);
  });

  it('should show view history post source image', async () => {
    renderCard();
    await screen.findByAltText(
      `source of ${defaultHistory.post.title}'s profile`,
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
