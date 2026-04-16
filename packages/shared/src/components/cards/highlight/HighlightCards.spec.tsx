import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HighlightGrid } from './HighlightGrid';
import { HighlightList } from './HighlightList';

jest.mock('../../../lib/constants', () => ({
  webappUrl: '/',
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

describe('Highlight cards', () => {
  it('should render the grid card with highlight links', () => {
    render(<HighlightGrid highlights={highlights} />);

    expect(screen.getByText('Happening Now')).toBeInTheDocument();
    expect(screen.getByText('The first highlight')).toBeInTheDocument();
    expect(screen.getByText('The second highlight')).toBeInTheDocument();
    expect(screen.getByText('Read all')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /the first highlight/i }),
    ).toHaveAttribute('href', '/highlights?highlight=highlight-1');
    expect(screen.getByLabelText('Read all highlights')).toHaveAttribute(
      'href',
      '/highlights?highlight=highlight-1',
    );
  });

  it('should render the list card with highlight links', () => {
    render(<HighlightList highlights={highlights} />);

    expect(screen.getByText('The first highlight')).toBeInTheDocument();
    expect(screen.getByText('The second highlight')).toBeInTheDocument();
    expect(screen.getByText('Read all')).toBeInTheDocument();
  });

  it('should trigger the highlight callbacks without blocking navigation', async () => {
    const onHighlightClick = jest.fn();
    const onReadAllClick = jest.fn();

    render(
      <HighlightGrid
        highlights={highlights}
        onHighlightClick={onHighlightClick}
        onReadAllClick={onReadAllClick}
      />,
    );

    await userEvent.click(
      screen.getByRole('link', { name: /the first highlight/i }),
    );
    await userEvent.click(screen.getByLabelText('Read all highlights'));

    expect(onHighlightClick).toHaveBeenCalledWith(highlights[0], 1);
    expect(onReadAllClick).toHaveBeenCalledTimes(1);
  });
});
