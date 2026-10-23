import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import type { HighlightsPageData } from '../../graphql/highlights';
import { HIGHLIGHTS_PAGE_QUERY_KEY } from '../../graphql/highlights';
import { useLaptopLayout } from '../../hooks/layout/useLaptopLayout';
import { HighlightsPage } from './HighlightsPage';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../hooks/layout/useLaptopLayout', () => ({
  useLaptopLayout: jest.fn(),
}));

const mockUseLaptopLayout = useLaptopLayout as jest.Mock;

const pageData: HighlightsPageData = {
  majorHeadlines: {
    pageInfo: { endCursor: '', hasNextPage: false },
    edges: [
      {
        node: {
          id: 'highlight-1',
          channel: 'security',
          headline: 'The first highlight',
          highlightedAt: '2026-04-05T09:00:00.000Z',
          post: {
            id: 'post-1',
            type: 'article',
            commentsPermalink: '/posts/post-1',
          },
        },
      },
    ],
  } as HighlightsPageData['majorHeadlines'],
  channelConfigurations: [
    { channel: 'security', displayName: 'Security', color: 'red' },
  ],
};

const renderComponent = (pathname = '/highlights') => {
  jest.mocked(useRouter).mockReturnValue({
    pathname,
    asPath: pathname,
    query: {},
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn().mockResolvedValue(undefined),
  } as unknown as NextRouter);

  const client = new QueryClient();
  client.setQueryData(HIGHLIGHTS_PAGE_QUERY_KEY, pageData);

  return render(
    <TestBootProvider client={client}>
      <HighlightsPage />
    </TestBootProvider>,
  );
};

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: jest.fn(),
  });
});

describe('HighlightsPage', () => {
  it('should render the gradient title and no page-header strip on tablet', () => {
    mockUseLaptopLayout.mockReturnValue(false);
    renderComponent();

    expect(
      screen.queryByRole('navigation', { name: 'Highlights channels' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Happening Now' }),
    ).toHaveClass('feed-highlights-title-gradient');
  });

  it('should move the channel tabs into the page-header strip on laptop', () => {
    mockUseLaptopLayout.mockReturnValue(true);
    renderComponent();

    const nav = screen.getByRole('navigation', { name: 'Highlights channels' });
    expect(nav).toBeInTheDocument();
    expect(screen.getByLabelText('Show Headlines highlights')).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByLabelText('Show Security highlights')).toHaveAttribute(
      'href',
      '/highlights/security',
    );
    expect(
      screen.getByRole('heading', { level: 1, name: 'Happening Now' }),
    ).toHaveClass('sr-only');
    expect(screen.getByText('The first highlight')).toBeInTheDocument();
  });
});
