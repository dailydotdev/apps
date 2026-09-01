import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import { render, screen } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import type { PostHighlightFeed } from '../../graphql/highlights';
import type { Feature } from '../../lib/featureManagement';
import { featureSnapshotHighlightExpanded } from '../../lib/featureManagement';
import { HighlightItem } from './HighlightItem';

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

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: scrollIntoView,
  });
});

beforeEach(() => {
  scrollIntoView.mockClear();
});

const renderWithFlag = (feature: Feature<boolean>, defaultExpanded = false) => {
  const gb = new GrowthBook();
  gb.setFeatures({ [feature.id]: { defaultValue: true } });

  return render(
    <TestBootProvider client={new QueryClient()} gb={gb}>
      <HighlightItem defaultExpanded={defaultExpanded} highlight={highlight} />
    </TestBootProvider>,
  );
};

describe('HighlightItem', () => {
  it('should expand when the route-driven default changes after mount', () => {
    const { rerender } = render(<HighlightItem highlight={highlight} />);

    expect(screen.queryByText(summary)).not.toBeInTheDocument();

    rerender(<HighlightItem highlight={highlight} defaultExpanded />);

    expect(screen.getByText(summary)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /read more/i })).toHaveAttribute(
      'href',
      '/posts/post-1',
    );
    expect(scrollIntoView).toHaveBeenCalled();
  });

  it('leaves an expanded highlight without a snapshot while the flag is off', () => {
    render(<HighlightItem defaultExpanded highlight={highlight} />);

    expect(
      screen.queryByRole('button', { name: /snapshot/i }),
    ).not.toBeInTheDocument();
  });

  it('only offers the expanded snapshot once the highlight is open', () => {
    renderWithFlag(featureSnapshotHighlightExpanded);

    expect(
      screen.queryByRole('button', { name: /snapshot/i }),
    ).not.toBeInTheDocument();
  });

  it('offers the expanded snapshot beside Read more when open', () => {
    renderWithFlag(featureSnapshotHighlightExpanded, true);

    expect(screen.getByRole('button', { name: /snapshot/i })).toBeVisible();
    expect(screen.getByRole('button', { name: /copy link/i })).toBeVisible();
    expect(screen.getByRole('link', { name: /read more/i })).toBeVisible();
  });
});
