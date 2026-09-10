import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import type { PostHighlightFeed } from '../../graphql/highlights';
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
    source: { name: 'The Pragmatic Engineer', image: 'https://img/source' },
  },
};

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: scrollIntoView,
  });
  // jsdom has no layout, and the quote bar refuses a selection it cannot place.
  Range.prototype.getBoundingClientRect = () =>
    ({ top: 400, bottom: 440, left: 100, width: 300 } as DOMRect);
});

beforeEach(() => {
  scrollIntoView.mockClear();
});

const renderItem = (defaultExpanded = false, logEvent = jest.fn()) => {
  const client = new QueryClient();
  const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
    <TestBootProvider client={client} log={{ logEvent }}>
      {children}
    </TestBootProvider>
  );

  return render(
    <HighlightItem defaultExpanded={defaultExpanded} highlight={highlight} />,
    { wrapper },
  );
};

describe('HighlightItem', () => {
  it('should expand when the route-driven default changes after mount', () => {
    const { rerender } = renderItem();

    expect(screen.queryByText(summary)).not.toBeInTheDocument();

    rerender(<HighlightItem highlight={highlight} defaultExpanded />);

    expect(screen.getByText(summary)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /read more/i })).toHaveAttribute(
      'href',
      '/posts/post-1',
    );
    expect(scrollIntoView).toHaveBeenCalled();
  });

  it('offers nothing on a collapsed row', () => {
    renderItem();

    expect(
      screen.queryByRole('button', { name: /snapshot/i }),
    ).not.toBeInTheDocument();
  });

  it('offers snapshot and copy link beside Read more when expanded', () => {
    renderItem(true);

    expect(screen.getByRole('button', { name: /snapshot/i })).toBeVisible();
    expect(screen.getByRole('button', { name: /copy link/i })).toBeVisible();
    expect(screen.getByRole('link', { name: /read more/i })).toBeVisible();
  });

  it('copies and logs the highlighted post link', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    const logEvent = jest.fn();
    renderItem(true, logEvent);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /copy link/i }));
    });

    // The same link the feed card's row copies for this highlight.
    expect(writeText).toHaveBeenCalledWith('/posts/post-1');
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

  it('labels and credits the TLDR snapshot', () => {
    renderItem(true);

    // Focus arms the off-screen card the capture reads.
    fireEvent.focus(screen.getByRole('button', { name: /snapshot/i }));

    expect(screen.getByText('Happening now')).toBeInTheDocument();
    expect(screen.getByText('The Pragmatic Engineer')).toBeInTheDocument();
  });

  it('labels and credits a quote selected in the TLDR', () => {
    renderItem(true);
    const node = screen.getByText(summary).firstChild as Node;
    const range = document.createRange();
    range.setStart(node, 0);
    range.setEnd(node, node.textContent?.length ?? 0);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);

    fireEvent.pointerUp(document);

    expect(
      screen.getByRole('toolbar', { name: 'Share selected text' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Happening now')).toBeInTheDocument();
    expect(screen.getByText('The Pragmatic Engineer')).toBeInTheDocument();
  });
});
