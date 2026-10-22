import React from 'react';
import nock from 'nock';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import basePost from '../../../../__tests__/fixture/post';
import loggedUser from '../../../../__tests__/fixture/loggedUser';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { mockGraphQL } from '../../../../__tests__/helpers/graphql';
import {
  BOOKMARKS_FEED_QUERY,
  BookmarkSort,
  BookmarkStatus,
  baseFeedSupportedTypes,
} from '../../../graphql/feed';
import { getPostPath } from '../../../lib/links';
import { FeedWidgetKind, FeedWidgetSize } from '../types';
import { ReadingListWidget } from './ReadingListWidget';

const bookmarks = ['First unread', 'Second unread', 'Third unread'].map(
  (title, index) => ({
    ...basePost,
    id: `bookmark-${index}`,
    title,
  }),
);

const mockUnreadBookmarks = (posts = bookmarks) =>
  mockGraphQL({
    request: {
      query: BOOKMARKS_FEED_QUERY,
      variables: {
        loggedIn: true,
        first: 8,
        sort: BookmarkSort.TimeDesc,
        status: BookmarkStatus.Unread,
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

const renderWidget = (
  size = FeedWidgetSize.Tall,
  user: typeof loggedUser | null = loggedUser,
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
    </TestBootProvider>,
  );

beforeEach(() => {
  nock.cleanAll();
});

describe('ReadingListWidget', () => {
  it('lists the unread bookmarks, linking to each post and to the rest', async () => {
    mockUnreadBookmarks();

    renderWidget();

    expect(
      await screen.findByRole('link', { name: 'First unread' }),
    ).toHaveAttribute('href', getPostPath(bookmarks[0]));
    expect(screen.getByText('Third unread')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /See all bookmarks/ }),
    ).toHaveAttribute('href', expect.stringMatching(/bookmarks$/));
  });

  it('shows only as many as fit the Small size', async () => {
    mockUnreadBookmarks();

    renderWidget(FeedWidgetSize.Small);

    expect(await screen.findByText('First unread')).toBeInTheDocument();
    expect(screen.queryByText('Second unread')).not.toBeInTheDocument();
  });

  it('says so when nothing is left to read', async () => {
    mockUnreadBookmarks([]);

    renderWidget();

    expect(await screen.findByText(/You're all caught up/)).toBeInTheDocument();
  });

  it('asks nothing of the API for a logged-out reader', async () => {
    mockUnreadBookmarks();

    renderWidget(FeedWidgetSize.Tall, null);

    expect(screen.getByText(/You're all caught up/)).toBeInTheDocument();
    await new Promise((resolve) => {
      setTimeout(resolve, 50);
    });
    expect(nock.isDone()).toBe(false);
  });
});
