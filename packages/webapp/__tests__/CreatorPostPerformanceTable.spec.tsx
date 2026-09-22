import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { CreatorPostPerformance } from '@dailydotdev/shared/src/graphql/creatorAnalytics';
import {
  CreatorPostSortBy,
  CreatorPostSortOrder,
} from '@dailydotdev/shared/src/graphql/creatorAnalytics';
import { CreatorPostPerformanceTable } from '../components/analytics/creator/CreatorPostPerformanceTable';

const row = (
  partial: Partial<CreatorPostPerformance> = {},
): CreatorPostPerformance => ({
  id: 'p1',
  post: {
    id: 'p1',
    title: 'A post that exists',
    image: null,
    sharedPost: null,
    createdAt: '2026-09-01T00:00:00.000Z',
    commentsPermalink: 'https://app.daily.dev/posts/p1',
  },
  impressions: 1234,
  upvotes: 12,
  comments: 3,
  outboundVisits: 45,
  ...partial,
});

const renderTable = (
  props: Partial<React.ComponentProps<typeof CreatorPostPerformanceTable>> = {},
) => {
  const onSortChange = jest.fn();

  render(
    // Tooltip reads the request protocol off the query client, so even a
    // purely presentational render needs one.
    <QueryClientProvider client={new QueryClient()}>
      <CreatorPostPerformanceTable
        posts={[row()]}
        sort={{
          sortBy: CreatorPostSortBy.PublishedAt,
          order: CreatorPostSortOrder.Desc,
        }}
        onSortChange={onSortChange}
        isPending={false}
        hasNextPage={false}
        isFetchingNextPage={false}
        fetchNextPage={jest.fn()}
        {...props}
      />
    </QueryClientProvider>,
  );

  return { onSortChange };
};

describe('CreatorPostPerformanceTable', () => {
  it('should render an em dash rather than a zero for unknown impressions', () => {
    renderTable({ posts: [row({ impressions: null })] });

    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('should distinguish a real zero from an unknown value', () => {
    renderTable({ posts: [row({ impressions: 0 })] });

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.queryByText('—')).not.toBeInTheDocument();
  });

  it('should link the comment count straight to the discussion', () => {
    renderTable();

    expect(
      screen.getByRole('link', {
        name: 'Open the discussion on A post that exists',
      }),
    ).toHaveAttribute('href', 'https://app.daily.dev/posts/p1');
  });

  it('should render shared post titles and images for share rows', () => {
    renderTable({
      posts: [
        row({
          id: 'share1',
          post: {
            id: 'share1',
            title: null,
            image: 'https://daily.dev/generated-placeholder.jpg',
            sharedPost: {
              id: 'original1',
              title: 'Original article title',
              image: 'https://daily.dev/original-cover.jpg',
            },
            createdAt: '2026-09-02T00:00:00.000Z',
            commentsPermalink: 'https://app.daily.dev/posts/share1',
          },
        }),
      ],
    });

    const rowLink = screen.getByText('Original article title').closest('a');

    expect(rowLink).toHaveAttribute('href', '/posts/share1/analytics');
    expect(rowLink?.querySelector('img')).toHaveAttribute(
      'src',
      'https://daily.dev/original-cover.jpg',
    );
    expect(
      screen.getByRole('link', {
        name: 'Open the discussion on Original article title',
      }),
    ).toHaveAttribute('href', 'https://app.daily.dev/posts/share1');
  });

  it('should announce which column is sorted and in which direction', () => {
    renderTable({
      sort: {
        sortBy: CreatorPostSortBy.Impressions,
        order: CreatorPostSortOrder.Desc,
      },
    });

    expect(
      screen.getByRole('columnheader', { name: /impressions/i }),
    ).toHaveAttribute('aria-sort', 'descending');
    expect(
      screen.getByRole('columnheader', { name: /upvotes/i }),
    ).toHaveAttribute('aria-sort', 'none');
  });

  it('should start a newly picked column descending', async () => {
    const { onSortChange } = renderTable();

    await userEvent.click(screen.getByRole('button', { name: /upvotes/i }));

    expect(onSortChange).toHaveBeenCalledWith({
      sortBy: CreatorPostSortBy.Upvotes,
      order: CreatorPostSortOrder.Desc,
    });
  });

  it('should flip the direction when the active column is picked again', async () => {
    const { onSortChange } = renderTable({
      sort: {
        sortBy: CreatorPostSortBy.Upvotes,
        order: CreatorPostSortOrder.Desc,
      },
    });

    await userEvent.click(screen.getByRole('button', { name: /upvotes/i }));

    expect(onSortChange).toHaveBeenCalledWith({
      sortBy: CreatorPostSortBy.Upvotes,
      order: CreatorPostSortOrder.Asc,
    });
  });

  it('should be sortable from the keyboard', async () => {
    const { onSortChange } = renderTable();

    const header = screen.getByRole('button', { name: /comments/i });
    header.focus();
    await userEvent.keyboard('{Enter}');

    expect(onSortChange).toHaveBeenCalledWith({
      sortBy: CreatorPostSortBy.Comments,
      order: CreatorPostSortOrder.Desc,
    });
  });
});
