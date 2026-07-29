import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import type { PostHighlightFeed } from '../../graphql/highlights';
import { HighlightItem } from './HighlightItem';
import { TestBootProvider } from '../../../__tests__/helpers/boot';

const scrollIntoView = jest.fn();
const summary = 'A concise summary for the expanded highlight item.';

const highlight: PostHighlightFeed = {
  id: 'highlight-1',
  channel: 'agents',
  headline: 'The first highlight',
  highlightedAt: '2026-04-05T09:00:00.000Z',
  post: {
    id: 'post-1',
    type: 'article',
    commentsPermalink: '/posts/post-1',
    summary,
  },
};

// The expanded summary carries the selection share bar, which reads auth and
// react-query for its copy/share actions.
const renderItem = (props: { defaultExpanded?: boolean } = {}) =>
  render(
    <TestBootProvider client={new QueryClient()}>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <HighlightItem highlight={highlight} {...props} />
    </TestBootProvider>,
  );

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: scrollIntoView,
  });
});

beforeEach(() => {
  scrollIntoView.mockClear();
});

describe('HighlightItem', () => {
  it('should expand when the route-driven default changes after mount', () => {
    const { rerender } = renderItem();

    expect(screen.queryByText(summary)).not.toBeInTheDocument();

    rerender(
      <TestBootProvider client={new QueryClient()}>
        <HighlightItem highlight={highlight} defaultExpanded />
      </TestBootProvider>,
    );

    expect(screen.getByText(summary)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /read more/i })).toHaveAttribute(
      'href',
      '/posts/post-1',
    );
    expect(scrollIntoView).toHaveBeenCalled();
  });

  it('binds the share bar to the expanded summary, not the headline', () => {
    renderItem({ defaultExpanded: true });

    const summaryNode = screen.getByText(summary);
    const bound = summaryNode.closest('[data-selection-area]');

    expect(bound).not.toBeNull();
    expect(bound).not.toContainElement(
      screen.getByRole('button', { name: /the first highlight/i }),
    );
  });
});
