import React from 'react';
import type { RenderResult } from '@testing-library/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { PostItemCardProps } from '../post/PostItemCard';
import PostItemCard from '../post/PostItemCard';
import { ReadingHistoryRow } from './ReadingHistoryRow';
import type { ReadHistoryInfiniteData } from '../../hooks/useInfiniteReadingHistory';
import * as voteHooks from '../../hooks/vote/useVotePost';
import AuthContext from '../../contexts/AuthContext';
import user from '../../../__tests__/fixture/loggedUser';
import { getPostPath } from '../../lib/links';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { removeReadingHistoryEntry } from '../../hooks/useReadingHistory';
import post from '../../../__tests__/fixture/post';
import { SourceType } from '../../graphql/sources';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { LogEvent, Origin } from '../../lib/log';
import { ShareProvider } from '../../lib/share';

beforeEach(() => {
  nock.cleanAll();
  jest.clearAllMocks();
});

describe('ReadingHistoryRow component', () => {
  const timestamp = new Date('2026-10-13T07:15:51.247Z');
  const item = {
    timestamp,
    timestampDb: timestamp,
    post: { ...post, id: 'p1', numUpvotes: 12 },
  };

  const renderRow = (
    props: Partial<React.ComponentProps<typeof ReadingHistoryRow>> = {},
  ): RenderResult =>
    render(
      <TestBootProvider client={new QueryClient()}>
        <ReadingHistoryRow item={item} onHide={jest.fn()} {...props} />
      </TestBootProvider>,
    );

  it('should link to the post and show its source and read time', async () => {
    renderRow();
    const link = await screen.findByTitle(post.title as string);
    expect(link).toHaveAttribute('href', getPostPath(item.post));
    expect(
      screen.getByText(`${post.source?.name} · ${post.readTime}m read`),
    ).toBeInTheDocument();
  });

  it('should select instead of opening the post in the reader column', async () => {
    const onSelect = jest.fn();
    renderRow({ onSelect });
    const link = await screen.findByTitle(post.title as string);
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    fireEvent(link, click);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(click.defaultPrevented).toBe(true);
  });

  it('should leave a modified click to the browser', async () => {
    const onSelect = jest.fn();
    renderRow({ onSelect });
    const link = await screen.findByTitle(post.title as string);
    fireEvent.click(link, { metaKey: true });
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('should hold every action in the menu', async () => {
    const onHide = jest.fn().mockResolvedValue(undefined);
    renderRow({ onHide });
    fireEvent.keyDown(await screen.findByTestId('post-item-p1'), { key: ' ' });
    await screen.findByText('Upvote');
    [
      'Downvote',
      'Copy link',
      'Share post via...',
      'Save to bookmarks',
      'Save to folder',
    ].forEach((label) => expect(screen.getByText(label)).toBeInTheDocument());
    fireEvent.click(screen.getByText('Remove post'));
    expect(onHide).toHaveBeenCalledTimes(1);
  });
});

describe('removeReadingHistoryEntry', () => {
  it('should remove the read from the list and from every search over it', () => {
    const client = new QueryClient();
    const key = generateQueryKey(RequestKey.ReadingHistory, user);
    const timestamp = new Date('2026-10-13T07:15:51.247Z');
    const data = (ids: string[]): ReadHistoryInfiniteData => ({
      pages: [
        {
          readHistory: {
            pageInfo: { hasNextPage: false, endCursor: '' },
            edges: ids.map((id) => ({
              node: {
                timestamp,
                timestampDb: timestamp,
                post: { ...post, id },
              },
            })),
          },
        },
      ],
      pageParams: [],
    });
    client.setQueryData(key, data(['p1', 'p2']));
    client.setQueryData([...key, 'react'], data(['p2']));

    const rollback = removeReadingHistoryEntry(client, user, {
      postId: 'p2',
      timestamp: new Date(timestamp.toISOString()),
    });

    const ids = (queryKey: unknown[]) =>
      client
        .getQueryData<ReadHistoryInfiniteData>(queryKey)
        ?.pages[0].readHistory.edges.map(({ node }) => node.post.id);
    expect(ids(key)).toEqual(['p1']);
    expect(ids([...key, 'react'])).toEqual([]);

    rollback();
    expect(ids(key)).toEqual(['p1', 'p2']);
    expect(ids([...key, 'react'])).toEqual(['p2']);
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
          isTokenValid: true,
          getRedirectUri: jest.fn(),
          isLoggedIn: true,
          closeLogin: jest.fn(),
          isAuthReady: true,
          isAuthReadyOrCached: true,
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

  it('should copy the post link and log it as a share from history', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    const logEvent = jest.fn();
    const onRowClick = jest.fn();

    render(
      <TestBootProvider client={new QueryClient()} log={{ logEvent }}>
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div onClick={onRowClick}>
          <PostItemCard
            postItem={defaultHistory}
            logOrigin={Origin.History}
            showCopyLink
          />
        </div>
      </TestBootProvider>,
    );

    fireEvent.click(await screen.findByLabelText('Copy link'));

    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith(post.commentsPermalink),
    );
    expect(onRowClick).not.toHaveBeenCalled();
    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: LogEvent.SharePost,
        target_id: post.id,
        extra: expect.stringContaining(
          `"provider":"${ShareProvider.CopyLink}","origin":"${Origin.History}"`,
        ),
      }),
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
              isTokenValid: true,
              getRedirectUri: jest.fn(),
              isLoggedIn: true,
              closeLogin: jest.fn(),
              isAuthReady: true,
              isAuthReadyOrCached: true,
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
