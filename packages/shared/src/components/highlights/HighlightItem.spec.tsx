import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import type { PostHighlightFeed } from '../../graphql/highlights';
import { featureHappeningNowShare } from '../../lib/featureManagement';
import { LogEvent, Origin, TargetType } from '../../lib/log';
import { ShareProvider } from '../../lib/share';
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

const renderWithSnapshot = (defaultExpanded = false, logEvent = jest.fn()) => {
  const gb = new GrowthBook();
  gb.setFeatures({
    [featureHappeningNowShare.id]: { defaultValue: true },
  });

  return render(
    <TestBootProvider client={new QueryClient()} gb={gb} log={{ logEvent }}>
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

  it('keeps an expanded highlight free of share controls while the flag is off', () => {
    render(<HighlightItem defaultExpanded highlight={highlight} />);

    expect(
      screen.queryByRole('button', { name: /snapshot/i }),
    ).not.toBeInTheDocument();
  });

  it('offers nothing on a collapsed row even with the flag on', () => {
    renderWithSnapshot();

    expect(
      screen.queryByRole('button', { name: /snapshot/i }),
    ).not.toBeInTheDocument();
  });

  it('offers snapshot and copy link beside Read more when expanded', () => {
    renderWithSnapshot(true);

    expect(screen.getByRole('button', { name: /snapshot/i })).toBeVisible();
    expect(screen.getByRole('button', { name: /copy link/i })).toBeVisible();
    expect(screen.getByRole('link', { name: /read more/i })).toBeVisible();
  });

  it('logs a copied link as a share of the highlighted post', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
    });
    const logEvent = jest.fn();
    renderWithSnapshot(true, logEvent);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /copy link/i }));
    });

    const [[event]] = logEvent.mock.calls;
    expect(event).toMatchObject({
      event_name: LogEvent.SharePost,
      target_id: 'post-1',
      target_type: TargetType.Post,
    });
    expect(JSON.parse(event.extra)).toEqual({
      provider: ShareProvider.CopyLink,
      origin: Origin.HappeningNowHighlight,
      highlight_id: 'highlight-1',
    });
  });
});
