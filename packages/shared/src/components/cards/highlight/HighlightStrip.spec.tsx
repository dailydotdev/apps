import React from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HighlightStrip } from './HighlightStrip';

jest.mock('../../../lib/constants', () => ({
  webappUrl: '/',
}));

jest.mock('./HighlightCardOptions', () => ({
  HighlightCardOptions: () => null,
}));

jest.mock('../../tooltip/Tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('../../tooltips/Portal', () => ({
  RootPortal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('../../../hooks/usePostById', () => ({
  usePostById: () => ({ post: null, isLoading: false }),
}));

const highlights = [
  {
    id: 'highlight-1',
    channel: 'agents',
    headline: 'The first highlight',
    highlightedAt: '2026-04-05T09:00:00.000Z',
    post: {
      id: 'post-1',
      commentsPermalink: '/posts/post-1',
    },
  },
  {
    id: 'highlight-2',
    channel: 'agents',
    headline: 'The second highlight',
    highlightedAt: '2026-04-05T08:00:00.000Z',
    post: {
      id: 'post-2',
      commentsPermalink: '/posts/post-2',
    },
  },
];

describe('HighlightStrip', () => {
  it('should render headlines and the View all anchor', () => {
    render(<HighlightStrip highlights={highlights} />);

    expect(screen.getByText('Happening Now')).toBeInTheDocument();
    expect(screen.getByText('The first highlight')).toBeInTheDocument();
    expect(screen.getByText('The second highlight')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view all/i })).toHaveAttribute(
      'href',
      '/highlights?highlight=highlight-1',
    );
  });

  it('should expose each highlight as an expandable button', () => {
    render(<HighlightStrip highlights={highlights} />);

    expect(
      screen.getByRole('button', { name: /expand: the first highlight/i }),
    ).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.getByRole('button', { name: /expand: the second highlight/i }),
    ).toHaveAttribute('aria-expanded', 'false');
  });

  it('should fire callbacks when an item is clicked', async () => {
    const onHighlightClick = jest.fn();
    const onReadAllClick = jest.fn();

    render(
      <HighlightStrip
        highlights={highlights}
        onHighlightClick={onHighlightClick}
        onReadAllClick={onReadAllClick}
      />,
    );

    await userEvent.click(
      screen.getByRole('button', { name: /expand: the first highlight/i }),
    );
    await userEvent.click(screen.getByRole('link', { name: /view all/i }));

    expect(onHighlightClick).toHaveBeenCalledWith(highlights[0], 1);
    expect(onReadAllClick).toHaveBeenCalledTimes(1);
  });

  it('should hide carousel arrows when there is nothing to scroll to', () => {
    render(<HighlightStrip highlights={highlights} />);

    expect(
      screen.queryByRole('button', { name: 'Previous highlights' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Next highlights' }),
    ).not.toBeInTheDocument();
  });

  it('should mark newly added highlights with the entry animation', () => {
    jest.useFakeTimers();
    try {
      const { rerender } = render(<HighlightStrip highlights={highlights} />);

      const newHighlight = {
        id: 'highlight-3',
        channel: 'agents',
        headline: 'A breaking highlight',
        highlightedAt: '2026-04-05T10:00:00.000Z',
        post: {
          id: 'post-3',
          commentsPermalink: '/posts/post-3',
        },
      };

      rerender(<HighlightStrip highlights={[newHighlight, ...highlights]} />);

      const button = screen.getByRole('button', {
        name: /expand: a breaking highlight/i,
      });
      const listItem = button.closest('li');
      expect(listItem).toHaveClass('animate-highlight-strip-enter');

      act(() => {
        jest.advanceTimersByTime(2700);
      });

      expect(listItem).not.toHaveClass('animate-highlight-strip-enter');
    } finally {
      jest.useRealTimers();
    }
  });

  it('should render nothing when there are no highlights', () => {
    const { container } = render(<HighlightStrip highlights={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('should render a skeleton state while loading without highlights', () => {
    render(<HighlightStrip highlights={[]} isLoading />);

    expect(screen.getByLabelText('Loading highlights')).toBeInTheDocument();
    expect(screen.queryByText('Happening Now')).not.toBeInTheDocument();
  });

  it('should expose the channel as a hover tag on each item', () => {
    render(<HighlightStrip highlights={highlights} />);

    expect(screen.getAllByText('Agents').length).toBe(highlights.length);
  });
});
