import React from 'react';
import nock from 'nock';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import basePost from '../../../../__tests__/fixture/post';
import loggedUser from '../../../../__tests__/fixture/loggedUser';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import {
  completeActionMock,
  mockGraphQL,
} from '../../../../__tests__/helpers/graphql';
import {
  BOOKMARKS_FEED_QUERY,
  BookmarkSort,
  baseFeedSupportedTypes,
} from '../../../graphql/feed';
import { ADD_BOOKMARKS_MUTATION } from '../../../graphql/posts';
import { ActionType } from '../../../graphql/actions';
import { useBookmarkPost } from '../../../hooks/useBookmarkPost';
import { getPostPath } from '../../../lib/links';
import { Origin } from '../../../lib/log';
import { FeedWidgetKind, FeedWidgetSize } from '../types';
import { ReadingListWidget } from './ReadingListWidget';

const bookmarks = ['Newest bookmark', 'Second bookmark', 'Oldest bookmark'].map(
  (title, index) => ({
    ...basePost,
    id: `bookmark-${index}`,
    title,
  }),
);

const mockBookmarks = (posts = bookmarks) =>
  mockGraphQL({
    request: {
      query: BOOKMARKS_FEED_QUERY,
      variables: {
        loggedIn: true,
        first: 12,
        sort: BookmarkSort.TimeDesc,
        supportedTypes: baseFeedSupportedTypes,
      },
    },
    result: {
      data: {
        page: {
          pageInfo: { hasNextPage: false, endCursor: null },
          edges: posts.map((node) => ({ node })),
        },
      },
    },
  });

const BookmarkButton = ({ post }: { post: typeof basePost }) => {
  const { toggleBookmark } = useBookmarkPost();

  return (
    <button
      type="button"
      onClick={() => toggleBookmark({ post, origin: Origin.Feed })}
    >
      Bookmark
    </button>
  );
};

const renderWidget = (
  size = FeedWidgetSize.Tall,
  user: typeof loggedUser | null = loggedUser,
  postToBookmark?: typeof basePost,
) =>
  render(
    <TestBootProvider
      client={new QueryClient()}
      auth={{ user: user ?? undefined, isLoggedIn: !!user }}
    >
      <ReadingListWidget
        widget={{ id: 'reading', kind: FeedWidgetKind.ReadingList, size }}
        size={size}
        isEditing={false}
        onConfigChange={() => false}
        canConfigure={false}
        isConfiguring={false}
        onConfigureEnd={() => undefined}
      />
      {postToBookmark && <BookmarkButton post={postToBookmark} />}
    </TestBootProvider>,
  );

beforeEach(() => {
  nock.cleanAll();
});

describe('ReadingListWidget', () => {
  it('lists the latest bookmarks, linking to each post and to the rest', async () => {
    mockBookmarks();

    renderWidget();

    expect(
      await screen.findByRole('link', { name: /Newest bookmark/ }),
    ).toHaveAttribute('href', getPostPath(bookmarks[0]));
    expect(screen.getByText('Oldest bookmark')).toBeInTheDocument();
    // The whole list fit in one page, so the count is exact.
    expect(screen.getByText(`${bookmarks.length}`)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View all' })).toHaveAttribute(
      'href',
      expect.stringMatching(/bookmarks$/),
    );
  });

  it('says so when nothing is bookmarked yet', async () => {
    mockBookmarks([]);

    renderWidget();

    expect(await screen.findByText(/Nothing saved yet/)).toBeInTheDocument();
  });

  it('shows a post bookmarked elsewhere on the page', async () => {
    const post = { ...basePost, id: 'just-saved', title: 'Just saved' };
    mockBookmarks();

    renderWidget(FeedWidgetSize.Tall, loggedUser, post);

    await screen.findByText('Newest bookmark');
    mockGraphQL({
      request: {
        query: ADD_BOOKMARKS_MUTATION,
        variables: { data: { postIds: [post.id] } },
      },
      result: { data: { addBookmarks: [] } },
    });
    mockGraphQL(completeActionMock({ action: ActionType.BookmarkPost }));
    mockBookmarks([post, ...bookmarks]);
    fireEvent.click(screen.getByRole('button', { name: 'Bookmark' }));

    expect(await screen.findByText('Just saved')).toBeInTheDocument();
  });

  it('asks nothing of the API for a logged-out reader', async () => {
    mockBookmarks();

    renderWidget(FeedWidgetSize.Tall, null);

    expect(screen.getByText(/Nothing saved yet/)).toBeInTheDocument();
    await new Promise((resolve) => {
      setTimeout(resolve, 50);
    });
    expect(nock.isDone()).toBe(false);
  });
});
